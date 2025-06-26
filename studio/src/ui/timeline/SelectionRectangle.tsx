import css from "./SelectionRectangle.sass?inline"
import {createElement} from "jsx"
import {EmptyExec, Lifecycle, Option, Selection, SortedSet, UUID, ValueAxis} from "std"
import {Colors} from "@/ui/Colors.ts"
import {Editing} from "box"
import {TimelineSelectableLocator} from "@/ui/timeline/TimelineSelectableLocator.ts"
import {Dragging, Html, PointerCaptureTarget} from "dom"
import {BoxAdapter} from "@core/shared/BoxAdapter"

const className = Html.adoptStyleSheet(css, "SelectionRectangle")

type Construct<T extends BoxAdapter> = {
    lifecycle: Lifecycle
    target: PointerCaptureTarget
    editing: Editing
    selection: Selection<T>
    locator: TimelineSelectableLocator<T>
    xAxis: ValueAxis
    yAxis: ValueAxis
}

export const SelectionRectangle =
    <T extends BoxAdapter, >({lifecycle, target, editing, selection, locator, xAxis, yAxis}: Construct<T>) => {
        const svgRect: SVGRectElement = (
            <rect x="0" y="0" width="0" height="0"
                  stroke={Colors.cream}
                  fill={Colors.cream}
                  fill-opacity={0.125}
                  stroke-width={1}/>
        )
        const updateSvgRect = (x0: number, y0: number, x1: number, y1: number): void => {
            svgRect.x.baseVal.value = Math.min(x0, x1)
            svgRect.y.baseVal.value = Math.min(y0, y1)
            const empty = x1 - x0 === 0 && y1 - y0 === 0
            svgRect.width.baseVal.value = empty ? 0 : Math.max(Math.abs(x1 - x0), 1)
            svgRect.height.baseVal.value = empty ? 0 : Math.max(Math.abs(y1 - y0), 1)
        }
        const svg: SVGSVGElement = <svg classList={className}>{svgRect}</svg>
        lifecycle.ownAll(
            Dragging.attach(target, (event: PointerEvent) => {
                const clientRect = svg.getBoundingClientRect()
                const u0 = xAxis.axisToValue(event.clientX - clientRect.left)
                const v0 = yAxis.axisToValue(event.clientY - clientRect.top)
                const before: ReadonlyArray<T> = Array.from(selection.selected())
                const captured = Array.from(locator.selectableAt({u: u0, v: v0}))
                const numSelected = selection.count()
                const someSelected = captured.some(item => selection.isSelected(item))
                if (!event.shiftKey) {
                    if (numSelected === 1 && captured.length === 1 && someSelected) {
                        // we clicked an already selected selectable
                        return Option.None
                    } else if (!someSelected || numSelected === 1) {
                        selection.deselectAll()
                    }
                }
                for (const selectable of captured) {
                    if (selection.isSelected(selectable)) {
                        if (event.shiftKey) {
                            selection.deselect(selectable)
                        }
                    } else {
                        selection.select(selectable)
                    }
                }
                if (captured.length > 0) {
                    return Option.None
                }
                selection.deselectAll()
                const enclosed: Array<T> = []
                const selected: SortedSet<UUID.Format, T> = UUID.newSet<T>(adapter => adapter.uuid)
                return Option.wrap({
                    update: (event: Dragging.Event) => {
                        const clientRect = svg.getBoundingClientRect()
                        const u1 = xAxis.axisToValue(event.clientX - clientRect.left)
                        const v1 = yAxis.axisToValue(event.clientY - clientRect.top)
                        const uMin = Math.min(u0, u1)
                        const uMax = Math.max(u0, u1)
                        const vMin = Math.min(v0, v1)
                        const vMax = Math.max(v0, v1)
                        updateSvgRect(xAxis.valueToAxis(uMin), yAxis.valueToAxis(vMax), xAxis.valueToAxis(uMax), yAxis.valueToAxis(vMin))
                        enclosed.splice(0, enclosed.length, ...locator.selectablesBetween(
                            {u: uMin, v: vMin},
                            {u: uMax, v: vMax}))
                        selected.clear()
                        if (event.shiftKey) {
                            const invertedSelection = new Set<T>(before)
                            for (const selectable of enclosed) {
                                if (!invertedSelection.delete(selectable)) {
                                    invertedSelection.add(selectable)
                                }
                            }
                            selected.addMany(invertedSelection)
                        } else {
                            selected.addMany(enclosed)
                        }
                        editing.modify(() => {
                            for (const adapter of selection.selected()) {
                                if (!selected.hasValue(adapter)) {
                                    selection.deselect(adapter)
                                }
                            }
                            for (const adapter of selected.values()) {
                                if (!selection.isSelected(adapter)) {
                                    selection.select(adapter)
                                }
                            }
                        }, false)
                    },
                    cancel: () => {
                        selection.deselectAll()
                        selection.select(...before)
                    },
                    approve: EmptyExec,
                    finally: () => updateSvgRect(0, 0, 0, 0)
                })
            }, {permanentUpdates: true}),
            {terminate: () => svg.remove()}
        )
        return svg
    }