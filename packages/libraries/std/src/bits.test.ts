// noinspection JSUnusedLocalSymbols

import {describe, expect, it} from "vitest"
import {Bits} from "./bits"

describe("Bits", () => {

    /* ------------------------------------------------------------------ *
     * static helpers: every() / some()
     * ------------------------------------------------------------------ */
    describe("Bits.every() / Bits.some()", () => {
        const FLAG_A = 0b0001
        const FLAG_B = 0b0010
        const FLAG_C = 0b0100
        const SET = FLAG_A | FLAG_B          // 0b0011

        it("every() returns true when all flags are present", () => {
            expect(Bits.every(SET, FLAG_A)).toBe(true)
            expect(Bits.every(SET, FLAG_A | FLAG_B)).toBe(true)
        })

        it("every() returns false when at least one flag is missing", () => {
            expect(Bits.every(SET, FLAG_C)).toBe(false)
            expect(Bits.every(SET, FLAG_B | FLAG_C)).toBe(false)
        })

        it("some() returns true when any flag is present", () => {
            expect(Bits.some(SET, FLAG_A)).toBe(true)
            expect(Bits.some(SET, FLAG_B | FLAG_C)).toBe(true)
        })

        it("some() returns false when no flags are present", () => {
            expect(Bits.some(SET, FLAG_C)).toBe(false)
        })
    })

    /* ------------------------------------------------------------------ *
     * constructor, setBit(), getBit(), toString()
     * ------------------------------------------------------------------ */
    describe("bit operations", () => {
        const bits = new Bits() // default 32 bits

        it("is initially empty", () => {
            expect(bits.isEmpty()).toBe(true)
            expect(bits.nonEmpty()).toBe(false)
            expect(bits.toString()).toBe("0".repeat(32))
        })

        it("setBit() toggles bits and reports changes", () => {
            // set bit 0 => change expected
            expect(bits.setBit(0, true)).toBe(true)
            expect(bits.getBit(0)).toBe(true)

            // setting the same state again => no change
            expect(bits.setBit(0, true)).toBe(false)

            // clear bit 0 => change expected
            expect(bits.setBit(0, false)).toBe(true)
            expect(bits.getBit(0)).toBe(false)
        })

        it("updates empty/nonEmpty flags correctly", () => {
            bits.setBit(5, true)
            expect(bits.isEmpty()).toBe(false)
            expect(bits.nonEmpty()).toBe(true)

            bits.setBit(5, false)
            expect(bits.isEmpty()).toBe(true)
            expect(bits.nonEmpty()).toBe(false)
        })

        it("toString() length equals numBits and shows MSB first", () => {
            bits.setBit(31, true)                 // highest bit
            const str = bits.toString()
            expect(str.length).toBe(32)
            expect(str[0]).toBe("1")              // MSB set
            bits.setBit(31, false)                // reset for later tests
        })
    })

    /* ------------------------------------------------------------------ *
     * buffer getter / setter & replace()
     * ------------------------------------------------------------------ */
    describe("buffer interactions", () => {
        const source = new Bits(64)
        source.setBit(10, true)
        source.setBit(63, true)
        const target = new Bits(64)

        it("buffer property copies underlying data", () => {
            target.buffer = source.buffer
            expect(target.getBit(10)).toBe(true)
            expect(target.getBit(63)).toBe(true)
        })

        it("replace() returns false when buffers are identical", () => {
            expect(target.replace(source.buffer)).toBe(false)
        })

        it("replace() copies and returns true for differing buffers", () => {
            const other = new Bits(64)
            other.setBit(1, true)
            expect(target.replace(other.buffer)).toBe(true)
            expect(target.getBit(1)).toBe(true)
            // previously set bit 63 should now be cleared
            expect(target.getBit(63)).toBe(false)
        })
    })

    /* ------------------------------------------------------------------ *
     * clear()
     * ------------------------------------------------------------------ */
    describe("clear()", () => {
        const bits = new Bits(16)
        bits.setBit(3, true)
        bits.setBit(7, true)

        it("zeroes all bits", () => {
            expect(bits.nonEmpty()).toBe(true)
            bits.clear()
            expect(bits.isEmpty()).toBe(true)
            expect(bits.toString()).toBe("0".repeat(16))
        })
    })
})