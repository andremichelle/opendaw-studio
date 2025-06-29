import {describe, expect, it} from "vitest"
import {SortedSet} from "./sorted-set"

interface Item {
    key: number
    value: string
}

const extractor = (v: Item) => v.key
const comparator = (a: number, b: number) => a - b

describe("SortedSet – behavioural contract", () => {
    it("keeps elements ordered as they are added", () => {
        const set = new SortedSet<number, number>(v => v, comparator)
        set.add(3)
        set.add(1)
        set.add(4)
        set.add(2)

        expect(Array.from(set)).toStrictEqual([1, 2, 3, 4])
    })

    it("rejects duplicate keys unless replace = true", () => {
        const set = new SortedSet<number, Item>(extractor, comparator)
        const a = {key: 1, value: "a"} as const
        const a2 = {key: 1, value: "a2"} as const

        expect(set.add(a)).toBe(true)
        expect(set.add(a2)).toBe(false)        // duplicate, not replaced
        expect(set.get(1)).toBe(a)

        expect(set.add(a2, true)).toBe(true)   // explicit replace
        expect(set.get(1)).toBe(a2)            // now replaced
    })

    it("getOrCreate returns existing element or creates a new one", () => {
        const set = new SortedSet<number, Item>(extractor, comparator)

        const produced = set.getOrCreate(2, key => ({key, value: "fresh"}))
        expect(produced).toStrictEqual({key: 2, value: "fresh"})
        expect(set.size()).toBe(1)

        const again = set.getOrCreate(2, () => {
            throw new Error("factory must NOT be called for existing key")
        })
        expect(again).toBe(produced)
    })

    it("addMany merges and detects duplicates", () => {
        const set = new SortedSet<number, number>(v => v, comparator)

        const unique = set.addMany([3, 1, 4])
        expect(unique).toBe(true)
        expect(set.values()).toStrictEqual([1, 3, 4])

        // 3 is a duplicate
        const stillUnique = set.addMany([2, 3])
        expect(stillUnique).toBe(false)
        expect(set.values()).toStrictEqual([1, 2, 3, 4])
    })

    it("removes by key, by value, by predicate and by range", () => {
        const set = new SortedSet<number, number>(v => v, comparator)
        set.addMany([1, 2, 3, 4, 5])

        // by key
        expect(set.removeByKey(3)).toBe(3)
        expect(set.values()).toStrictEqual([1, 2, 4, 5])

        // by value
        expect(set.removeByValue(1)).toBe(1)
        expect(set.values()).toStrictEqual([2, 4, 5])

        // by predicate
        const removed = set.removeByPredicate(v => v > 4)
        expect(removed).toBe(1)
        expect(set.values()).toStrictEqual([2, 4])

        // by range (remove last element)
        set.removeRange(1)
        expect(set.values()).toStrictEqual([2])
    })

    it("basic helpers: hasKey / hasValue / opt / getOrNull", () => {
        const set = new SortedSet<number, number>(v => v, comparator)
        set.addMany([10, 20])

        expect(set.hasKey(10)).toBe(true)
        expect(set.hasValue(20)).toBe(true)
        expect(set.hasKey(30)).toBe(false)

        expect(set.opt(10).nonEmpty()).toBe(true)
        expect(set.opt(30).isEmpty()).toBe(true)

        expect(set.getOrNull(20)).toBe(20)
        expect(set.getOrNull(99)).toBeNull()
    })

    it("isEmpty / clear / iterator", () => {
        const set = new SortedSet<number, number>(v => v, comparator)
        expect(set.isEmpty()).toBe(true)

        set.addMany([5, 6, 7])
        expect(set.isEmpty()).toBe(false)

        expect([...set]).toStrictEqual([5, 6, 7])

        set.clear()
        expect(set.size()).toBe(0)
        expect(set.isEmpty()).toBe(true)
    })
})