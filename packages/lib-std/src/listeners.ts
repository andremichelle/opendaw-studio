import {Subscription, Terminable} from "./terminable"
import {int, Procedure, safeExecute} from "./lang"

export class Listeners<T> implements Terminable {
    readonly #set = new Set<T>()
    readonly #proxy: Required<T>

    constructor() {
        this.#proxy = new Proxy({}, {
            get: (_: never, func: string): () => void => (...args: unknown[]): void =>
                this.#set.forEach((listener: any) => {
                    if (Object.getPrototypeOf(listener) === Object.getPrototypeOf({})) {
                        return safeExecute(listener[func], ...args)
                    }
                    return listener[func]?.apply(listener, args)
                })
        } as const) as Required<T>
    }

    get proxy(): Required<T> {return this.#proxy}
    get size(): int {return this.#set.size}
    subscribe(listener: T): Subscription {
        this.#set.add(listener)
        return {terminate: () => this.#set.delete(listener)}
    }
    forEach(procedure: Procedure<T>): void {this.#set.forEach(procedure)}
    terminate(): void {this.#set.clear()}
}