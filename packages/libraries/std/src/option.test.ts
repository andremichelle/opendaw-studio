import {describe, expect, it, vi} from "vitest"
import {Option} from "./option"

describe("Option helper", () => {
    /* ------------------------------------------------------------------
     * constructors & factories
     * ------------------------------------------------------------------ */
    it("wrap() turns nullish values into None", () => {
        expect(Option.wrap(null).isEmpty()).toBe(true)
        expect(Option.wrap(undefined).isEmpty()).toBe(true)
        expect(Option.wrap(0).nonEmpty()).toBe(true)
    })

    it("tryGet() and execute()", () => {
        expect(Option.from(() => 7).unwrap()).toBe(7)
        expect(Option.from(() => null).isEmpty()).toBe(true)

        const hello = (msg: string) => `hello ${msg}`
        expect(Option.execute(hello, "world").unwrap()).toBe("hello world")
    })

    it("async() wraps resolved/rejected promises", async () => {
        const some = await Option.async(Promise.resolve("done"))
        expect(some.unwrap()).toBe("done")

        const none = await Option.async(Promise.reject("fail"))
        expect(none.isEmpty()).toBe(true)
    })

    /* ------------------------------------------------------------------
     * basic inspection helpers
     * ------------------------------------------------------------------ */
    it("contains(), isEmpty(), nonEmpty()", () => {
        const some = Option.wrap(42)
        expect(some.contains(42)).toBe(true)
        expect(some.contains(0)).toBe(false)
        expect(some.isEmpty()).toBe(false)
        expect(some.nonEmpty()).toBe(true)

        const none: Option<number> = Option.None
        expect(none.contains(42)).toBe(false)
        expect(none.isEmpty()).toBe(true)
        expect(none.nonEmpty()).toBe(false)
    })

    /* ------------------------------------------------------------------
     * unwrap & variants
     * ------------------------------------------------------------------ */
    it("unwrap() returns value for Some and throws for None", () => {
        expect(Option.wrap("x").unwrap()).toBe("x")
        expect(() => Option.wrap(null).unwrap()).toThrow()
    })

    it("unwrapOrElse(), unwrapOrNull(), unwrapOrUndefined()", () => {
        const some = Option.wrap(5)
        expect(some.unwrapOrElse(0)).toBe(5)
        expect(some.unwrapOrNull()).toBe(5)
        expect(some.unwrapOrUndefined()).toBe(5)

        const none = Option.wrap<number>(undefined)
        expect(none.unwrapOrElse(123)).toBe(123)
        expect(none.unwrapOrNull()).toBeNull()
        expect(none.unwrapOrUndefined()).toBeUndefined()
    })

    /* ------------------------------------------------------------------
     * functional helpers
     * ------------------------------------------------------------------ */
    it("match()", () => {
        const matcher = {some: (n: number) => n * 2, none: () => -1}
        expect(Option.wrap(3).match(matcher)).toBe(6)
        expect(Option.None.match(matcher)).toBe(-1)
    })

    it("ifSome() executes procedure only for Some", () => {
        const spy = vi.fn()
        Option.wrap(1).ifSome(spy)
        Option.wrap(null).ifSome(spy)
        expect(spy).toHaveBeenCalledTimes(1)
        expect(spy).toHaveBeenCalledWith(1)
    })

    it("map(), mapOr()", () => {
        const some = Option.wrap(10)
        expect(some.map(n => n / 2).unwrap()).toBe(5)
        expect(some.mapOr(n => n * 2, 0)).toBe(20)

        const none = Option.wrap<number>(null)
        expect(none.map(() => 1).isEmpty()).toBe(true)
        expect(none.mapOr(() => 1, 99)).toBe(99)
    })

    it("flatMap()", () => {
        const result = Option.wrap(3)
            .flatMap(v => Option.wrap(v > 2 ? "ok" : null))
            .unwrap()
        expect(result).toBe("ok")

        const none = Option.wrap(1)
            .flatMap(v => Option.wrap(v > 2 ? "ok" : null))
        expect(none.isEmpty()).toBe(true)
    })

    /* ------------------------------------------------------------------
     * equals() & toString()
     * ------------------------------------------------------------------ */
    it("equals() compares structural equality", () => {
        expect(Option.wrap(1).equals(Option.wrap(1))).toBe(true)
        expect(Option.wrap(1).equals(Option.wrap(2))).toBe(false)
        expect(Option.wrap(null).equals(Option.None)).toBe(true) // both None
    })

    it("toString / Symbol.toStringTag give debug friendly info", () => {
        const some = Option.wrap("a")
        const none = Option.wrap(null)
        expect(`${some}`).toMatch("Option.Some")
        expect(`${none}`).toMatch("Option.None")
    })

    /* ------------------------------------------------------------------
     * assert()
     * ------------------------------------------------------------------ */
    it("assert() returns self for Some and throws for None", () => {
        expect(() => Option.wrap(null).assert("fail")).toThrow("fail")
        const value = Option.wrap(9).assert()
        expect(value.unwrap()).toBe(9)
    })
})