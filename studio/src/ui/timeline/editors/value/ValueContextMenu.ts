import {ContextMenu} from "@/ui/ContextMenu.ts"
import {MenuItem} from "@/ui/model/menu-item.ts"
import {ElementCapturing} from "@/ui/canvas/capturing.ts"
import {Editing} from "box"
import {Objects, Selection} from "std"
import {ValueEventBoxAdapter} from "@core/shared/adapters/timeline/event/ValueEventBoxAdapter.ts"
import {ValueCaptureTarget} from "@/ui/timeline/editors/value/ValueEventCapturing.ts"
import {Interpolation} from "dsp"
import {DebugMenus} from "@/ui/menu/debug.ts"

type Construct = {
    element: Element
    capturing: ElementCapturing<ValueCaptureTarget>
    editing: Editing
    selection: Selection<ValueEventBoxAdapter>
}

export const installValueContextMenu = ({element, capturing, editing, selection}: Construct) =>
    ContextMenu.subscribe(element, ({addItems, client}: ContextMenu.Collector) => {
        const target = capturing.captureEvent(client)
        if (target === null || target.type === "loop-duration") {return}
        if ("event" in target && !selection.isSelected(target.event)) {
            selection.deselectAll()
            selection.select(target.event)
        }
        addItems(
            MenuItem.default({label: "Delete"})
                .setTriggerProcedure(() => editing.modify(() => selection.selected()
                    .forEach(adapter => adapter.box.delete()))),
            MenuItem.default({label: "Interpolation"})
                .setRuntimeChildrenProcedure(parent => parent.addMenuItem(
                    MenuItem.default({
                        label: "None",
                        checked: target.event.interpolation.type === "none"
                    }).setTriggerProcedure(() => editing.modify(() => selection.selected()
                        .forEach(adapter => adapter.interpolation = Interpolation.None))),
                    MenuItem.default({
                        label: "Linear",
                        checked: target.event.interpolation.type === "linear"
                    }).setTriggerProcedure(() => editing.modify(() => selection.selected()
                        .forEach(adapter => adapter.interpolation = Interpolation.Linear))),
                    MenuItem.default({
                        label: "Curve",
                        checked: target.event.interpolation.type === "curve"
                    }).setTriggerProcedure(() => {
                        editing.modify(() => {
                            const interpolation = Interpolation.Curve(0.75)
                            selection.selected().forEach(adapter => adapter.interpolation = interpolation)
                        })
                    })
                )),
            MenuItem.default({label: "Print events to console"})
                .setTriggerProcedure(() => {
                    console.debug(JSON.stringify(target.event.collection.unwrap().events.asArray()
                        .map(event => Objects.include(event, "position", "value", "interpolation", "index"))))
                }),
            DebugMenus.debugBox(target.event.box)
        )
    })