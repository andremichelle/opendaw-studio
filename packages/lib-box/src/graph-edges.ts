import {Arrays, assert, Func, isDefined, isInstanceOf, panic, SortedSet, UUID} from "lib-std"
import {Address} from "./address"
import {PointerField} from "./pointer"
import {Vertex} from "./vertex"
import {Box} from "./box"

export class GraphEdges {
    readonly #requiresTarget: SortedSet<Address, PointerField>
    readonly #requiresPointer: SortedSet<Address, Vertex>
    readonly #incoming: SortedSet<Address, [Vertex, Array<PointerField>]>
    readonly #outgoing: SortedSet<Address, [PointerField, Vertex]>

    constructor() {
        this.#requiresTarget = Address.newSet<PointerField>(source => source.address)
        this.#requiresPointer = Address.newSet<Vertex>(vertex => vertex.address)
        this.#incoming = Address.newSet<[Vertex, Array<PointerField>]>(([vertex]) => vertex.address)
        this.#outgoing = Address.newSet<[PointerField, Vertex]>(([source]) => source.address)
    }

    watchVertex(vertex: Vertex | PointerField): void {
        if (isInstanceOf(vertex, PointerField)) {
            if (!vertex.mandatory) {
                return panic("watchVertex called but has no edge requirement")
            }
            this.#requiresTarget.add(vertex)
        } else {
            if (!vertex.pointerRules.mandatory) {
                return panic("watchVertex called but has no edge requirement")
            }
            this.#requiresPointer.add(vertex)
        }
    }

    unwatchVerticesOf(...boxes: ReadonlyArray<Box>): void {
        const map: Func<Vertex, UUID.Format> = ({box: {address: {uuid}}}) => uuid
        for (const {address: {uuid}} of boxes) {
            this.#removeSameBox(this.#requiresTarget, uuid, map)
            this.#removeSameBox(this.#requiresPointer, uuid, map)
        }
        for (const box of boxes) {
            const outgoingLinks = this.outgoingEdgesOf(box)
            if (outgoingLinks.length > 0) {
                return panic(`${box} has outgoing edges: ${outgoingLinks.map(([source, target]) =>
                    `[${source.toString()}, ${target.toString()}]`)}`)
            }
            const incomingPointers = this.incomingEdgesOf(box)
            if (incomingPointers.length > 0) {
                return panic(`${box} has incoming edges from: ${incomingPointers.map((source: PointerField) =>
                    source.toString())}`)
            }
        }
    }

    connect(source: PointerField, target: Vertex): void {
        this.#outgoing.add([source, target])
        this.#incoming.opt(target.address).match<void>({
            none: () => this.#incoming.add([target, [source]]),
            some: ([, sources]) => sources.push(source)
        })
    }

    disconnect(source: PointerField): void {
        const [, target] = this.#outgoing.removeByKey(source.address)
        const [, sources] = this.#incoming.get(target.address)
        Arrays.remove(sources, source)
        if (sources.length === 0) {this.#incoming.removeByKey(target.address)}
    }

    outgoingEdgesOf(box: Box): ReadonlyArray<[PointerField, Vertex]> {
        return this.#collectSameBox(this.#outgoing, box.address.uuid, ([{box: {address: {uuid}}}]) => uuid)
    }

    incomingEdgesOf(vertex: Box | Vertex): ReadonlyArray<PointerField> {
        if (vertex.isBox()) {
            return this.#collectSameBox(this.#incoming, vertex.address.uuid, ([{address: {uuid}}]) => uuid)
                .flatMap(([_, pointers]) => pointers)
        } else {
            return this.#incoming.opt(vertex.address).mapOr(([_, pointers]) => pointers, Arrays.empty())
        }
    }

    validateRequirements(): void {
        this.#requiresTarget.forEach(pointer => {
            if (pointer.isEmpty()) {
                if (pointer.mandatory) {
                    return panic(`Pointer ${pointer.toString()} requires an edge.`)
                } else {
                    return panic(`Illegal state: ${pointer} has no edge requirements.`)
                }
            }
        })
        this.#requiresPointer.forEach(target => {
            if (target.pointerHub.isEmpty()) {
                if (target.pointerRules.mandatory) {
                    return panic(`Target ${target.toString()} requires an edge.`)
                } else {
                    return panic(`Illegal state: ${target} has no edge requirements.`)
                }
            }
        })
    }

    verifyPointers(): void {
        this.#requiresTarget.forEach(pointer => assert(pointer.isAttached(), `${pointer.address.toString()} is not attached`))
        this.#requiresPointer.forEach(pointer => assert(pointer.isAttached(), `${pointer.address.toString()} is not attached`))
    }

    #collectSameBox<T>(set: SortedSet<Address, T>, id: UUID.Format, map: Func<T, UUID.Format>): ReadonlyArray<T> {
        const range = Address.boxRange(set, id, map)
        return isDefined(range) ? set.values().slice(range[0], range[1]) : Arrays.empty()
    }

    #removeSameBox<T>(set: SortedSet<Address, T>, id: UUID.Format, map: Func<T, UUID.Format>): void {
        const range = Address.boxRange(set, id, map)
        if (isDefined(range)) {set.removeRange(range[0], range[1])}
    }
}