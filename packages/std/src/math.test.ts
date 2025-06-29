import {describe, expect, it} from "vitest"
import {mod} from "./math"

describe("math", () => {
    it("modPositive", () => {
        expect(mod(0, 4) === 0).toBeTruthy()
        expect(mod(1, 4) === 1).toBeTruthy()
        expect(mod(4, 4) === 0).toBeTruthy()
        expect(mod(5, 4) === 1).toBeTruthy()
        expect(mod(-4, 4) === 0).toBeTruthy()
        expect(mod(-5, 4) === 3).toBeTruthy()
        expect(mod(-0.1, 1) === 0.9).toBeTruthy()
    })
})