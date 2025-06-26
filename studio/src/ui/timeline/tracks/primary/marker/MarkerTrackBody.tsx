import css from "./MarkerTrackBody.sass?inline"
import {int, isDefined, Lifecycle, Nullable, Option, UUID} from "std"
import {StudioService} from "@/service/StudioService.ts"
import {TimelineBoxAdapter} from "@core/shared/adapters/timeline/TimelineBoxAdapter.ts"
import {MarkerBoxAdapter} from "@core/shared/adapters/timeline/MarkerBoxAdapter.ts"
import {createElement} from "jsx"
import {ElementCapturing} from "@/ui/canvas/capturing.ts"
import {MarkerBox} from "@core/data/boxes"
import {MarkerRenderer} from "@/ui/timeline/tracks/primary/marker/MarkerRenderer"
import {MarkerTrackAdapter} from "@core/shared/adapters/timeline/MarkerTrackAdapter"
import {MarkerContextMenu} from "@/ui/timeline/tracks/primary/marker/MarkerContextMenu"
import {Markers} from "@/ui/timeline/tracks/primary/marker/Markers"
import {Dragging, Events, Html} from "dom"

const className = Html.adoptStyleSheet(css, "marker-track-body")

type Construct = {
    lifecycle: Lifecycle
    service: StudioService
}

export const MarkerTrackBody = ({lifecycle, service}: Construct) => {
    const {project, engine} = service
    const {editing, boxGraph} = project
    const {range, snapping} = service.timeline
    const markerState = engine.markerState()
    const canvas: HTMLCanvasElement = <canvas style={{fontSize: "1.25em"}}/>
    const position = service.project.position
    const timelineAdapter = project.boxAdapters.adapterFor(project.timelineBox, TimelineBoxAdapter)
    const markerTrackAdapter: MarkerTrackAdapter = timelineAdapter.markerTrack
    const events = markerTrackAdapter.events
    const {
        context,
        requestUpdate
    } = lifecycle.own(MarkerRenderer.createTrackRenderer(canvas, range, markerTrackAdapter, markerState))
    const capturing = new ElementCapturing<MarkerBoxAdapter>(canvas, {
        capture: (localX: number, _localY: number): Nullable<MarkerBoxAdapter> => {
            const pointer = range.xToUnit(localX)
            const marker = events.lowerEqual(pointer)
            if (marker === null) {return null}
            const state: Nullable<[UUID.Format, int]> = markerState.getValue()
            let markerWidth: number
            if (state === null || !UUID.equals(marker.uuid, state[0])) {
                markerWidth = MarkerRenderer.computeWidth(context, marker, false, 1)
            } else {
                markerWidth = MarkerRenderer.computeWidth(context, marker, true, state[1])
            }
            return localX - range.unitToX(marker.position) < markerWidth ? marker : null
        }
    })
    let lastTimeDown = 0
    lifecycle.ownAll(
        position.subscribe(requestUpdate),
        range.subscribe(requestUpdate),
        markerTrackAdapter.subscribe(requestUpdate),
        markerState.catchupAndSubscribe(requestUpdate),
        MarkerContextMenu.install(canvas, range, capturing, editing),
        Dragging.attach(canvas, (startEvent: PointerEvent) => {
            const now = Date.now()
            const dblclck = now - lastTimeDown < Events.DOUBLE_DOWN_THRESHOLD
            lastTimeDown = now
            const adapter = capturing.captureEvent(startEvent)
            if (adapter === null) {
                if (dblclck) {
                    const rect = canvas.getBoundingClientRect()
                    const position = snapping.xToUnitFloor(startEvent.clientX - rect.left)
                    const lowerEqual = markerTrackAdapter.events.lowerEqual(position)
                    if (lowerEqual?.position === position) {return Option.None}
                    const label = isDefined(lowerEqual) ? Markers.nextName(lowerEqual.label) : Markers.DefaultNames[0]
                    editing.modify(() => MarkerBox.create(boxGraph, UUID.generate(), box => {
                        box.position.setValue(position)
                        box.label.setValue(label)
                        box.hue.setValue(190)
                        box.track.refer(markerTrackAdapter.object.markers)
                    }))
                }
                return Option.None
            }
            const oldPosition = adapter.position
            return Option.wrap({
                update: (event: Dragging.Event) => {
                    const rect = canvas.getBoundingClientRect()
                    const position = snapping.xToUnitFloor(event.clientX - rect.left)
                    editing.modify(() => adapter.box.position.setValue(position), false)
                },
                cancel: () => editing.modify(() => adapter.box.position.setValue(oldPosition)),
                approve: () => {
                    const events = adapter.trackAdapter.unwrap().events
                    const remove = Array.from(events.iterateFrom(adapter.position - 1))
                        .filter(x => x.position === adapter.position && x !== adapter)
                    editing.modify(() => remove.forEach(x => x.box.delete()))
                    editing.mark()
                }
            } satisfies Dragging.Process)
        })
    )
    return (<div className={className}>{canvas}</div>)
}