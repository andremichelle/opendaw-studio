import css from "./PianoRoll.sass?inline"
import {int, Lifecycle, Option} from "lib-std"
import {createElement} from "lib-jsx"
import {CanvasPainter} from "@/ui/canvas/painter.ts"
import {PitchPositioner} from "@/ui/timeline/editors/notes/pitch/PitchPositioner.ts"
import {MidiKeys} from "lib-dsp"
import {ScaleConfig} from "@/ui/timeline/editors/notes/pitch/ScaleConfig.ts"
import {NoteStreamReceiver} from "studio-adapters"
import {Colors} from "@/ui/Colors"
import {NoteSender} from "studio-adapters"
import {Dragging, Events, Html} from "lib-dom"
import {Fonts} from "@/ui/Fonts"

const className = Html.adoptStyleSheet(css, "PianoRoll")

type Construct = {
    lifecycle: Lifecycle
    positioner: PitchPositioner
    scale: ScaleConfig
    noteReceiver: NoteStreamReceiver
    noteSender: NoteSender
}

export const PianoRoll = ({lifecycle, positioner, scale, noteReceiver, noteSender}: Construct) => {
    const canvas: HTMLCanvasElement = <canvas/>
    const canvasPainter = lifecycle.own(new CanvasPainter(canvas, painter => {
        const context = painter.context
        const {canvas: {width}} = context
        const pitchToY = (pitch: int) => positioner.pitchToY(pitch) * devicePixelRatio
        context.textBaseline = "middle"
        context.textAlign = "right"
        context.font = `${positioner.noteHeight * 1.75}px ${Fonts.Rubik["font-family"]}, sans-serif`
        const topNote = positioner.yToPitch(0)
        const bottomNote = positioner.yToPitch(canvas.clientHeight)
        const noteTrackHeight = (positioner.noteHeight - 1) * devicePixelRatio
        for (let note = bottomNote; note <= topNote; note++) {
            const noteToY = pitchToY(note)
            context.fillStyle = MidiKeys.isBlackKey(note) ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.5)"
            context.fillRect(0, noteToY, width, noteTrackHeight)
            if (!scale.has(note)) {
                context.fillStyle = "rgb(192, 64, 64)"
                context.fillRect(width - devicePixelRatio * 3, noteToY, devicePixelRatio * 3, noteTrackHeight)
            }
            if (noteReceiver.isNoteOn(note)) {
                context.fillStyle = Colors.blue
                context.fillRect(0, noteToY, width, noteTrackHeight)
            }
        }
        context.fillStyle = "rgba(0, 0, 0, 0.66)"
        for (let note = bottomNote; note <= topNote; note++) {
            if (note % 12 === 0) {
                const noteToY = pitchToY(note)
                const label = MidiKeys.toFullString(note)
                context.fillText(label, width - devicePixelRatio * 2, noteToY + noteTrackHeight / 2 + 1)
            }
        }
    }))
    const element = <div className={className}>{canvas}</div>
    lifecycle.ownAll(
        Events.subscribe(canvas, "wheel", (event: WheelEvent) => {
            event.preventDefault()
            positioner.scrollModel.moveBy(event.deltaY)
        }, {passive: false}),
        Dragging.attach(canvas, ({clientY}) => {
            let pitch = positioner.yToPitch(clientY - canvas.getBoundingClientRect().top)
            noteSender.noteOn(pitch, 1.0)
            return Option.wrap({
                update: ({clientY}: Dragging.Event) => {
                    const newPitch = positioner.yToPitch(clientY - canvas.getBoundingClientRect().top)
                    if (pitch !== newPitch) {
                        noteSender.noteOff(pitch)
                        pitch = newPitch
                        noteSender.noteOn(pitch, 1.0)
                    }
                },
                finally: () => noteSender.noteOff(pitch)
            })
        }),
        scale.subscribe(() => canvasPainter.requestUpdate()),
        positioner.subscribe(() => canvasPainter.requestUpdate()),
        noteReceiver.subscribe(() => canvasPainter.requestUpdate()),
        Html.watchResize(element, () => canvasPainter.requestUpdate())
    )
    return element
}