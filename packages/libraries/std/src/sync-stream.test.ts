import {describe, expect, it, vi} from "vitest"
import {ByteArrayInput, ByteArrayOutput} from "./data"
import {SyncStream} from "./sync-stream"
import {Schema} from "./schema"

/* ------------------------------------------------------------------ *
 * Minimal stub that fulfils the Schema.IO<T> contract.
 * We serialise a single signed 32-bit integer (4 bytes).
 * ------------------------------------------------------------------ */
type Sample = { n: number }

const makeIO = (): Schema.IO<Sample> => ({
    bytesTotal: 4,
    object: {n: 0},
    write(out: ByteArrayOutput) {
        out.writeInt(this.object.n)
    },
    read(inp: ByteArrayInput) {
        this.object.n = inp.readInt()
    }
})

/* ------------------------------------------------------------------ *
 * Tests
 * ------------------------------------------------------------------ */
describe("SyncStream", () => {
    it("round-trips data from sender to receiver exactly once", () => {
        const io = makeIO()

        const spy = vi.fn()

        /* ----------------------  set up writer / reader  ---------------------- */
        // buffer is supplied by the receiver; +1 byte for the state flag
        const reader = SyncStream.reader(io, obj => {
            // verify the incoming value
            expect(obj.n).toBe(42)
            // mutate after read to be sure the writer does not see it
            obj.n = 99
            spy()
        })

        const writer = SyncStream.writer(io, reader.buffer, obj => {
            obj.n = 42
        })

        /* -------------------------  perform I/O  ------------------------------ */
        while (!writer.tryWrite()) {}
        while (!reader.tryRead()) {}
        expect(spy).toHaveBeenCalled()
    })

    it("rejects buffers that are too small", () => {
        const io = makeIO()
        const tiny = new SharedArrayBuffer(1) // definitely smaller than bytesTotal + 1

        expect(() => SyncStream.writer(io, tiny, () => undefined)).toThrow()
    })
})