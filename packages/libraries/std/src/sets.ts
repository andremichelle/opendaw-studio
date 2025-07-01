export class Sets {
    static readonly #EMPTY: ReadonlySet<never> = Object.freeze(new Set<never>())

    static readonly empty = <T>(): ReadonlySet<T> => Sets.#EMPTY
}