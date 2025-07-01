import {describe, expect, it} from "vitest"
import {Color} from "./color"

describe("color", () => {
    it("parse", () => {
        expect(Color.parseCssRgbOrRgba("rgb(0, 0, 0)")).toStrictEqual([0, 0, 0, 1])
        expect(Color.parseCssRgbOrRgba("rgb(255, 0, 0)")).toStrictEqual([1, 0, 0, 1])
        expect(Color.parseCssRgbOrRgba("rgb(255, 255, 0)")).toStrictEqual([1, 1, 0, 1])
        expect(Color.parseCssRgbOrRgba("rgb(255, 255, 255)")).toStrictEqual([1, 1, 1, 1])
        expect(Color.parseCssRgbOrRgba("rgba(255, 255, 255, 0.0)")).toStrictEqual([1, 1, 1, 0])
        expect(Color.parseCssRgbOrRgba("rgba(255, 255, 255, 0.5)")).toStrictEqual([1, 1, 1, 0.5])
        expect(Color.parseCssRgbOrRgba("rgba(255, 255, 255, 1.0)")).toStrictEqual([1, 1, 1, 1])
        expect(Color.parseCssRgbOrRgba("    rgba( 127.5 ,  255 ,     255,    1.0 )   ")).toStrictEqual([0.5, 1, 1, 1])
        expect(() => Color.parseCssRgbOrRgba("rgba(foo,255,255,1.0)")).toThrow()
    })
})