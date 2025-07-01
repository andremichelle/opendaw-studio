import {describe, expect, it} from "vitest"
import {PPQN} from "./ppqn"

describe("PPQN", () => {
    it("should convert", () => {
        expect(PPQN.pulsesToSeconds(PPQN.Quarter, 60)).toBe(1)
        expect(PPQN.pulsesToSeconds(PPQN.Quarter, 120)).toBe(0.5)
        expect(PPQN.secondsToPulses(1, 60)).toBe(PPQN.Quarter)
        expect(PPQN.secondsToPulses(0.5, 60)).toBe(PPQN.Quarter / 2)
    })
})
it("should handle 1 quarter note (960 ppqn) correctly", () => {
    const result = PPQN.toParts(PPQN.Quarter)
    expect(result).toEqual({
        bars: 0,
        beats: 1,
        semiquavers: 0,
        ticks: 0
    })
})
it("should handle 1 bar in 4/4 (3840 ppqn) correctly", () => {
    const result = PPQN.toParts(PPQN.Bar)
    expect(result).toEqual({
        bars: 1,
        beats: 0,
        semiquavers: 0,
        ticks: 0
    })
})
it("should handle 1 beat and 2 semiquavers correctly", () => {
    const result = PPQN.toParts(PPQN.Quarter + PPQN.SemiQuaver * 2)
    expect(result).toEqual({
        bars: 0,
        beats: 1,
        semiquavers: 2,
        ticks: 0
    })
})
it("should handle remaining ticks after semiquavers correctly", () => {
    const result = PPQN.toParts(PPQN.Quarter + PPQN.SemiQuaver * 2 + 100)
    expect(result).toEqual({
        bars: 0,
        beats: 1,
        semiquavers: 2,
        ticks: 100
    })
})
it("should handle composite", () => {
    const bars = 113
    const beats = 3
    const semiquavers = 1
    const ticks = 111
    const result = PPQN.toParts(PPQN.Bar * bars + PPQN.Quarter * beats + PPQN.SemiQuaver * semiquavers + ticks)
    expect(result).toEqual({
        bars,
        beats,
        semiquavers,
        ticks
    })
})
it("should handle composite (overflow beats)", () => {
    const bars = 113
    const beats = 4
    const semiquavers = 1
    const ticks = 111
    const result = PPQN.toParts(PPQN.Bar * bars + PPQN.Quarter * beats + PPQN.SemiQuaver * semiquavers + ticks)
    expect(result).toEqual({
        bars: bars + 1,
        beats: 0,
        semiquavers,
        ticks
    })
})