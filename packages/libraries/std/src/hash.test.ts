import {describe, expect, it} from "vitest"
import {Hash} from "./hash"

describe("Hash", () => {
    describe("fromBuffers", () => {
        it("should hash single buffer", async () => {
            const buffer = new Uint8Array([1, 2, 3, 4]).buffer
            const hash = await Hash.fromBuffers(buffer)

            expect(hash).toBeInstanceOf(ArrayBuffer)
            expect(hash.byteLength).toBe(32) // SHA-256 produces 32 bytes
        })

        it("should hash multiple buffers", async () => {
            const buffer1 = new Uint8Array([1, 2, 3]).buffer
            const buffer2 = new Uint8Array([4, 5, 6]).buffer
            const hash = await Hash.fromBuffers(buffer1, buffer2)

            expect(hash).toBeInstanceOf(ArrayBuffer)
            expect(hash.byteLength).toBe(32)
        })

        it("should produce consistent results for same input", async () => {
            const input = new Uint8Array([1, 2, 3, 4]).buffer
            const hash1 = await Hash.fromBuffers(input)
            const hash2 = await Hash.fromBuffers(input)

            expect(Hash.equals(hash1, hash2)).toBe(true)
        })

        it("should produce different results for different inputs", async () => {
            const hash1 = await Hash.fromBuffers(new Uint8Array([1, 2, 3]).buffer)
            const hash2 = await Hash.fromBuffers(new Uint8Array([4, 5, 6]).buffer)

            expect(Hash.equals(hash1, hash2)).toBe(false)
        })

        it("should handle empty buffer", async () => {
            const hash = await Hash.fromBuffers(new ArrayBuffer(0))
            expect(hash.byteLength).toBe(32)
        })
    })

    describe("equals", () => {
        it("should return true for identical hashes", async () => {
            const hash = await Hash.fromBuffers(new Uint8Array([1, 2, 3]).buffer)
            expect(Hash.equals(hash, hash)).toBe(true)
        })

        it("should return false for different hashes", async () => {
            const hash1 = await Hash.fromBuffers(new Uint8Array([1]).buffer)
            const hash2 = await Hash.fromBuffers(new Uint8Array([2]).buffer)
            expect(Hash.equals(hash1, hash2)).toBe(false)
        })

        it("should throw for invalid hash length", async () => {
            const validHash = await Hash.fromBuffers(new Uint8Array([1]).buffer)
            const invalidHash = new ArrayBuffer(16) // Wrong length

            expect(() => Hash.equals(validHash, invalidHash))
                .toThrow("Second hash has invalid length")
            expect(() => Hash.equals(invalidHash, validHash))
                .toThrow("First hash has invalid length")
        })
    })

    describe("toString", () => {
        it("should convert hash to hex string", async () => {
            const hash = await Hash.fromBuffers(new Uint8Array([1, 2, 3]).buffer)
            const str = Hash.toString(hash)

            expect(typeof str).toBe("string")
            expect(str).toHaveLength(64) // 32 bytes = 64 hex chars
            expect(str).toMatch(/^[0-9a-f]+$/) // should be hex string
        })

        it("should produce consistent string representations", async () => {
            const input = new Uint8Array([1, 2, 3]).buffer
            const hash1 = await Hash.fromBuffers(input)
            const hash2 = await Hash.fromBuffers(input)

            expect(Hash.toString(hash1)).toBe(Hash.toString(hash2))
        })
    })
})