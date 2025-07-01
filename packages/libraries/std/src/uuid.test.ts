import {describe, expect, it} from "vitest"
import {UUID} from "./uuid"

describe("uuid", () => {
    it("simple tests", () => {
        const values: Uint8Array = UUID.generate()
        expect(UUID.Comparator(values, UUID.parse(UUID.toString(values)))).toBe(0)
        expect(UUID.Comparator(UUID.generate(), UUID.generate())).not.toBe(0)
        expect(UUID.Comparator(UUID.fromInt(0), UUID.Lowest)).toBe(0)
    })
})