import {PointerField, PointerTypes} from "./pointer"
import {Vertex} from "./vertex"
import {Exec, int, Iterables, Listeners, Option, panic, SortedSet, Subscription} from "lib-std"
import {Address} from "./address"

export interface PointerListener {
    onAdd(pointer: PointerField): void
    onRemove(pointer: PointerField): void
}

export class PointerHub implements Iterable<PointerField> {
    static validate(pointer: PointerField, target: Vertex): Option<string> {
        if (pointer.address.equals(target.address)) {
            return Option.wrap(`PointerField cannot point to itself: ${pointer}`)
        }
        if (!target.pointerRules.accepts.some((type: PointerTypes): boolean => type === pointer.pointerType)) {
            console.warn(target.pointerRules)
            return Option.wrap(`${pointer.toString()} does not satisfy any of the allowed types (${(target.pointerRules)}).`)
        }
        return Option.None
    }

    readonly #vertex: Vertex

    readonly #immediateListeners: Listeners<PointerListener>
    readonly #transactualListeners: Listeners<PointerListener>

    #inTransaction: Option<Set<PointerField>> = Option.None

    constructor(vertex: Vertex) {
        this.#vertex = vertex

        this.#immediateListeners = new Listeners<PointerListener>()
        this.#transactualListeners = new Listeners<PointerListener>()
    }

    subscribeImmediate(listener: PointerListener, ...filter: ReadonlyArray<PointerTypes>): Subscription {
        return this.#addFilteredListener(this.#immediateListeners, listener, filter)
    }

    subscribeTransactual(listener: PointerListener, ...filter: ReadonlyArray<PointerTypes>): Subscription {
        return this.#addFilteredListener(this.#transactualListeners, listener, filter)
    }

    catchupAndSubscribeTransactual(listener: PointerListener, ...filter: ReadonlyArray<PointerTypes>): Subscription {
        const added: SortedSet<Address, PointerField> = Address.newSet(pointer => pointer.address)
        added.addMany(this.filter(...filter))
        added.forEach(pointer => listener.onAdd(pointer))
        // This takes track of the listeners notification state.
        // It is possible that the pointer has been added, but it has not been notified yet.
        // That would cause the listener.onAdd method to be involked twice.
        return this.subscribeTransactual({
            onAdd: (pointer: PointerField) => {
                if (added.add(pointer)) {
                    listener.onAdd(pointer)
                }
            },
            onRemove: (pointer: PointerField) => {
                added.removeByKey(pointer.address)
                listener.onRemove(pointer)
            }
        }, ...filter)
    }

    filter<P extends PointerTypes>(...types: ReadonlyArray<P>): Array<PointerField<P>> {
        return (types.length === 0 ? this.incoming() : Iterables.filter(this, (pointerField: PointerField) =>
            types.some((type: P) => type === pointerField.pointerType))) as Array<PointerField<P>>
    }

    size(): int {return this.incoming().length}
    isEmpty(): boolean {return this.size() === 0}
    nonEmpty(): boolean {return this.size() > 0}
    contains(pointer: PointerField): boolean {return this.incoming().some(incoming => pointer.address.equals(incoming.address))}
    incoming(): ReadonlyArray<PointerField> {return this.#vertex.graph.edges().incomingEdgesOf(this.#vertex)}

    onAdded(pointerField: PointerField): void {
        const issue: Option<string> = PointerHub.validate(pointerField, this.#vertex)
        if (issue.nonEmpty()) {return panic(issue.unwrap())}
        if (this.#inTransaction.isEmpty()) {
            this.#vertex.graph.subscribeEndTransaction(this.#onEndTransaction)
            this.#inTransaction = Option.wrap(new Set(this))
        }
        this.#immediateListeners.proxy.onAdd(pointerField)
    }

    onRemoved(pointerField: PointerField): void {
        if (this.#inTransaction.isEmpty()) {
            this.#vertex.graph.subscribeEndTransaction(this.#onEndTransaction)
            this.#inTransaction = Option.wrap(new Set(this))
        }
        this.#immediateListeners.proxy.onRemove(pointerField)
    }

    [Symbol.iterator](): Iterator<PointerField> {return this.incoming().values()}

    toString(): string {
        return `{Pointers ${this.#vertex.address}, pointers: ${Array.from(this)
            .map((pointerField: PointerField) => pointerField.toString())}}`
    }

    #addFilteredListener(listeners: Listeners<PointerListener>,
                         listener: PointerListener,
                         filter: ReadonlyArray<PointerTypes>): Subscription {
        return listeners.subscribe({
            onAdd: (pointer: PointerField) => {
                if (filter.length === 0 || filter.some((type: PointerTypes): boolean => type === pointer.pointerType)) {
                    listener.onAdd(pointer)
                }
            },
            onRemove: (pointer: PointerField) => {
                if (filter.length === 0 || filter.some((type: PointerTypes): boolean => type === pointer.pointerType)) {
                    listener.onRemove(pointer)
                }
            }
        })
    }

    readonly #onEndTransaction: Exec = (): void => {
        if (this.#vertex.isAttached()) {
            const beforeState: Set<PointerField> = this.#inTransaction.unwrap("Callback without transaction")
            const afterState: Set<PointerField> = new Set(this)
            beforeState.forEach(pointer => {
                if (!afterState.has(pointer)) {
                    this.#transactualListeners.proxy.onRemove(pointer)
                }
            })
            afterState.forEach(pointer => {
                if (!beforeState.has(pointer)) {
                    this.#transactualListeners.proxy.onAdd(pointer)
                }
            })
        }
        this.#inTransaction = Option.None
    }
}