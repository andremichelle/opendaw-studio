import css from "./RegionsArea.sass?inline"
import {clamp, DefaultObservableValue, EmptyExec, Lifecycle, Nullable, Option, Selection, Unhandled} from "std"
import {createElement} from "jsx"
import {CutCursor} from "@/ui/timeline/CutCursor.tsx"
import {TimelineRange} from "@/ui/timeline/TimelineRange.ts"
import {PPQN, ppqn} from "dsp"
import {installAutoScroll} from "@/ui/AutoScroll.ts"
import {Config} from "@/ui/timeline/Config.ts"
import {TracksManager} from "@/ui/timeline/tracks/audio-unit/TracksManager.ts"
import {AnyRegionBoxAdapter} from "@/audio-engine-shared/adapters/UnionAdapterTypes.ts"
import {isVertexOfBox} from "@/ui/selection/isVertexOfBox.ts"
import {UnionBoxTypes} from "@core/data/unions.ts"
import {RegionAdapters} from "@/audio-engine-shared/adapters/timeline/RegionBoxAdapter.ts"
import {createRegionLocator} from "@/ui/timeline/tracks/audio-unit/regions/RegionSelectionLocator.ts"
import {installRegionContextMenu} from "@/ui/timeline/tracks/audio-unit/regions/RegionContextMenu.ts"
import {RegionEditing} from "@/audio-engine-shared/adapters/timeline/RegionEditing.ts"
import {ElementCapturing} from "@/ui/canvas/capturing.ts"
import {RegionCaptureTarget, RegionCapturing} from "@/ui/timeline/tracks/audio-unit/regions/RegionCapturing.ts"
import {StudioService} from "@/service/StudioService.ts"
import {SelectionRectangle} from "@/ui/timeline/SelectionRectangle.tsx"
import {Cursor} from "@/ui/Cursors.ts"
import {CursorEvent, installCursor} from "@/ui/hooks/cursor.ts"
import {RegionStartModifier} from "@/ui/timeline/tracks/audio-unit/regions/RegionStartModifier.ts"
import {RegionDurationModifier} from "@/ui/timeline/tracks/audio-unit/regions/RegionDurationModifier.ts"
import {RegionMoveModifier} from "@/ui/timeline/tracks/audio-unit/regions/RegionMoveModifier.ts"
import {RegionLoopDurationModifier} from "@/ui/timeline/tracks/audio-unit/regions/RegionLoopDurationModifier.ts"
import {ScrollModel} from "@/ui/components/ScrollModel.ts"
import {Modifier} from "@/ui/Modifier.ts"
import {RegionSampleDragAndDrop} from "@/ui/timeline/tracks/audio-unit/regions/RegionSampleDragAndDrop.ts"
import {PanelType} from "@/ui/workspace/PanelType.ts"
import {CssUtils, Dragging, Events, Html, Keyboard} from "dom"
import {DragAndDrop} from "@/ui/DragAndDrop"
import {AnyDragData} from "@/ui/AnyDragData"
import {showProcessMonolog} from "@/ui/components/dialogs"

const className = Html.adoptStyleSheet(css, "RegionsArea")

const CursorMap = Object.freeze({
    "position": "auto",
    "start": "w-resize",
    "complete": "e-resize",
    "loop-duration": Cursor.ExpandWidth,
    "content-resize": Cursor.ExpandWidth
}) satisfies Record<string, CssUtils.Cursor | Cursor>

type Construct = {
    lifecycle: Lifecycle
    service: StudioService
    manager: TracksManager
    scrollModel: ScrollModel
    scrollContainer: HTMLElement
    range: TimelineRange
}

export const RegionsArea = ({lifecycle, service, manager, scrollModel, scrollContainer, range}: Construct) => {
    const {project, timeline} = service
    const {snapping} = timeline
    const {selection, editing, boxAdapters, timelineBox, userEditingManager} = project
    const markerPosition = lifecycle.own(new DefaultObservableValue<Nullable<ppqn>>(null))
    const regionSelection: Selection<AnyRegionBoxAdapter> = lifecycle.own(selection
        .createFilteredSelection(isVertexOfBox(UnionBoxTypes.isRegionBox), {
            fx: (adapter: AnyRegionBoxAdapter) => adapter.box,
            fy: vertex => RegionAdapters.for(boxAdapters, vertex.box)
        }))
    const element: HTMLElement = (
        <div className={className} tabIndex={-1}>
            <CutCursor lifecycle={lifecycle} position={markerPosition} range={range}/>
        </div>
    )
    const capturing: ElementCapturing<RegionCaptureTarget> = RegionCapturing.create(element, manager, range)
    const regionLocator = createRegionLocator(manager, regionSelection)
    const dragAndDrop = new RegionSampleDragAndDrop(project, capturing, timeline.snapping)
    lifecycle.ownAll(
        regionSelection.catchupAndSubscribe({
            onSelected: (selectable: AnyRegionBoxAdapter) => selectable.onSelected(),
            onDeselected: (selectable: AnyRegionBoxAdapter) => selectable.onDeselected()
        }),
        Events.subscribe(element, "keydown", (event: KeyboardEvent) => {
            if (Keyboard.GlobalShortcut.isDeselectAll(event)) {
                regionSelection.deselectAll()
            } else if (Keyboard.GlobalShortcut.isSelectAll(event)) {
                regionSelection.select(...manager.tracks()
                    .flatMap(({trackBoxAdapter: {regions}}) => regions.collection.asArray()))
            } else if (Keyboard.GlobalShortcut.isDelete(event)) {
                editing.modify(() => regionSelection.selected()
                    .forEach(region => region.box.delete()))
            }
        }),
        installRegionContextMenu({
            timelineBox,
            element,
            project,
            capturing,
            selection: regionSelection,
            range
        }),
        Events.subscribe(element, "dblclick", event => {
            const target = capturing.captureEvent(event)
            if (target === null) {return}
            if (target?.type === "region") {
                editing.modify(() => {
                    userEditingManager.timeline.edit(target.region.box)
                    service.panelLayout.showIfAvailable(PanelType.ContentEditor)
                })
            } else if (target.type === "track") {
                const {audioUnitBoxAdapter, trackBoxAdapter} = target.track
                const name = audioUnitBoxAdapter.input.label.unwrapOrElse("")
                const position = snapping.xToUnitFloor(event.clientX - element.getBoundingClientRect().left)
                const duration = Math.min(PPQN.Bar,
                    (trackBoxAdapter.regions.collection.greaterEqual(position + 1)?.position ?? Number.POSITIVE_INFINITY) - position)
                editing.modify(() => Modifier.createRegion(trackBoxAdapter.regions, position, duration, {name}))
            }
        }),
        Dragging.attach(element, (event: PointerEvent) => {
            const target = capturing.captureEvent(event)
            if (target === null) {
                if (Keyboard.isControlKey(event)) {
                    const trackIndex = manager.globalToIndex(event.clientY)
                    if (trackIndex === manager.numTracks()) {return Option.None}
                    return Option.wrap({
                        update: EmptyExec // TODO Create Region
                    })
                } else {
                    return Option.None
                }
            } else if (target.type === "region" && Keyboard.isControlKey(event)) {
                if (!regionSelection.isSelected(target.region)) {
                    regionSelection.deselectAll()
                    regionSelection.select(target.region)
                }
                const clientRect = element.getBoundingClientRect()
                const pointerPulse = snapping.xToUnitRound(event.clientX - clientRect.left)
                editing.modify(() => regionSelection.selected()
                    .slice()
                    .forEach(region => RegionEditing.cut(region, pointerPulse, !event.shiftKey)))
                return Option.wrap({update: EmptyExec}) // prevent selection or tools
            }
            return Option.None
        })
    )
    element.appendChild(
        <SelectionRectangle
            target={element}
            lifecycle={lifecycle}
            editing={editing}
            selection={regionSelection}
            locator={regionLocator}
            xAxis={range.valueAxis}
            yAxis={{
                axisToValue: y => clamp(y + scrollContainer.scrollTop, 0, scrollContainer.scrollTop + element.scrollHeight),
                valueToAxis: value => value - scrollContainer.scrollTop
            }}/>
    )
    lifecycle.ownAll(
        installAutoScroll(element, (deltaX, deltaY) => {
            if (deltaY !== 0) {scrollModel.moveBy(deltaY)}
            if (deltaX !== 0) {range.moveUnitBy(deltaX * range.unitsPerPixel * Config.AutoScrollHorizontalSpeed)}
        }, {
            measure: () => {
                const {left, right} = element.getBoundingClientRect()
                const {top, bottom} = scrollContainer.getBoundingClientRect()
                return ({xMin: left, xMax: right, yMin: top, yMax: bottom})
            }, padding: Config.AutoScrollPadding
        }),
        DragAndDrop.installTarget(element, {
            drag: (event: DragEvent, data: AnyDragData): boolean => {
                const option = dragAndDrop.canDrop(event, data)
                if (option.isEmpty()) {
                    markerPosition.setValue(null)
                    return false
                }
                if (data.type === "instrument") {
                    markerPosition.setValue(null)
                    return true
                }
                const rect = element.getBoundingClientRect()
                const position = snapping.xToUnitFloor(event.clientX - rect.left)
                markerPosition.setValue(Math.max(0, position))
                return true
            },
            drop: (event: DragEvent, data: AnyDragData) => {
                const dialog = showProcessMonolog("Import Sample")
                dragAndDrop.drop(event, data).finally(() => dialog.close())
            },
            enter: (_allowDrop: boolean) => {},
            leave: () => markerPosition.setValue(null)
        }),
        Events.subscribe(element, "wheel", (event: WheelEvent) => {
            if (event.shiftKey) {
                event.preventDefault()
                event.stopPropagation()
                const scale = event.deltaY * 0.01
                const rect = element.getBoundingClientRect()
                range.scaleBy(scale, range.xToValue(event.clientX - rect.left))
            } else {
                const deltaX = event.deltaX
                const threshold = 5.0
                const clamped = Math.max(deltaX - threshold, 0.0) + Math.min(deltaX + threshold, 0.0)
                if (Math.abs(clamped) > 0) {
                    event.preventDefault()
                    range.moveBy(clamped * 0.0003)
                }
            }
        }, {passive: false}),
        installCursor(element, capturing, {
            get: (target: Nullable<RegionCaptureTarget>, event: CursorEvent) => {
                const units = snapping.xToUnitRound(event.clientX - element.getBoundingClientRect().left)
                markerPosition.setValue(
                    Keyboard.isControlKey(event) && target !== null && target.type === "region"
                    && target.region.position < units && units < target.region.complete
                        ? units
                        : null)
                return target === null || target.type === "track"
                    ? null
                    : Keyboard.isControlKey(event)
                        ? Cursor.Scissors
                        : CursorMap[target.part]
            },
            leave: () => markerPosition.setValue(null)
        }),
        Dragging.attach(element, (event: PointerEvent) => {
                const target: Nullable<RegionCaptureTarget> = capturing.captureEvent(event)
                if (target === null || target.type !== "region") {return Option.None}
                const clientRect = element.getBoundingClientRect()
                const pointerPulse = range.xToUnit(event.clientX - clientRect.left)
                const reference = target.region
                switch (target.part) {
                    case "start":
                        return manager.startRegionModifier(RegionStartModifier.create(regionSelection.selected(),
                            {element, snapping, pointerPulse, reference}))
                    case "complete":
                        return manager.startRegionModifier(RegionDurationModifier.create(regionSelection.selected(),
                            {element, snapping, pointerPulse, reference}))
                    case "position":
                        const pointerIndex = manager.globalToIndex(event.clientY)
                        return manager.startRegionModifier(RegionMoveModifier.create(manager, regionSelection,
                            {element, snapping, pointerPulse, pointerIndex, reference}))
                    case "loop-duration":
                    case "content-resize":
                        return manager.startRegionModifier(RegionLoopDurationModifier.create(regionSelection.selected(),
                            {element, snapping, pointerPulse, reference, resize: target.part === "content-resize"}))
                    default: {
                        return Unhandled(target)
                    }
                }
            }, {permanentUpdates: true}
        )
    )
    return element
}