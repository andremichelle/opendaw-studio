// noinspection JSVoidFunctionReturnValueUsed

import {describe, expect, it} from "vitest"
import {Attempt, Attempts} from "./attempts"
import {Option} from "./option"

describe("Attempts", () => {
    /* ------------------------------------------------------------------ *
     * ok()
     * ------------------------------------------------------------------ */
    describe("Attempts.ok()", () => {
        const attempt = Attempts.ok(21)

        it("represents a successful attempt", () => {
            expect(attempt.isSuccess()).toBe(true)
            expect(attempt.isFailure()).toBe(false)
            expect(attempt.result()).toBe(21)
            expect(() => attempt.failureReason()).toThrow()      // wrong accessor
        })

        it("converts to a non-empty Option", () => {
            const opt = attempt.asOption()
            expect(opt).instanceOf(Option.Some)
            expect(opt.nonEmpty()).toBe(true)
            expect(opt.unwrap()).toBe(21)
        })

        it("maps synchronously and propagates exceptions as failure", () => {
            const mapped = attempt.map((n) => n * 2)
            expect(mapped.isSuccess()).toBe(true)
            expect(mapped.result()).toBe(42)

            // mapping throws => turned into failure
            const failed = attempt.map(() => {
                throw "boom"
            })
            expect(failed.isFailure()).toBe(true)
            expect(failed.failureReason()).toBe("boom")
        })

        it("flatMaps into another Attempt", () => {
            const flatMapped = attempt.flatMap((n) => Attempts.ok(n + 1))
            expect(flatMapped.result()).toBe(22)

            const failed = attempt.flatMap(() => Attempts.err("failed"))
            expect(failed.isFailure()).toBe(true)
            expect(failed.failureReason()).toBe("failed")
        })

        it("match() chooses the ok branch", () => {
            const res = attempt.match({
                ok: (v) => `value=${v}`,
                err: (_) => "should not happen"
            })
            expect(res).toBe("value=21")
        })

        it("toVoid() converts the result into void success", () => {
            const v = attempt.toVoid()
            expect(v.isSuccess()).toBe(true)
            expect(v.result()).toBeUndefined()
        })

        it("failure<>() throws because it is already successful", () => {
            expect(() => attempt.failure()).toThrow()
        })
    })

    /* ------------------------------------------------------------------ *
     * Attempts.Ok (void success singleton)
     * ------------------------------------------------------------------ */
    describe("Attempts.Ok", () => {
        const ok = Attempts.Ok

        it("behaves as a successful attempt returning void", () => {
            expect(ok.isSuccess()).toBe(true)
            expect(ok.result()).toBeUndefined()
            expect(ok.asOption().isEmpty()).toBe(true)          // void maps to None
        })
    })

    /* ------------------------------------------------------------------ *
     * err()
     * ------------------------------------------------------------------ */
    describe("Attempts.err()", () => {
        const attempt: Attempt<number, string> = Attempts.err("failure")

        it("represents a failed attempt", () => {
            expect(attempt.isFailure()).toBe(true)
            expect(attempt.isSuccess()).toBe(false)
            expect(attempt.failureReason()).toBe("failure")
            expect(() => attempt.result()).toThrow()
        })

        it("asOption() is empty", () => {
            expect(attempt.asOption().isEmpty()).toBe(true)
        })

        it("map() and flatMap() keep the failure unchanged", () => {
            const mapped = attempt.map((n) => n * 2)
            const flatNote = attempt.flatMap((n) => Attempts.ok(n * 2))
            expect(mapped).toBe(attempt)
            expect(flatNote).toBe(attempt)
        })

        it("match() chooses the err branch", () => {
            const res = attempt.match({
                ok: (_) => "no",
                err: (r) => `reason=${r}`
            })
            expect(res).toBe("reason=failure")
        })

        it("failure<>() returns the same reference", () => {
            const same = attempt.failure<number>()
            expect(same).toBe(attempt)
        })
    })

    /* ------------------------------------------------------------------ *
     * tryGet()
     * ------------------------------------------------------------------ */
    describe("Attempts.tryGet()", () => {
        it("wraps a successful provider call", () => {
            const attempt = Attempts.tryGet(() => 123)
            expect(attempt.isSuccess()).toBe(true)
            expect(attempt.result()).toBe(123)
        })

        it("converts thrown exceptions into failure", () => {
            const attempt = Attempts.tryGet(() => {
                throw "bad"
            })
            expect(attempt.isFailure()).toBe(true)
            expect(attempt.failureReason()).toBe("bad")
        })
    })

    /* ------------------------------------------------------------------ *
     * async()
     * ------------------------------------------------------------------ */
    describe("Attempts.async()", () => {
        it("resolves to an ok() attempt on fulfilled promise", async () => {
            const attempt = await Attempts.async(Promise.resolve("yay"))
            expect(attempt.isSuccess()).toBe(true)
            expect(attempt.result()).toBe("yay")
        })

        it("resolves to an err() attempt on rejected promise", async () => {
            const attempt = await Attempts.async(Promise.reject("nope"))
            expect(attempt.isFailure()).toBe(true)
            expect(attempt.failureReason()).toBe("nope")
        })
    })

    /* ------------------------------------------------------------------ *
     * failure() / remove result
     * ------------------------------------------------------------------ */
    describe("failure() helper semantics", () => {
        it("turns a failure attempt into a typed one", () => {
            const err = Attempts.err<number, string>("x")
            const typed: Attempt<never, string> = err.failure()
            expect(typed).toBe(err)
        })
    })
})