import {asDefined, Lifecycle, quantizeFloor} from "std"
import {deferNextFrame, Html} from "dom"
import {PPQN} from "dsp"
import {Colors} from "@/ui/Colors.ts"
import {createElement} from "jsx"
import {Project} from "@/project/Project.ts"
import {AudioUnitTracks} from "@core/shared/adapters/audio-unit/AudioUnitTracks.ts"

type Contruct = {
    lifecycle: Lifecycle
    project: Project
    tracks: AudioUnitTracks
}

export const Timeline = ({lifecycle, project, tracks}: Contruct) => {
    const canvas: HTMLCanvasElement = <canvas/>
    const context = asDefined(canvas.getContext("2d"))
    const unitMin = -PPQN.Quarter * 12
    const unitMax = PPQN.Quarter * 12
    const mapping = (unit: number) => (unit - unitMin) / (unitMax - unitMin)
    const redraw = deferNextFrame(() => {
        const {width, height} = canvas
        const position = project.position.getValue()
        context.resetTransform()
        context.clearRect(0, 0, width, height)
        const heightHalf = height / 2
        for (const [index, track] of tracks.collection.adapters()
            .toSorted((a, b) => a.indexField.getValue() - b.indexField.getValue()).entries()) {
            for (const region of track.regions.collection.iterateRange(unitMin + position, unitMax + position)) {
                const x0 = Math.floor(mapping(region.position - position) * width)
                const x1 = Math.floor(mapping(region.complete - position) * width)
                const xn = x1 - x0
                if (xn >= 1) {
                    context.fillStyle = `hsl(${region.hue}, 60%, 60%)`
                    context.fillRect(x0, 4 + index * heightHalf, xn, heightHalf / 2)
                    context.fill()
                }
            }
        }
        context.fillStyle = Colors.cream
        const interval = PPQN.Bar
        for (let pulse = quantizeFloor(unitMin + position, interval); pulse < unitMax + position; pulse += interval) {
            const n = mapping(pulse - position)
            const x = Math.floor(n * width)
            const {beats, ticks} = PPQN.toParts(pulse)
            const isBeat = ticks === 0
            const isBar = isBeat && beats === 0
            if (isBar) {
                if (pulse < 0) {
                    context.fillRect(x, 1, 1, 1)
                } else {
                    context.fillRect(x, 0, 1, 3)
                }
            }
        }
    })
    lifecycle.own(Html.watchResize(canvas, () => {
        canvas.width = canvas.clientWidth * devicePixelRatio
        canvas.height = canvas.clientHeight * devicePixelRatio
        redraw.request()
    }))
    lifecycle.own(project.position.subscribe(() => redraw.request()))
    lifecycle.own(tracks.subscribeAnyChange(redraw.request))
    return canvas
}