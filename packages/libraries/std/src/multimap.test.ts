import {beforeEach, describe, expect, it} from "vitest"
import {ArrayMultimap, Multimap, SetMultimap} from "./multimap"
import {int} from "./lang"
import {Sets} from "./sets"
import {NumberComparator} from "./comparators"

interface LocalTestContext {
    map: Multimap<string, int>
}

describe("ArrayMultiMap", () => {
    beforeEach<LocalTestContext>(context => {
        context.map = new ArrayMultimap<string, int>([["C", [6, 7, 8, 8]]])
        context.map.add("A", 0)
        context.map.add("A", 1)
        context.map.add("A", 2)
        context.map.add("B", 0)
        context.map.add("B", 1)
        context.map.add("B", 2)
    })

    describe("sorted", () => {
        it("should always return a sorted array", () => {
            const map = new ArrayMultimap<string, int>([["C", [6, 7, 8, 5]]], NumberComparator)
            map.add("A", -1)
            map.add("A", 3)
            map.add("A", -2)
            map.add("A", 4)
            expect(map.get("A")).toStrictEqual([-2, -1, 3, 4])
            expect(map.get("C")).toStrictEqual([5, 6, 7, 8])
        })
    })

    describe("clear", () => {
        it<LocalTestContext>("should always return an empty map", ({map}) => {
            map.clear()
            expect(map).toStrictEqual(new ArrayMultimap<string, int>())
        })
        it("should do nothing to an already empty map", () => {
            const emptyMap = new ArrayMultimap<string, int>()
            emptyMap.clear()
            expect(emptyMap).toStrictEqual(new ArrayMultimap<string, int>)
        })
    })
    describe("containsEntry", () => {
        it<LocalTestContext>("should return true for a key/value pair in the map", ({map}) => {
            expect(map.containsEntry("A", 1)).toBe(true)
        })
        it<LocalTestContext>("should return false for a key/value pair not in the map", ({map}) => {
            expect(map.containsEntry("A", 3)).toBe(false)
        })
    })

    describe("containsKey", () => {
        it<LocalTestContext>("should return true for a key in the map", ({map}) => {
            expect(map.containsKey("A")).toBe(true)
        })
        it<LocalTestContext>("should return false for a key not in the map", ({map}) => {
            expect(map.containsKey("D")).toBe(false)
        })
        it("should return false for a key that no longer has values", () => {
            const newMap = new ArrayMultimap<string, number>([["A", [0]]])
            newMap.remove("A", 0)
            expect(newMap.containsKey("A")).toBe(false)
        })
    })

    describe("containsValue", () => {
        it<LocalTestContext>("should return true for a value in the map", ({map}) => {
            expect(map.containsValue(0)).toBe(true)
        })
        it<LocalTestContext>("irrespective of the key", ({map}) => {
            expect(map.containsValue(8)).toBe(true)
        })
        it<LocalTestContext>("should return false for a value not in the map", ({map}) => {
            expect(map.containsValue(10)).toBe(false)
        })
    })

    describe("get", () => {
        it<LocalTestContext>("should return the whole array for a key", ({map}) => {
            expect(map.get("A")).toStrictEqual([0, 1, 2])
        })
        it<LocalTestContext>("including duplicate values", ({map}) => {
            expect(map.get("C")).toStrictEqual([6, 7, 8, 8])
        })
        it<LocalTestContext>("should return an empty array for a non-existent key", ({map}) => {
            expect(map.get("D")).toStrictEqual([])
        })
    })

    describe("isEmpty", () => {
        it("should return true for an empty map", () => {
            const emptyMap = new ArrayMultimap<string, number>()
            expect(emptyMap.isEmpty()).toBe(true)
        })
        it<LocalTestContext>("should return false if the map has values", ({map}) => {
            expect(map.isEmpty()).toBe(false)
        })
        it("should return true if the map has removed all the values", () => {
            const newMap = new ArrayMultimap<string, number>([["A", [0]]])
            newMap.remove("A", 0)
            expect(newMap.isEmpty()).toBe(true)
        })
    })

    describe("put", () => {
        it<LocalTestContext>("can set the same value for the same key multiple times", ({map}) => {
            map.add("C", 8)
            map.add("C", 8)
            expect(map.get("C")).toStrictEqual([6, 7, 8, 8, 8, 8])
        })
    })

    describe("clone", () => {
        it<LocalTestContext>("should create a deep copy of the map", ({map}) => {
            const copy = map.clone()
            expect(copy).toStrictEqual(map)
        })
        it<LocalTestContext>("mutating the copy should not mutate the original map", ({map}) => {
            const copy = map.clone()
            copy.add("A", 4)
            expect(map.get("A")).toStrictEqual([0, 1, 2])
        })
        it("cloning an empty map should return an empty copy without reference", () => {
            const original = new ArrayMultimap<string, number>()
            const copy = original.clone()
            copy.add("A", 4)
            expect(original.get("A")).toStrictEqual([])
        })
    })

    describe("remove", () => {
        it<LocalTestContext>("should return true if it finds and removes the value", ({map}) => {
            expect(map.remove("A", 0)).true
        })
        it("removes only the first instance of a value for that key", () => {
            const newMap = new ArrayMultimap<string, number>([["A", [0, 1, 0, 1]]])
            newMap.remove("A", 1)
            expect(newMap.get("A")).toStrictEqual([0, 0, 1])
        })
        it<LocalTestContext>("without affecting other keys", ({map}) => {
            map.remove("A", 0)
            expect(map.get("A")).toStrictEqual([1, 2])
            expect(map.get("B")).toStrictEqual([0, 1, 2])
        })
        it<LocalTestContext>("should return false if the key doesn't exist", ({map}) => {
            expect(map.remove("A", 5)).false
        })
        it<LocalTestContext>("should not mutate the map if the key doesn't exist", ({map}) => {
            const mapBefore = map.clone()
            map.removeKey("D")
            expect(map).toStrictEqual(mapBefore)
        })
    })

    describe("removeKey", () => {
        it<LocalTestContext>("removes a key and all of its values from the map", ({map}) => {
            map.removeKey("C")
            expect(map.containsKey("C")).toBe(false)
            expect(map.get("C")).toStrictEqual([])
        })
        it<LocalTestContext>("should not affect other keys", ({map}) => {
            map.removeKey("C")
            expect(map.containsKey("A")).toBe(true)
            expect(map.get("A")).toStrictEqual([0, 1, 2])
        })
        it<LocalTestContext>("if the key exists, should return the deleted array", ({map}) => {
            expect(map.removeKey("A")).toStrictEqual([0, 1, 2])
        })
        it<LocalTestContext>("should not mutate the array if key doesn't exist", ({map}) => {
            const mapBefore = map.clone()
            map.removeKey("D")
            expect(map).toStrictEqual(mapBefore)
        })
        it<LocalTestContext>("should return an empty array if the key does not exist", ({map}) => {
            expect(map.removeKey("D")).toStrictEqual([])
        })
    })

    describe("keyCount", () => {
        it<LocalTestContext>("should return the number of keys", ({map}) => {
            expect(map.keyCount()).toStrictEqual(3)
        })
        it("should return zero if there are no keys", () => {
            const emptyMap = new ArrayMultimap<string, number>()
            expect(emptyMap.keyCount()).toStrictEqual(0)
        })
        it("should return 0 if the last value is removed (thus removing the last key)", () => {
            const newMap = new ArrayMultimap<string, number>([["A", [1]]])
            newMap.remove("A", 1)
            expect(newMap.keyCount()).toStrictEqual(0)
        })
    })

    describe("forEach", () => {
        it<LocalTestContext>("should iterate over every key/value pair in the map", ({map}) => {
            const keys: string[] = []
            const func = (key: string, _values: Iterable<number>) => {
                keys.push(key)
            }
            map.forEach(func)
            expect(new Set(keys)).toStrictEqual(new Set(["A", "B", "C"]))
        })
    })
})

describe("SetMultiMap", () => {
    beforeEach<LocalTestContext>(context => {
        context.map = new SetMultimap<string, int>([["C", [6, 7, 8, 8]]])
        context.map.add("A", 0)
        context.map.add("A", 1)
        context.map.add("A", 2)
        context.map.add("B", 0)
        context.map.add("B", 1)
        context.map.add("B", 2)
    })

    describe("clear", () => {
        it<LocalTestContext>("should always return an empty map", ({map}) => {
            map.clear()
            expect(map).toStrictEqual(new SetMultimap<string, int>())
        })
        it("should do nothing to an already empty map", () => {
            const emptyMap = new SetMultimap<string, int>()
            emptyMap.clear()
            expect(emptyMap).toStrictEqual(new SetMultimap<string, int>)
        })
    })
    describe("containsEntry", () => {
        it<LocalTestContext>("should return true for a key/value pair in the map", ({map}) => {
            expect(map.containsEntry("A", 1)).toBe(true)
        })
        it<LocalTestContext>("should return false for a key/value pair not in the map", ({map}) => {
            expect(map.containsEntry("A", 3)).toBe(false)
        })
    })

    describe("containsKey", () => {
        it<LocalTestContext>("should return true for a key in the map", ({map}) => {
            expect(map.containsKey("A")).toBe(true)
        })
        it<LocalTestContext>("should return false for a key not in the map", ({map}) => {
            expect(map.containsKey("D")).toBe(false)
        })
        it("should return false for a key that no longer has values", () => {
            const newMap = new SetMultimap<string, number>([["A", [0]]])
            newMap.remove("A", 0)
            expect(newMap.containsKey("A")).toBe(false)
        })
    })

    describe("containsValue", () => {
        it<LocalTestContext>("should return true for a value in the map", ({map}) => {
            expect(map.containsValue(0)).toBe(true)
        })
        it<LocalTestContext>("irrespective of the key", ({map}) => {
            expect(map.containsValue(8)).toBe(true)
        })
        it<LocalTestContext>("should return false for a value not in the map", ({map}) => {
            expect(map.containsValue(10)).toBe(false)
        })
    })

    describe("get", () => {
        it<LocalTestContext>("should return the whole array for a key", ({map}) => {
            expect(map.get("A")).toStrictEqual(new Set([0, 1, 2]))
        })
        it<LocalTestContext>("including duplicate values", ({map}) => {
            expect(map.get("C")).toStrictEqual(new Set([6, 7, 8, 8]))
        })
        it<LocalTestContext>("should return an empty array for a non-existent key", ({map}) => {
            expect(map.get("D")).toStrictEqual(Sets.empty())
        })
    })

    describe("isEmpty", () => {
        it("should return true for an empty map", () => {
            const emptyMap = new SetMultimap<string, number>()
            expect(emptyMap.isEmpty()).toBe(true)
        })
        it<LocalTestContext>("should return false if the map has values", ({map}) => {
            expect(map.isEmpty()).toBe(false)
        })
        it("should return true if the map has removed all the values", () => {
            const newMap = new SetMultimap<string, number>([["A", [0]]])
            newMap.remove("A", 0)
            expect(newMap.isEmpty()).toBe(true)
        })
    })

    describe("put", () => {
        it<LocalTestContext>("can set the same value for the same key multiple times", ({map}) => {
            map.add("C", 8)
            map.add("C", 8)
            expect(map.get("C")).toStrictEqual(new Set([6, 7, 8, 8, 8, 8]))
        })
    })

    describe("clone", () => {
        it<LocalTestContext>("should create a deep copy of the map", ({map}) => {
            const copy = map.clone()
            expect(copy).toStrictEqual(map)
        })
        it<LocalTestContext>("mutating the copy should not mutate the original map", ({map}) => {
            const copy = map.clone()
            copy.add("A", 4)
            expect(map.get("A")).toStrictEqual(new Set([0, 1, 2]))
        })
        it("cloning an empty map should return an empty copy without reference", () => {
            const original = new SetMultimap<string, number>()
            const copy = original.clone()
            copy.add("A", 4)
            expect(original.get("A")).toStrictEqual(Sets.empty())
        })
    })

    describe("remove", () => {
        it<LocalTestContext>("should return true if it finds and removes the value", ({map}) => {
            expect(map.remove("A", 0)).true
        })
        it("removes only the first instance of a value for that key", () => {
            const newMap = new SetMultimap<string, number>([["A", [0, 1, 0, 1]]])
            newMap.remove("A", 1)
            expect(newMap.get("A")).toStrictEqual(new Set([0]))
        })
        it<LocalTestContext>("without affecting other keys", ({map}) => {
            map.remove("A", 0)
            expect(map.get("A")).toStrictEqual(new Set([1, 2]))
            expect(map.get("B")).toStrictEqual(new Set([0, 1, 2]))
        })
        it<LocalTestContext>("should return false if the key doesn't exist", ({map}) => {
            expect(map.remove("A", 5)).false
        })
        it<LocalTestContext>("should not mutate the map if the key doesn't exist", ({map}) => {
            const mapBefore = map.clone()
            map.removeKey("D")
            expect(map).toStrictEqual(mapBefore)
        })
    })

    describe("removeKey", () => {
        it<LocalTestContext>("removes a key and all of its values from the map", ({map}) => {
            map.removeKey("C")
            expect(map.containsKey("C")).toBe(false)
            expect(map.get("C")).toStrictEqual(Sets.empty())
        })
        it<LocalTestContext>("should not affect other keys", ({map}) => {
            map.removeKey("C")
            expect(map.containsKey("A")).toBe(true)
            expect(map.get("A")).toStrictEqual(new Set([0, 1, 2]))
        })
        it<LocalTestContext>("if the key exists, should return the deleted array", ({map}) => {
            expect(map.removeKey("A")).toStrictEqual(new Set([0, 1, 2]))
        })
        it<LocalTestContext>("should not mutate the array if key doesn't exist", ({map}) => {
            const mapBefore = map.clone()
            map.removeKey("D")
            expect(map).toStrictEqual(mapBefore)
        })
        it<LocalTestContext>("should return an empty array if the key does not exist", ({map}) => {
            expect(map.removeKey("D")).toStrictEqual(Sets.empty())
        })
    })

    describe("keyCount", () => {
        it<LocalTestContext>("should return the number of keys", ({map}) => {
            expect(map.keyCount()).toStrictEqual(3)
        })
        it("should return zero if there are no keys", () => {
            const emptyMap = new SetMultimap<string, number>()
            expect(emptyMap.keyCount()).toStrictEqual(0)
        })
        it("should return 0 if the last value is removed (thus removing the last key)", () => {
            const newMap = new SetMultimap<string, number>([["A", [1]]])
            newMap.remove("A", 1)
            expect(newMap.keyCount()).toStrictEqual(0)
        })
    })

    describe("forEach", () => {
        it<LocalTestContext>("should iterate over every key/value pair in the map", ({map}) => {
            const keys: string[] = []
            const func = (key: string, _values: Iterable<number>) => {
                keys.push(key)
            }
            map.forEach(func)
            expect(new Set(keys)).toStrictEqual(new Set(["A", "B", "C"]))
        })
    })
})