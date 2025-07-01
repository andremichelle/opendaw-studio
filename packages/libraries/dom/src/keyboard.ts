import {Browser} from "./browser"
import {Events} from "./events"

export namespace Keyboard {
    export const isControlKey = ({ctrlKey, metaKey}: {
        ctrlKey: boolean,
        metaKey: boolean
    }) => Browser.isMacOS() ? metaKey : ctrlKey

    export const isCopyKey = ({altKey}: { altKey: boolean }) => altKey

    export const GlobalShortcut = Object.freeze({
        isDelete: (event: KeyboardEvent) => !Events.isTextInput(event.target) && (event.code === "Delete" || event.code === "Backspace"),
        isSelectAll: (event: KeyboardEvent) => isControlKey(event) && !event.shiftKey && event.code === "KeyA",
        isDeselectAll: (event: KeyboardEvent) => isControlKey(event) && event.shiftKey && event.code === "KeyA"
    })
}