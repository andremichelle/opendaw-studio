import {Terminable} from "lib-std"
import {TimelineRange} from "@/ui/timeline/TimelineRange.ts"
import {PPQN} from "lib-dsp"
import {attachWheelScroll} from "@/ui/timeline/editors/WheelScroll.ts"
import {installAutoScroll} from "@/ui/AutoScroll.ts"
import {Config} from "@/ui/timeline/Config.ts"
import {EventOwnerReader} from "./EventOwnerReader.ts"
import {Html} from "lib-dom"

export type Construct = {
    element: Element
    range: TimelineRange
    reader: EventOwnerReader<unknown>
}

export const installEditorMainBody = ({element, range, reader}: Construct): Terminable => {
    let init = true
    return Terminable.many(
        Html.watchResize(element, () => {
            range.width = element.clientWidth
            if (init) {
                init = false
                range.zoomRange(reader.offset, reader.offset + reader.loopDuration + PPQN.Bar, 16)
            }
        }),
        installEditorAuxBody(element, range),
        reader.watchOverlap(range)
    )
}

// This is for extra editor that also need wheel and auto-scroll support
// Currently: PropertyEditor within NoteEditor
export const installEditorAuxBody = (element: Element, range: TimelineRange): Terminable => {
    return Terminable.many(
        attachWheelScroll(element, range),
        installAutoScroll(element, (deltaX, _deltaY) => {
            if (deltaX !== 0) {range.moveUnitBy(deltaX * range.unitsPerPixel * Config.AutoScrollHorizontalSpeed)}
        }, {padding: Config.AutoScrollPadding})
    )
}