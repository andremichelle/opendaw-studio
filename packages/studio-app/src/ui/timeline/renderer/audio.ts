import {TimelineRange} from "@/ui/timeline/TimelineRange.ts"
import {RegionBound, RegionColors} from "@/ui/timeline/renderer/env.ts"
import {dbToGain, LoopableRegion} from "lib-dsp"
import {Peaks, PeaksPainter} from "lib-fusion"
import {AudioFileBoxAdapter} from "studio-adapters"

export const renderAudio = (context: CanvasRenderingContext2D,
                            range: TimelineRange,
                            file: AudioFileBoxAdapter,
                            gain: number,
                            {top, bottom}: RegionBound,
                            {contentColor, contentLoopColor}: RegionColors,
                            {
                                index,
                                resultStart,
                                resultEnd,
                                resultStartValue,
                                resultEndValue
                            }: LoopableRegion.LoopCycle) => {
    if (file.peaks.nonEmpty()) {
        const x0 = range.unitToX(resultStart) * devicePixelRatio
        const x1 = range.unitToX(resultEnd) * devicePixelRatio
        const ht = bottom - top
        context.fillStyle = index === 0 ? contentColor : contentLoopColor
        const peaks: Peaks = file.peaks.unwrap()
        const numFrames = peaks.numFrames
        const numberOfChannels = peaks.numChannels
        const peaksHeight = Math.floor((ht - 4) / numberOfChannels)
        const scale = dbToGain(-gain)
        for (let channel = 0; channel < numberOfChannels; channel++) {
            PeaksPainter.renderBlocks(context, peaks, channel, {
                u0: resultStartValue * numFrames,
                u1: resultEndValue * numFrames,
                v0: -scale,
                v1: +scale,
                x0: x0,
                x1: x1,
                y0: 3 + top + channel * peaksHeight,
                y1: 3 + top + (channel + 1) * peaksHeight
            })
        }
    }
}