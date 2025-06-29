import {Vertex} from "./vertex"
import {
    assert,
    ByteArrayInput,
    ByteArrayOutput,
    Checksum,
    Exec,
    int,
    isDefined,
    Listeners,
    Nullable,
    Option,
    panic,
    Procedure,
    SortedSet,
    Subscription,
    UUID
} from "lib-std"
import {Box} from "./box"
import {Address} from "./address"
import {PointerField} from "./pointer"
import {PrimitiveField, PrimitiveValues} from "./primitive"
import {Dispatchers, Propagation} from "./dispatchers"
import {DeleteUpdate, FieldUpdate, NewUpdate, PointerUpdate, PrimitiveUpdate, Update} from "./updates"
import {GraphEdges} from "./graph-edges"
import {ObjectField} from "./object"

export type BoxFactory<BoxMap> = (name: keyof BoxMap,
                                  graph: BoxGraph<BoxMap>,
                                  uuid: UUID.Format,
                                  constructor: Procedure<Box>) => Box

export interface TransactionListener {
    onBeginTransaction(): void
    onEndTransaction(): void
}

export interface UpdateListener {
    onUpdate(update: Update): void
}

export type Dependencies = { boxes: Iterable<Box>, pointers: Iterable<PointerField> }

export class BoxGraph<BoxMap = any> {
    readonly #boxFactory: Option<BoxFactory<BoxMap>>
    readonly #boxes: SortedSet<Readonly<Uint8Array>, Box>
    readonly #deferredPointerUpdates: Array<{ pointerField: PointerField, update: PointerUpdate }>
    readonly #updateListeners: Listeners<UpdateListener>
    readonly #immediateUpdateListeners: Listeners<UpdateListener>
    readonly #transactionListeners: Listeners<TransactionListener>
    readonly #dispatchers: Dispatchers<FieldUpdate>
    readonly #edges: GraphEdges
    readonly #finalizeTransactionObservers: Array<Exec>

    #inTransaction: boolean = false
    #constructingBox: boolean = false

    constructor(boxFactory: Option<BoxFactory<BoxMap>> = Option.None) {
        this.#boxFactory = boxFactory
        this.#boxes = UUID.newSet<Box>(box => box.address.uuid)
        this.#deferredPointerUpdates = []
        this.#dispatchers = Dispatchers.create()
        this.#updateListeners = new Listeners<UpdateListener>()
        this.#immediateUpdateListeners = new Listeners<UpdateListener>()
        this.#transactionListeners = new Listeners<TransactionListener>()
        this.#edges = new GraphEdges()
        this.#finalizeTransactionObservers = []
    }

    beginTransaction(): void {
        assert(!this.#inTransaction, "Transaction already in progress")
        this.#inTransaction = true
        this.#transactionListeners.proxy.onBeginTransaction()
    }

    endTransaction(): void {
        assert(this.#inTransaction, "No transaction in progress")
        this.#inTransaction = false
        this.resolvePointers()
        // it is possible that new observers will be added while executing
        while (this.#finalizeTransactionObservers.length > 0) {
            this.#finalizeTransactionObservers.splice(0).forEach(observer => observer())
            if (this.#finalizeTransactionObservers.length > 0) {
                console.debug(`${this.#finalizeTransactionObservers.length} new observers while notifying`)
            }
        }
        this.#transactionListeners.proxy.onEndTransaction()
    }

    inTransaction(): boolean {return this.#inTransaction}
    constructingBox(): boolean {return this.#constructingBox}

    resolvePointers(): void {
        if (this.#deferredPointerUpdates.length === 0) {return}
        this.#deferredPointerUpdates.forEach(({pointerField, update}) =>
            this.#processPointerValueUpdate(pointerField, update))
        this.#deferredPointerUpdates.length = 0
    }

    createBox(name: keyof BoxMap, uuid: UUID.Format, constructor: Procedure<Box>): void {
        this.#boxFactory.unwrap("No box-factory installed")(name as keyof BoxMap, this, uuid, constructor)
    }

    stageBox<B extends Box>(box: B, constructor?: Procedure<B>): B {
        this.#assertTransaction()
        assert(!this.#constructingBox, "Cannot construct box while other box is constructing")
        if (isDefined(constructor)) {
            this.#constructingBox = true
            constructor(box)
            this.#constructingBox = false
        }
        const added = this.#boxes.add(box)
        assert(added, `${box} already staged`)
        const update = new NewUpdate(box.address.uuid, box.name, box.toArrayBuffer())
        this.#updateListeners.proxy.onUpdate(update)
        this.#immediateUpdateListeners.proxy.onUpdate(update)
        return box
    }

    subscribeTransaction(listener: TransactionListener): Subscription {
        return this.#transactionListeners.subscribe(listener)
    }

    subscribeToAllUpdates(listener: UpdateListener): Subscription {
        return this.#updateListeners.subscribe(listener)
    }

    subscribeToAllUpdatesImmediate(listener: UpdateListener): Subscription {
        return this.#immediateUpdateListeners.subscribe(listener)
    }

    subscribeVertexUpdates(propagation: Propagation, address: Address, procedure: Procedure<Update>): Subscription {
        return this.#dispatchers.subscribe(propagation, address, procedure)
    }

    subscribeEndTransaction(observer: Exec): void {this.#finalizeTransactionObservers.push(observer)}

    unstageBox(box: Box): void {
        this.#assertTransaction()
        const deleted = this.#boxes.removeByKey(box.address.uuid)
        assert(deleted === box, `${box} could not be found to unstage`)
        this.#edges.unwatchVerticesOf(box)
        const update = new DeleteUpdate(box.address.uuid, box.name, box.toArrayBuffer())
        this.#updateListeners.proxy.onUpdate(update)
        this.#immediateUpdateListeners.proxy.onUpdate(update)
    }

    findBox<B extends Box = Box>(uuid: UUID.Format): Option<B> {
        return this.#boxes.opt(uuid) as Option<B>
    }

    findVertex(address: Address): Option<Vertex> {
        return this.#boxes.opt(address.uuid).flatMap(box => box.searchVertex(address.fieldKeys))
    }

    boxes(): ReadonlyArray<Box> {return this.#boxes.values()}

    edges(): GraphEdges {return this.#edges}

    checksum(): Int8Array {
        const checksum = new Checksum()
        this.boxes().forEach(box => box.write(checksum))
        return checksum.result()
    }

    onPrimitiveValueUpdate<V extends PrimitiveValues>(field: PrimitiveField<V, any>, oldValue: V, newValue: V): void {
        this.#assertTransaction()
        if (field.isAttached() && !this.#constructingBox) {
            const update = new PrimitiveUpdate<V>(field.address, field.serialization(), oldValue, newValue)
            this.#dispatchers.dispatch(update)
            this.#updateListeners.proxy.onUpdate(update)
            this.#immediateUpdateListeners.proxy.onUpdate(update)
        }
    }

    onPointerAddressUpdated(pointerField: PointerField, oldValue: Option<Address>, newValue: Option<Address>): void {
        this.#assertTransaction()
        const update = new PointerUpdate(pointerField.address, oldValue, newValue)
        if (this.#constructingBox) {
            this.#deferredPointerUpdates.push({pointerField, update})
        } else {
            this.#processPointerValueUpdate(pointerField, update)
            this.#immediateUpdateListeners.proxy.onUpdate(update)
        }
    }

    #processPointerValueUpdate(pointerField: PointerField, update: PointerUpdate): void {
        const oldVertex: Nullable<Vertex> = pointerField.targetVertex.unwrapOrNull()
        pointerField.resolve()
        const newVertex: Nullable<Vertex> = pointerField.targetVertex.unwrapOrNull()
        if (oldVertex !== newVertex) {
            oldVertex?.pointerHub.onRemoved(pointerField)
            newVertex?.pointerHub.onAdded(pointerField)
            if (oldVertex !== null) {
                this.#edges.disconnect(pointerField)
            }
            if (newVertex !== null) {
                this.#edges.connect(pointerField, newVertex)
            }
        }
        this.#dispatchers.dispatch(update)
        this.#updateListeners.proxy.onUpdate(update)
    }

    dependenciesOf(box: Box): Dependencies {
        const boxes = new Set<Box>()
        const pointers = new Set<PointerField>()
        const trace = (box: Box): void => {
            if (boxes.has(box)) {return}
            boxes.add(box)
            box.outgoingEdges()
                .filter(([pointer]) => !pointers.has(pointer))
                .forEach(([source, target]: [PointerField, Vertex]) => {
                    pointers.add(source)
                    if (target.pointerRules.mandatory &&
                        target.pointerHub.incoming().every(pointer => pointers.has(pointer))) {
                        return trace(target.box)
                    }
                })
            box.incomingEdges()
                .forEach(pointer => {
                    pointers.add(pointer)
                    if (pointer.mandatory) {
                        trace(pointer.box)
                    }
                })
        }
        trace(box)
        boxes.delete(box)
        return {boxes: boxes, pointers: Array.from(pointers).reverse()}
    }

    verifyPointers(): { count: int } {
        console.debug("validate requirements")
        this.#edges.validateRequirements()
        this.#edges.verifyPointers()
        console.debug("verify pointers")
        let count = 0 | 0
        const verify = (vertex: Vertex) => {
            for (const field of vertex.fields()) {
                field.accept({
                    visitPointerField: (pointer: PointerField) => {
                        if (pointer.targetAddress.nonEmpty()) {
                            const isResolved = pointer.targetVertex.nonEmpty()
                            const inGraph = this.findVertex(pointer.targetAddress.unwrap()).nonEmpty()
                            assert(isResolved, `pointer ${pointer.address} is broken`)
                            assert(inGraph, `Cannot find target for pointer ${pointer.address}`)
                            count++
                        }
                    },
                    visitObjectField: (object: ObjectField<any>) => verify(object)
                })
            }
        }
        this.#boxes.forEach((box: Box): void => verify(box))
        console.debug("verification complete.")
        return {count}
    }

    debugBoxes(): void {
        console.table(this.#boxes.values().reduce((dict: any, box) => {
            dict[UUID.toString(box.address.uuid)] = {
                class: box.name,
                "incoming links": box.incomingEdges().length,
                "outgoing links": box.outgoingEdges().length,
                "est. memory (bytes)": box.estimateMemory()
            }
            return dict
        }, {}))
    }

    debugDependencies(): void {
        console.debug("Dependencies:")
        this.boxes().forEach(box => {
            console.debug(`\t${box}`)
            for (const dependency of this.dependenciesOf(box).boxes) {
                console.debug(`\t\t${dependency}`)
            }
        })
    }

    addressToDebugPath(address: Option<Address>): Option<string> {
        return address.flatMap(address =>
            address.isBox()
                ? this.findBox(address.uuid).map(box => box.name)
                : this.findBox(address.uuid)
                    .flatMap(box => box.searchVertex(address.fieldKeys)
                        .map(vertex => vertex.isField() ? vertex.debugPath : panic("Unknown address"))))
    }

    toArrayBuffer(): ArrayBufferLike {
        const output = ByteArrayOutput.create()
        const boxes = this.#boxes.values()
        output.writeInt(boxes.length)
        boxes.forEach(box => {
            const buffer = box.serialize()
            output.writeInt(buffer.byteLength)
            output.writeBytes(new Int8Array(buffer))
        })
        return output.toArrayBuffer()
    }

    fromArrayBuffer(arrayBuffer: ArrayBuffer): void {
        assert(this.#boxes.isEmpty(), "Cannot call fromArrayBuffer if boxes is not empty")
        const input = new ByteArrayInput(arrayBuffer)
        const numBoxes = input.readInt()
        this.beginTransaction()
        const boxes: Array<{
            creationIndex: int,
            name: keyof BoxMap,
            uuid: UUID.Format,
            boxStream: ByteArrayInput
        }> = []
        for (let i = 0; i < numBoxes; i++) {
            const length = input.readInt()
            const int8Array = new Int8Array(length)
            input.readBytes(int8Array)
            const boxStream = new ByteArrayInput(int8Array.buffer)
            const creationIndex = boxStream.readInt()
            const name = boxStream.readString() as keyof BoxMap
            const uuid = UUID.fromDataInput(boxStream)
            boxes.push({creationIndex, name, uuid, boxStream})
        }
        boxes
            .sort((a, b) => a.creationIndex - b.creationIndex)
            .forEach(({name, uuid, boxStream}) => this.createBox(name, uuid, box => box.read(boxStream)))
        this.endTransaction()
    }

    #assertTransaction(): void {
        assert(this.#inTransaction, () => "Modification only prohibited in transaction mode.")
    }
}