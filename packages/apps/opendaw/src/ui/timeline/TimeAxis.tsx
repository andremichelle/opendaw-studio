import css from "./TimeAxis.sass?inline"
import {clamp, EmptyExec, isDefined, Lifecycle, Nullable, Option} from "lib-std"
import {createElement} from "lib-jsx"
import {Colors} from "@/ui/Colors.ts"
import {Propagation} from "lib-box"
import {StudioService} from "@/service/StudioService.ts"
import {TimeGrid} from "@/ui/timeline/TimeGrid.ts"
import {TimelineRange} from "@/ui/timeline/TimelineRange.ts"
import {Snapping} from "@/ui/timeline/Snapping.ts"
import {CanvasPainter} from "@/ui/canvas/painter.ts"
import {ppqn, PPQN} from "lib-dsp"
import {Dragging, Events, Html} from "lib-dom"
import {DblClckTextInput} from "@/ui/wrapper/DblClckTextInput"
import {TextTooltip} from "@/ui/surface/TextTooltip"

const className = Html.adoptStyleSheet(css, "time-axis")

const MIN_TRACK_DURATION = 8 * PPQN.Bar
const MAX_TRACK_DURATION = 1024 * PPQN.Bar

type Construct = {
    lifecycle: Lifecycle
    service: StudioService
    snapping: Snapping
    range: TimelineRange
    mapper?: TimeAxisCursorMapper
}

export interface TimeAxisCursorMapper {
    mapPlaybackCursor(position: ppqn): ppqn
}

export const TimeAxis = ({lifecycle, service, snapping, range, mapper}: Construct) => {
    let endMarkerPosition: Nullable<ppqn> = null
    const {project: {timelineBox: {signature, durationInPulses}, position, editing, boxGraph}} = service
    const canvas: HTMLCanvasElement = <canvas/>
    const painter = lifecycle.own(new CanvasPainter(canvas, ({context}) => {
        const {height} = canvas
        const {fontFamily, fontSize} = getComputedStyle(canvas)
        context.fillStyle = Colors.shadow
        context.textBaseline = "alphabetic"
        context.font = `${parseFloat(fontSize) * devicePixelRatio}px ${fontFamily}`
        const textY = height - 4 * devicePixelRatio
        const {nominator, denominator} = signature
        TimeGrid.fragment([nominator.getValue(), denominator.getValue()],
            range, ({bars, beats, isBar, isBeat, pulse}) => {
                const x = Math.floor(range.unitToX(pulse) * devicePixelRatio)
                const textX = x + 5
                if (isBar) {
                    context.fillRect(x, 0, 2, height)
                    context.fillText((bars + 1).toFixed(0), textX, textY)
                } else if (isBeat) {
                    context.fillRect(x, height * 0.5, 1, height * 0.5)
                    context.fillRect(x, height * 0.5, 4, 1)
                    context.fillText((bars + 1) + "•" + (beats + 1), textX, textY)
                } else {
                    context.fillRect(x, height * 0.5, 1, height * 0.5)
                }
            })
        const pulse = service.engine.playbackTimestamp().getValue()
        const x = Math.floor(range.unitToX(pulse) * devicePixelRatio)
        context.fillStyle = "rgba(255, 255, 255, 0.25)"
        context.fillRect(x, 0, devicePixelRatio, height)
    }))
    const cursorElement: HTMLDivElement = <div className="cursor" data-component="cursor"/>
    const updateCursor = () => {
        const pulses = isDefined(mapper) ? mapper.mapPlaybackCursor(position.getValue()) : position.getValue()
        cursorElement.style.left = `${Math.floor(range.unitToX(pulses))}px`
        cursorElement.style.visibility = range.unitMin <= pulses && pulses < range.unitMax ? "visible" : "hidden"
    }
    const endMarkerElement: HTMLDivElement = <div className="end-marker" data-component="end-marker"/>
    const updateEndMarker = () => {
        const pulses = endMarkerPosition ?? durationInPulses.getValue()
        endMarkerElement.style.left = `${Math.floor(range.unitToX(pulses))}px`
        endMarkerElement.style.visibility = range.unitMin <= pulses && pulses < range.unitMax ? "visible" : "hidden"
    }
    const onResize = () => {
        if (!canvas.isConnected) {return}
        range.width = canvas.clientWidth
        painter.requestUpdate()
        updateCursor()
        updateEndMarker()
    }
    lifecycle.ownAll(
        range.subscribe(updateCursor),
        range.subscribe(updateEndMarker),
        position.subscribe(updateCursor),
        durationInPulses.catchupAndSubscribe(() => updateEndMarker()),
        Dragging.attach(canvas, () => Option.wrap({
            update: (event: Dragging.Event) => {
                const x = event.clientX - canvas.getBoundingClientRect().left
                const p = Math.max(0, range.xToUnit(x))
                service.engine.requestPosition(snapping.round(p))
                if (p < range.unitMin) {
                    range.moveToUnit(p)
                } else if (p > range.unitMax) {
                    range.moveToUnit(p - range.unitRange)
                }
            }
        }), {immediate: true, permanentUpdates: false}),
        TextTooltip.simple(endMarkerElement, () => {
            const rect = endMarkerElement.getBoundingClientRect()
            return ({
                text: "Double-click to edit",
                clientX: rect.left,
                clientY: rect.top + 24
            })
        }),
        Events.subscribe(canvas, "wheel", (event: WheelEvent) => {
            event.preventDefault()
            const scale = event.deltaY * 0.01
            const rect = canvas.getBoundingClientRect()
            range.scaleBy(scale, range.xToValue(event.clientX - rect.left))
            range.moveBy(event.deltaX * 0.00001)
        }, {passive: false}),
        Html.watchResize(canvas, onResize),
        range.subscribe(painter.requestUpdate),
        service.engine.playbackTimestamp().subscribe(painter.requestUpdate),
        boxGraph.subscribeVertexUpdates(Propagation.Children, signature.address, painter.requestUpdate)
    )
    return (
        <div className={className}>
            {canvas}
            <DblClckTextInput resolversFactory={() => {
                const resolvers = Promise.withResolvers<string>()
                resolvers.promise.then((value: string) => {
                    const number = parseFloat(value)
                    if (isNaN(number)) {return}
                    editing.modify(() => durationInPulses.setValue(clamp(number * PPQN.Bar, MIN_TRACK_DURATION, MAX_TRACK_DURATION)))
                }, EmptyExec)
                return resolvers
            }} provider={() => ({
                unit: "bars",
                value: PPQN.toParts(durationInPulses.getValue() - PPQN.Bar).bars.toString()
            })} location={() => {
                const rect = endMarkerElement.getBoundingClientRect()
                return {x: rect.left - 32, y: rect.top}
            }}>
                {endMarkerElement}
            </DblClckTextInput>
            {cursorElement}
        </div>
    )
}