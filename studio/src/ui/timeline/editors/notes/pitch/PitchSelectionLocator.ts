import {TimelineRange} from "@/ui/timeline/TimelineRange.ts"
import {ElementCapturing} from "@/ui/canvas/capturing.ts"
import {TimelineCoordinates, TimelineSelectableLocator} from "@/ui/timeline/TimelineSelectableLocator.ts"
import {NoteEventBoxAdapter} from "@core/shared/adapters/timeline/event/NoteEventBoxAdapter.ts"
import {Intervals, Iterables, ValueAxis} from "std"
import {PitchCaptureTarget} from "@/ui/timeline/editors/notes/pitch/PitchEventCapturing.ts"

import {NoteEventOwnerReader} from "@/ui/timeline/editors/EventOwnerReader.ts"

export const createPitchSelectionLocator = (owner: NoteEventOwnerReader,
                                            range: TimelineRange,
                                            valueAxis: ValueAxis,
                                            capturing: ElementCapturing<PitchCaptureTarget>)
    : TimelineSelectableLocator<NoteEventBoxAdapter> => ({
    selectable: (): Iterable<NoteEventBoxAdapter> =>
        owner.hasContent ? owner.content.events.asArray() : Iterables.empty(),

    selectableAt: ({u, v}: TimelineCoordinates): Iterable<NoteEventBoxAdapter> => {
        const capture = capturing.captureLocalPoint(range.unitToX(u), valueAxis.valueToAxis(v))
        return capture === null || capture.type === "loop-duration" ? Iterables.empty() : [capture.event]
    },

    selectablesBetween(begin: TimelineCoordinates, end: TimelineCoordinates): Iterable<NoteEventBoxAdapter> {
        if (!owner.hasContent) {return Iterables.empty()}
        const offset = owner.offset
        const v0 = Math.ceil(begin.v)
        const v1 = Math.ceil(end.v)
        const u0 = begin.u - offset
        const u1 = end.u - offset
        const result: Array<NoteEventBoxAdapter> = []
        for (const element of owner.content.events.asArray()) { // TODO Optimise
            if (Intervals.intersect1D(element.position, element.complete, u0, u1)
                && Intervals.intersect1D(element.pitch, element.pitch, v0, v1)) {
                result.push(element)
            }
        }
        return result
    }
})