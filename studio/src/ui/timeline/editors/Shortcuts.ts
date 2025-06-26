import {Selection} from "std"
import {TimelineSelectableLocator} from "@/ui/timeline/TimelineSelectableLocator.ts"
import {Editing} from "box"
import {Event} from "dsp"
import {Events, Keyboard} from "dom"
import {BoxAdapter} from "@core/shared/BoxAdapter"

export const attachShortcuts = <E extends Event & BoxAdapter>(element: Element,
                                                              editing: Editing,
                                                              selection: Selection<E>,
                                                              locator: TimelineSelectableLocator<E>) =>
    Events.subscribe(element, "keydown", (event: KeyboardEvent) => {
        if (Keyboard.GlobalShortcut.isSelectAll(event)) {
            selection.select(...locator.selectable())
        } else if (Keyboard.GlobalShortcut.isDelete(event)) {
            editing.modify(() => selection.selected()
                .forEach(event => event.box.delete()))
        }
    })