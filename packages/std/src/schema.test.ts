import {describe, expect, it} from "vitest"
import {ByteArrayInput, ByteArrayOutput, ByteCounter} from "./data"
import {Schema} from "./schema"

/* ------------------------------------------------------------------ */
/* schema under test                                                  */

/* ------------------------------------------------------------------ */
interface DemoObject {
    active: boolean
    id8: number
    id16: number
    score: number
    pi: number
    balance: bigint
    vec: { x: number; y: number }
    samples: Float32Array
}

const schema = {
    active: Schema.bool,
    id8: Schema.int8,
    id16: Schema.int16,
    score: Schema.int32,
    pi: Schema.double,
    balance: Schema.int64,
    vec: {
        x: Schema.float,
        y: Schema.float
    },
    samples: Schema.floats(3)
} as const

const buildDemo = Schema.createBuilder<DemoObject>(schema)

/* ------------------------------------------------------------------ */
/* tests                                                              */
/* ------------------------------------------------------------------ */
describe("Schema IO implementation", () => {
    it("creates a sealed object with correct default values", () => {
        const io = buildDemo()

        expect(io.object).toStrictEqual({
            active: false,
            id8: 0,
            id16: 0,
            score: 0,
            pi: 0,
            balance: 0n,
            vec: {x: 0, y: 0},
            samples: new Float32Array(3)
        })

        // object should be non-extensible because of Object.seal
        expect(() => { (io.object as any).newProp = 123 }).toThrow()
    })

    it("performs a full write → read round-trip", () => {
        /* ----------- original data to be encoded ----------- */
        const first = buildDemo()
        first.object.active = true
        first.object.id8 = 11
        first.object.id16 = 2222
        first.object.score = 333_333
        first.object.pi = 3.14159
        first.object.balance = 987654321n
        first.object.vec.x = 1.25
        first.object.vec.y = -2.5
        first.object.samples.set([0.1, 0.2, 0.3])

        /* ----------- binary write -------------------------- */
        const output = ByteArrayOutput.create(first.bytesTotal)
        first.write(output)

        /* ----------- binary read into a fresh instance ----- */
        const second = buildDemo()
        const reader = new ByteArrayInput(output.toArrayBuffer())
        second.read(reader)

        /* ----------- objects must match -------------------- */
        expect(second.object).toStrictEqual(first.object)
    })

    it("reports the exact byte length using ByteCounter", () => {
        const io = buildDemo()

        // compute expected length manually:
        // bool(1) + int8(1) + int16(2) + int32(4) + double(8) + int64(8)
        // + 2 floats(4*2) + samples(3 * 4) = 1+1+2+4+8+8+8+12 = 44
        const expected = 44
        expect(io.bytesTotal).toBe(expected)

        // verify ByteCounter directly
        const counter = new ByteCounter()
        io.write(counter)
        expect(counter.count).toBe(expected)
    })
})