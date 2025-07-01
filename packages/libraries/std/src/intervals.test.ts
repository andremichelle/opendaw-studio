import {describe, expect, it} from "vitest"
import {Intervals} from "./intervals"

describe("Intervals.intersect1D", () => {
    it("detects simple overlaps", () => {
        expect(Intervals.intersect1D(0, 5, 3, 7)).toBe(true) // partial overlap
        expect(Intervals.intersect1D(-2, 2, -1, 1)).toBe(true) // one interval fully inside the other
    })

    it("treats touching end-points as intersection", () => {
        expect(Intervals.intersect1D(0, 5, 5, 10)).toBe(true) // share a boundary
    })

    it("returns false for non-overlapping intervals", () => {
        expect(Intervals.intersect1D(0, 4, 5, 9)).toBe(false) // gap between
        expect(Intervals.intersect1D(-10, -2, 0, 3)).toBe(false) // completely separate negative / positive ranges
    })

    it("handles identical intervals", () => {
        expect(Intervals.intersect1D(1, 5, 1, 5)).toBe(true)
    })
})