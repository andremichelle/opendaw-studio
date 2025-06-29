import {describe, expect, it} from "vitest"
import {Generators} from "./generators"

describe("Generators", () => {
    it("flatten", () => {
        const a = [1, 2, 3]
        const b = [4, 5, 6]
        expect(Array.from(Generators.flatten(a, b))).toStrictEqual([1, 2, 3, 4, 5, 6])
    })
})