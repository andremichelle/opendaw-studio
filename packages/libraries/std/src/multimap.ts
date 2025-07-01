import {Arrays} from "./arrays"
import {Comparator, int, Nullable, Nullish, Predicate} from "./lang"
import {Sets} from "./sets"
import {Iterables} from "./iterables"
import {Maps} from "./maps"
import {Option} from "./option"
import {BinarySearch} from "./binary-search"

export interface Multimap<K, V> {
    clear(): void
    containsEntry(key: K, value: V): boolean
    containsKey(key: K): boolean
    containsValue(value: V): boolean
    get(key: K): Iterable<V>
    isEmpty(): boolean
    add(key: K, value: V): void
    addAll(key: K, values: Iterable<V>): void
    remove(key: K, value: V): boolean
    removeFromKeyIf(key: K, value: Predicate<V>): Nullable<V>
    removeValueIf(value: Predicate<V>): ReadonlySet<V>
    removeKey(key: K): Iterable<V>
    forEach(callback: (key: K, values: Iterable<V>) => void): void
    keyCount(): number
    keys(): Iterable<K>
    sortKeys(comparator: Comparator<K>): void
    clone(): Multimap<K, V>
}

export class ArrayMultimap<K, V> implements Multimap<K, V>, Iterable<[K, Array<V>]> {
    readonly #map: Map<K, Array<V>>
    readonly #comparator: Option<Comparator<V>>

    constructor(entries?: ReadonlyArray<Readonly<[K, V[]]>>, comparator?: Comparator<V>) {
        this.#map = new Map<K, Array<V>>(entries)
        this.#comparator = Option.wrap(comparator)
        this.#comparator.ifSome(comparator => Array.from(this.#map.values()).forEach(array => array.sort(comparator)))
    }

    [Symbol.iterator](): Iterator<[K, V[]]> {return this.#map.entries()}

    clear(): void {this.#map.clear()}

    containsEntry(key: K, value: V): boolean {
        return Iterables.some(this.#map.entries(),
            (entry: [K, Array<V>]) => key === entry[0] && entry[1].includes(value))
    }

    containsKey(key: K): boolean {
        return Iterables.includes(this.#map.keys(), key)
    }

    containsValue(value: V): boolean {
        return Iterables.some(this.#map.values(), (values: Array<V>) => values.includes(value))
    }

    get(key: K): ReadonlyArray<V> {return this.#map.get(key) ?? Arrays.empty()}

    isEmpty(): boolean {return this.keyCount() === 0}

    add(key: K, value: V): void {
        const array = Maps.createIfAbsent(this.#map, key, () => [])
        if (this.#comparator.isEmpty()) {
            array.push(value)
        } else {
            const insertIndex: int = BinarySearch.leftMost(array, value, this.#comparator.unwrap())
            array.splice(insertIndex, 0, value)
        }
    }

    addAll(key: K, values: Iterable<V>): void {
        const array = Maps.createIfAbsent(this.#map, key, () => [])
        array.push(...values)
        if (this.#comparator.nonEmpty()) {array.sort(this.#comparator.unwrap())}
    }

    remove(key: K, value: V): boolean {
        const values = this.#map.get(key)
        if (values === undefined) {
            return false
        } else {
            const index = values.indexOf(value)
            if (index === -1) {
                return false
            } else {
                values.splice(index, 1)
                if (values.length === 0) {
                    this.#map.delete(key)
                }
                return true
            }
        }
    }

    removeFromKeyIf(key: K, predicate: Predicate<V>): Nullable<V> {
        const values = this.#map.get(key)
        if (values === undefined) {
            return null
        } else {
            const index = values.findIndex(predicate)
            if (index === -1) {
                return null
            } else {
                const removed = values.splice(index, 1)[0]
                if (values.length === 0) {
                    this.#map.delete(key)
                }
                return removed
            }
        }
    }

    removeValueIf(predicate: Predicate<V>): ReadonlySet<V> {
        const removeList: [K, V][] = []
        for (const [key, values] of this.#map.entries()) {
            for (const value of values.filter(value => predicate(value))) {
                removeList.push([key, value])
            }
        }
        for (const [key, value] of removeList) {
            this.remove(key, value)
        }
        return new Set(removeList.map(([, value]) => value))
    }

    removeKey(key: K): ReadonlyArray<V> {
        const values = this.#map.get(key)
        this.#map.delete(key)
        return values ?? Arrays.empty()
    }

    forEach(callback: (key: K, values: ReadonlyArray<V>) => void): void {
        Iterables.forEach(this.#map.entries(), (entry: [K, Array<V>]) => callback(entry[0], entry[1]))
    }

    keyCount(): number {return this.#map.size}

    keys(): Iterable<K> {return this.#map.keys()}

    sortKeys(comparator: Comparator<K>): void {
        const clone: Multimap<K, V> = this.clone()
        const keys: K[] = Array.from(this.keys()).sort(comparator)
        this.#map.clear()
        for (const key of keys) {this.addAll(key, clone.get(key))}
    }

    clone(): ArrayMultimap<K, V> {
        const copy: ArrayMultimap<K, V> = new ArrayMultimap<K, V>()
        this.#map.forEach((values: Array<V>, key: K): void => {
            copy.#map.set(key, values.map((value: V) => value))
        })
        return copy
    }
}

export class SetMultimap<K, V> implements Multimap<K, V> {
    private readonly map: Map<K, Set<V>>

    constructor(entries?: readonly (readonly [K, V[]])[]) {
        this.map = new Map<K, Set<V>>(entries?.map((entry: readonly [K, V[]]) => {
            const key: K = entry[0]
            const values: V[] = entry[1]
            return [key, new Set<V>(values)]
        }))
    }

    clear(): void {
        this.map.clear()
    }

    containsEntry(key: K, value: V): boolean {
        return Iterables.some(this.map.entries(),
            (entry: [K, Set<V>]) => key === entry[0] && entry[1].has(value))
    }

    containsKey(key: K): boolean {
        return Iterables.includes(this.map.keys(), key)
    }

    containsValue(value: V): boolean {
        return Iterables.some(this.map.values(), (values: Set<V>) => values.has(value))
    }

    get(key: K): ReadonlySet<V> {
        return this.map.get(key) ?? Sets.empty()
    }

    isEmpty(): boolean {
        return this.keyCount() === 0
    }

    add(key: K, value: V): void {
        Maps.createIfAbsent(this.map, key, () => new Set<V>).add(value)
    }

    addAll(key: K, values: Iterable<V>): void {
        const set = Maps.createIfAbsent(this.map, key, () => new Set<V>)
        for (const value of values) {set.add(value)}
    }

    remove(key: K, value: V): boolean {
        const values: Nullish<Set<V>> = this.map.get(key)
        if (values === undefined) {
            return false
        } else {
            if (!values.delete(value)) {
                return false
            }
            if (values.size === 0) {
                this.map.delete(key)
            }
            return true
        }
    }

    removeValueIf(predicate: Predicate<V>): ReadonlySet<V> {
        const removeSet = new Set<V>()
        for (const [key, values] of this.map.entries()) {
            for (const value of values) {
                if (predicate(value)) {
                    values.delete(value)
                    removeSet.add(value)
                }
            }
            if (values.size === 0) {
                this.map.delete(key)
            }
        }
        return removeSet
    }

    removeFromKeyIf(key: K, predicate: Predicate<V>): Nullable<V> {
        const values: Nullish<Set<V>> = this.map.get(key)
        if (values === undefined) {
            return null
        } else {
            for (const value of values) {
                if (predicate(value)) {
                    values.delete(value)
                    if (values.size === 0) {this.map.delete(key)}
                    return value
                }
            }
            return null
        }
    }

    removeKey(key: K): ReadonlySet<V> {
        const values = this.map.get(key)
        this.map.delete(key)
        return values ?? Sets.empty()
    }

    forEach(callback: (key: K, values: ReadonlySet<V>) => void): void {
        Iterables.forEach(this.map.entries(), (entry: [K, Set<V>]) => callback(entry[0], entry[1]))
    }

    keyCount(): number {return this.map.size}
    keys(): Iterable<K> {return this.map.keys()}

    sortKeys(comparator: Comparator<K>): void {
        const clone: Multimap<K, V> = this.clone()
        const keys: K[] = Array.from(this.keys()).sort(comparator)
        this.map.clear()
        for (const key of keys) {this.addAll(key, clone.get(key))}
    }

    clone(): SetMultimap<K, V> {
        const copy: SetMultimap<K, V> = new SetMultimap<K, V>()
        this.map.forEach((values, key) => {
            copy.map.set(key, new Set(Array.from(values)))
        })
        return copy
    }
}