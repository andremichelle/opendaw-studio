import {describe, expect, it} from "vitest"
import {ValueGuide} from "./value-guides"

describe("ValueGuide – snapping logic", () => {
    /* ------------------------------------------------------------------ *
     *  Single threshold, margin 0.2 (track 100 / snap 20)
     * ------------------------------------------------------------------ */
    it("maps values to X-space with one anchor", () => {
        const guide = ValueGuide.snap(100, 20, [0.4])           // margin 0.2
        const m = guide.margin                                   // 0.2

        // direct pass-through on the left of threshold
        expect(guide.valueToX(0.2)).toBe(0.2)
        expect(guide.valueToX(0.399999)).toBe(0.399999)

        // hit exactly on the threshold → centred inside margin
        expect(guide.valueToX(0.4)).toBe(0.4 + m / 2)            // 0.5

        // right of the threshold → shifted by full margin
        expect(guide.valueToX(0.8)).toBe(0.8 + m)                // 1.0
    })

    /* ------------------------------------------------------------------ *
     *  Two thresholds, margin 0.15 (track 120 / snap 18)
     * ------------------------------------------------------------------ */
    it("handles two snap anchors and round-trips correctly", () => {
        const guide = ValueGuide.snap(120, 18, [0.3, 0.6])       // margin 0.15
        const m = guide.margin                                   // 0.15

        // left region
        expect(guide.valueToX(0.15)).toBe(0.15)

        // exactly on first threshold
        expect(guide.valueToX(0.3)).toBe(0.3 + m / 2)            // 0.375

        // between thresholds
        expect(guide.valueToX(0.45)).toBe(0.45 + m)              // 0.6

        // exactly on the second threshold
        expect(guide.valueToX(0.6)).toBe(0.6 + m + m / 2)  // 0.825

        // right of last threshold
        expect(guide.valueToX(0.9)).closeTo(0.9 + 2 * m, 1e-7)            // 1.2

        // basic inverse mapping checks
        expect(guide.xToValue(0.15)).toBe(0.15)
        expect(guide.xToValue(0.3)).toBe(0.3)
        expect(guide.xToValue(0.301)).toBe(0.3)
        expect(guide.xToValue(0.5)).closeTo(0.5 - m, 1e-7)

        // exhaustive round-trip consistency
        const steps = 800
        for (let i = 0; i <= steps; i++) {
            const value = i / steps
            expect(guide.xToValue(guide.valueToX(value))).closeTo(value, 1e-7)
        }
    })

    /* ------------------------------------------------------------------ *
     *  Enabling / disabling snapping
     * ------------------------------------------------------------------ */
    it("can temporarily disable snapping and keep the raw value", () => {
        const guide = ValueGuide.snap(120, 18, [0.3])            // margin 0.15

        // start at 0.3 (on threshold)
        guide.begin(0.3)
        expect(guide.value()).toBe(0.3)

        // disable snapping, move by 12 px  →  Δ = 12 / 120 = 0.1
        guide.disable()
        guide.moveBy(12)
        expect(guide.value()).closeTo(0.4, 1e-9)                 // pure linear motion

        // re-enable snapping – exposed value must stay identical
        guide.enable()
        expect(guide.value()).closeTo(0.4, 1e-9)
    })
})