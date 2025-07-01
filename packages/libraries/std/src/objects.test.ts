import {describe, expect, it} from "vitest"
import {Objects} from "./objects"

describe("objects", () => {
    it("merge", () => {
        expect(Objects.mergeNoOverlap({a: 1}, {b: 2, c: 3})).toEqual({a: 1, b: 2, c: 3})
        expect(Objects.mergeNoOverlap({}, {b: 2, c: 3})).toEqual({b: 2, c: 3})
        // @ts-expect-error
        expect(() => Objects.mergeNoOverlap({a: 1}, {a: 2, c: 3})).toThrow()
        // @ts-expect-error
        expect(() => Objects.mergeNoOverlap({c: 1}, {b: 2, c: 3})).toThrow()
    })

    it("include", () => {
        expect({a: 1, b: 2, c: 3}).toEqual({a: 1, b: 2, c: 3})
        expect(Objects.include({a: 1, b: 2, c: 3})).toEqual({})
        expect(Objects.include({a: 1, b: 2, c: 3}, "a")).toEqual({a: 1})
        expect(Objects.include({a: 1, b: 2, c: 3}, "a", "b")).toEqual({a: 1, b: 2})
        expect(Objects.include({a: 1, b: 2, c: 3}, "a", "b", "c")).toEqual({a: 1, b: 2, c: 3})
    })
    it("exclude", () => {
        expect({a: 1, b: 2, c: 3}).toEqual({a: 1, b: 2, c: 3})
        expect(Objects.exclude({a: 1, b: 2, c: 3})).toEqual({a: 1, b: 2, c: 3})
        expect(Objects.exclude({a: 1, b: 2, c: 3}, "a")).toEqual({b: 2, c: 3})
        expect(Objects.exclude({a: 1, b: 2, c: 3}, "a", "b")).toEqual({c: 3})
        expect(Objects.exclude({a: 1, b: 2, c: 3}, "a", "b", "c")).toEqual({})
    })
})