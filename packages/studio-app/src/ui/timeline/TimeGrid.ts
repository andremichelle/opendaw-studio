import {PPQN} from "opendaw-dsp"
import {int, quantizeFloor} from "opendaw-std"
import {TimelineRange} from "@/ui/timeline/TimelineRange.ts"

export namespace TimeGrid {
    export type Signature = [int, int]
    export type Options = { minLength?: number }
    export type Fragment = { bars: int, beats: int, ticks: int, isBar: boolean, isBeat: boolean, pulse: number }
    export type Designer = (fragment: Fragment) => void

    export const fragment = ([nominator, denominator]: Signature,
                             range: TimelineRange, designer: Designer, options?: Options): void => {
        const unitsPerPixel = range.unitsPerPixel
        if (unitsPerPixel <= 0) {return}
        const barPulses = PPQN.fromSignature(nominator, denominator)
        const minLength = options?.minLength ?? 48
        let interval = barPulses
        let pixel = interval / unitsPerPixel
        if (pixel > minLength) {
            // scaling down the interval until we hit the minimum length
            while (pixel > minLength) {
                interval *= 0.5
                pixel = interval / unitsPerPixel
            }
        }
        if (pixel < minLength) {
            // scaling up the interval until we hit the minimum length
            while (pixel < minLength) {
                interval *= 2.0
                pixel = interval / unitsPerPixel
            }
        }
        const p0 = quantizeFloor(range.unitMin, interval)
        const p1 = range.unitMax
        for (let pulse = p0; pulse < p1; pulse += interval) {
            const {bars, beats, semiquavers, ticks} = PPQN.toParts(pulse, nominator, denominator)
            const isBeat = ticks === 0 && semiquavers === 0
            const isBar = isBeat && beats === 0
            designer({bars, beats, ticks, isBar, isBeat, pulse})
        }
    }
}