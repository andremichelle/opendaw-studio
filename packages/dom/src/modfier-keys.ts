import {Browser} from "./browser"

export const ModfierKeys = (() => {
    const Mac = {Cmd: "⌘", Opt: "⌥", Shift: "⇧"}
    const Win = {Cmd: "Ctrl", Opt: "Alt", Shift: "⇧"}
    return Object.freeze({Mac, Win, System: Browser.isMacOS() ? Mac : Win})
})()