import {CanvasPainter} from "@/ui/canvas/painter.ts"
import {int, Procedure, TAU} from "opendaw-std"
import {AudioClipBoxAdapter} from "studio-shared"
import {Peaks} from "opendaw-fusion"
import {dbToGain} from "opendaw-dsp"

export const createAudioClipPainter = (adapter: AudioClipBoxAdapter): Procedure<CanvasPainter> => painter => {
    const {context, actualHeight: size} = painter
    const radius = size >> 1
    const {file, gain} = adapter
    if (file.peaks.isEmpty()) {return}
    const numRays = 256 // TODO We should make this dependent on the size
    const peaks = file.peaks.unwrap()
    const unitsEachPixel = peaks.numFrames / numRays
    const stage = peaks.nearest(unitsEachPixel)
    if (stage === null) {return}
    const unitsEachPeak = stage.unitsEachPeak()
    const peaksEachRay = unitsEachPixel / unitsEachPeak
    const data: Int32Array = peaks.data[0]
    const scale = dbToGain(gain)
    context.save()
    context.translate(radius, radius)
    context.strokeStyle = `hsl(${adapter.hue}, 50%, 80%)`
    const minRadius = 4 * devicePixelRatio
    const maxRadius = radius - 4 * devicePixelRatio
    const centerRadius = (minRadius + maxRadius) * 0.5
    let from = 0
    let indexFrom: int = 0 | 0
    let min: number = 0.0
    let max: number = 0.0

    for (let i = 0; i < numRays; i++) {
        const to = from + peaksEachRay
        const indexTo = Math.floor(to)
        let swap = false
        while (indexFrom < indexTo) {
            const bits = data[stage.dataOffset + indexFrom++]
            min = Math.min(Peaks.unpack(bits, 0), min)
            max = Math.max(Peaks.unpack(bits, 1), max)
            swap = true
        }
        const angle = i / numRays * TAU
        const sin = Math.sin(angle)
        const cos = -Math.cos(angle)
        const minR = centerRadius - min * (minRadius - centerRadius) * scale
        const maxR = centerRadius + max * (maxRadius - centerRadius) * scale
        context.moveTo(sin * minR, cos * minR)
        context.lineTo(sin * maxR, cos * maxR)
        if (swap) {
            const tmp = max
            max = min
            min = tmp
        }
        from = to
        indexFrom = indexTo
    }
    context.stroke()
    context.restore()
}