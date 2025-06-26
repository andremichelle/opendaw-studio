import {TimelineRange} from "@/ui/timeline/TimelineRange.ts"
import {ElementCapturing} from "@/ui/canvas/capturing.ts"
import {TimelineCoordinates, TimelineSelectableLocator} from "@/ui/timeline/TimelineSelectableLocator.ts"
import {NoteEventBoxAdapter} from "@core/shared/adapters/timeline/event/NoteEventBoxAdapter.ts"
import {Intervals, Iterables, ObservableValue, ValueAxis} from "std"
import {PropertyAccessor} from "@/ui/timeline/editors/notes/property/PropertyAccessor.ts"
import {NoteModifyStrategy} from "@/ui/timeline/editors/notes/NoteModifyStrategies.ts"

import {NoteEventOwnerReader} from "@/ui/timeline/editors/EventOwnerReader.ts"

export const createPropertySelectionLocator = (owner: NoteEventOwnerReader,
                                               range: TimelineRange,
                                               valueAxis: ValueAxis,
                                               propertyOwner: ObservableValue<PropertyAccessor>,
                                               capturing: ElementCapturing<NoteEventBoxAdapter>)
    : TimelineSelectableLocator<NoteEventBoxAdapter> => ({
    selectable: (): Iterable<NoteEventBoxAdapter> =>
        owner.hasContent ? owner.content.events.asArray() : Iterables.empty(),

    selectableAt: ({u, v}: TimelineCoordinates): Iterable<NoteEventBoxAdapter> => {
        const capture = capturing.captureLocalPoint(range.unitToX(u), valueAxis.valueToAxis(v))
        return capture === null ? Iterables.empty() : Iterables.one(capture)
    },

    selectablesBetween(begin: TimelineCoordinates, end: TimelineCoordinates): Iterable<NoteEventBoxAdapter> {
        if (!owner.hasContent) {return Iterables.empty()}
        const offset = owner.offset
        const v0 = begin.v
        const v1 = end.v
        const u0 = begin.u - offset
        const u1 = end.u - offset
        const result: Array<NoteEventBoxAdapter> = []
        const propertyAccessor = propertyOwner.getValue()
        for (const event of owner.content.events.iterateRange(u0, u1)) {
            const value = propertyAccessor.valueMapping.x(propertyAccessor.readValue(NoteModifyStrategy.Identity, event))
            if (Intervals.intersect1D(event.position, event.position, u0, u1)
                && Intervals.intersect1D(value, value, v0, v1)) {
                result.push(event)
            }
        }
        return result
    }
})