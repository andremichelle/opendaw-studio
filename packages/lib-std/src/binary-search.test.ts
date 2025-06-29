import {describe, expect, it} from "vitest"
import {BinarySearch} from "./binary-search"
import {Comparator, Func} from "./lang"

type NumObj = { id: number }

const numCmp: Comparator<number> = (a, b) => a - b
const idMap: Func<NumObj, number> = (o) => o.id

describe("BinarySearch", () => {

    /* ------------------------------------------------------------------ *
     * exact()
     * ------------------------------------------------------------------ */
    describe("exact()", () => {
        const sorted = [1, 2, 3, 4, 5]

        it("returns the index of an existing element", () => {
            for (const [idx, value] of sorted.entries()) {
                expect(BinarySearch.exact(sorted, value, numCmp)).toBe(idx)
            }
        })

        it("returns -1 when key is absent", () => {
            expect(BinarySearch.exact(sorted, 0, numCmp)).toBe(-1)
            expect(BinarySearch.exact(sorted, 6, numCmp)).toBe(-1)
        })
    })

    /* ------------------------------------------------------------------ *
     * exactMapped()
     * ------------------------------------------------------------------ */
    describe("exactMapped()", () => {
        const objs: ReadonlyArray<NumObj> = [{id: 1}, {id: 2}, {id: 3}]

        it("finds object by mapped key", () => {
            expect(BinarySearch.exactMapped(objs, 2, numCmp, idMap)).toBe(1)
        })

        it("returns -1 for missing key", () => {
            expect(BinarySearch.exactMapped(objs, 4, numCmp, idMap)).toBe(-1)
        })
    })

    /* ------------------------------------------------------------------ *
     * leftMost() / rightMost()
     * ------------------------------------------------------------------ */
    describe("leftMost() / rightMost()", () => {
        const withDup = [1, 2, 2, 2, 3, 4]

        it("returns the first and last index of duplicates", () => {
            expect(BinarySearch.leftMost(withDup, 2, numCmp)).toBe(1)
            expect(BinarySearch.rightMost(withDup, 2, numCmp)).toBe(3)
        })

        it("returns insertion point when key is absent (leftMost)", () => {
            // insert between 3 and 4
            expect(BinarySearch.leftMost(withDup, 3.5, numCmp)).toBe(5)
        })

        it("returns index of floor element when key is absent (rightMost)", () => {
            // floor of 3.5 is 3 at index 4
            expect(BinarySearch.rightMost(withDup, 3.5, numCmp)).toBe(4)
        })

        it("works on empty arrays", () => {
            expect(BinarySearch.leftMost([], 10, numCmp)).toBe(0)
            expect(BinarySearch.rightMost([], 10, numCmp)).toBe(-1)
        })
    })

    /* ------------------------------------------------------------------ *
     * leftMostMapped() / rightMostMapped()
     * ------------------------------------------------------------------ */
    describe("leftMostMapped() / rightMostMapped()", () => {
        const withDup: ReadonlyArray<NumObj> =
            [{id: 1}, {id: 2}, {id: 2}, {id: 2}, {id: 3}]

        it("operates on mapped values", () => {
            expect(BinarySearch.leftMostMapped(withDup, 2, numCmp, idMap)).toBe(1)
            expect(BinarySearch.rightMostMapped(withDup, 2, numCmp, idMap)).toBe(3)
        })
    })

    /* ------------------------------------------------------------------ *
     * rangeMapped()
     * ------------------------------------------------------------------ */
    describe("rangeMapped()", () => {
        const data: ReadonlyArray<NumObj> =
            [{id: 1}, {id: 2}, {id: 2}, {id: 3}, {id: 3}, {id: 3}, {id: 4}]

        it("returns the [left, right] range of duplicated keys", () => {
            expect(BinarySearch.rangeMapped(data, 3, numCmp, idMap)).toEqual([3, 5])
        })

        it("returns [insertionPoint, floor] for missing key", () => {
            // for 2.5 insertion point is index 3, floor is 2 at index 2
            expect(BinarySearch.rangeMapped(data, 2.5, numCmp, idMap)).toEqual([3, 2])
        })
    })
})