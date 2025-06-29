import {describe, expect, it} from "vitest"
import {CssUtils} from "./css-utils"

describe("css-utils", () => {
    it("should compute the correct values", () => {
        expect(CssUtils.calc("(50% - 1em) * 2px", 512, 16)).toBe(480)
        expect(CssUtils.calc("50% - 0.0625em", 512, 16)).toBe(255)
        expect(CssUtils.calc("50% - 0.0625em - 1px", 512, 16)).toBe(254)
        expect(CssUtils.calc("50% - 0.0625em + 1px", 512, 16)).toBe(256)
        expect(CssUtils.calc(" 50%-.0625em+1px", 512, 16)).toBe(256)
    })
})