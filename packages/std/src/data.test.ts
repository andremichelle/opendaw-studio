import {describe, expect, it} from "vitest"
import {ByteArrayInput, ByteArrayOutput, ByteCounter, Checksum} from "./data"

describe("data helpers", () => {
    /* ------------------------------------------------------------------ *
     * ByteArrayOutput / ByteArrayInput round-trip
     * ------------------------------------------------------------------ */
    describe("ByteArrayOutput ↔ ByteArrayInput", () => {
        it("correctly serialises and deserialises all primitive types", () => {
            // create an intentionally tiny buffer to exercise auto-growth logic
            const out = ByteArrayOutput.create(8)

            const values = {
                boolTrue: true,
                boolFalse: false,
                byte: -12,
                short: 0x1234,
                int: 0x12345678,
                long: 0x123456789ABCDEFn,
                float: 123.456,
                double: -9876.54321,
                bytes: Int8Array.from([1, 2, 3, 4]),
                string: "hello"
            }

            out.writeBoolean(values.boolTrue)
            out.writeBoolean(values.boolFalse)
            out.writeByte(values.byte)
            out.writeShort(values.short)
            out.writeInt(values.int)
            out.writeLong(values.long)
            out.writeFloat(values.float)
            out.writeDouble(values.double)
            out.writeBytes(values.bytes)
            out.writeString(values.string)

            // create an input from the generated buffer
            const inp = new ByteArrayInput(out.toArrayBuffer())

            expect(inp.readBoolean()).toBe(values.boolTrue)
            expect(inp.readBoolean()).toBe(values.boolFalse)
            expect(inp.readByte()).toBe(values.byte)
            expect(inp.readShort()).toBe(values.short)
            expect(inp.readInt()).toBe(values.int)
            expect(inp.readLong()).toBe(values.long)
            expect(inp.readFloat()).toBeCloseTo(values.float, 5)
            expect(inp.readDouble()).toBeCloseTo(values.double, 10)

            const bytesRead = new Int8Array(values.bytes.length)
            inp.readBytes(bytesRead)
            expect(Array.from(bytesRead)).toEqual(Array.from(values.bytes))

            expect(inp.readString()).toBe(values.string)

            // no bytes should remain unread
            expect(inp.remaining()).toBe(0)
        })
    })

    /* ------------------------------------------------------------------ *
     * ByteCounter
     * ------------------------------------------------------------------ */
    describe("ByteCounter", () => {
        it("tracks written size exactly as specified", () => {
            const counter = new ByteCounter()

            counter.writeBoolean(true)               // 1
            counter.writeByte(0x11)                  // 1
            counter.writeShort(0x2222)               // 2
            counter.writeInt(0x33333333)             // 4
            counter.writeLong(0x4444444444444444n)   // 8
            counter.writeFloat(1.0)                  // 4
            counter.writeDouble(2.0)                 // 8
            counter.writeBytes(Int8Array.from([7, 8, 9])) // 3
            counter.writeString("abc")               // 4 + len (3) = 7

            const expected = 1 + 1 + 2 + 4 + 8 + 4 + 8 + 3 + 7
            expect(counter.count).toBe(expected)
        })
    })

    /* ------------------------------------------------------------------ *
   * Strings
      * ------------------------------------------------------------------ */
    it("Strings", () => {
        const output = ByteArrayOutput.create()
        const value = "oinkö⍺✅👻"
        output.writeString(value)
        const input = new ByteArrayInput(output.toArrayBuffer())
        expect(input.readString()).toBe(value)
    })

    /* ------------------------------------------------------------------ *
     * Checksum
     * ------------------------------------------------------------------ */

    describe("Checksum", () => {
        it("produces equal results for identical data", () => {
            const cs1 = new Checksum(16)
            const cs2 = new Checksum(16)

            const pushData = (cs: Checksum) => {
                cs.writeInt(0xdeadbeef)
                cs.writeString("fox 🦊")
                cs.writeBytes(Int8Array.from([1, 2, 3, 4]))
            }

            pushData(cs1)
            pushData(cs2)

            expect(cs1.equals(cs2)).toBe(true)
            expect(cs1.toHexString()).toBe(cs2.toHexString())
            expect(cs1.toHexString().length).toBe(16 * 2)
        })

        it("differs for different data", () => {
            const a = new Checksum(8)
            const b = new Checksum(8)

            a.writeInt(42)
            b.writeInt(43)

            expect(a.equals(b)).toBe(false)
        })
    })
})