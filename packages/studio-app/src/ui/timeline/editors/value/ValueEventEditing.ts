import {
    ValueEventCollectionBoxAdapter
} from "studio-shared"
import {Interpolation, ppqn, ValueEvent} from "opendaw-dsp"
import {Snapping} from "@/ui/timeline/Snapping.ts"
import {assert, panic, unitValue} from "opendaw-std"
import {ValueEventBoxAdapter} from "studio-shared"

export namespace ValueEventEditing {
    export const deleteEvent = (collection: ValueEventCollectionBoxAdapter, event: ValueEventBoxAdapter) => {
        if (event.index > 1) {return panic(`Invalid index > 1 (${event.index})`)}
        if (event.index === 0) {
            const successor = ValueEvent.nextEvent(collection.events, event)
            if (successor !== null && successor.position === event.position) {
                assert(successor.index === 1, `Invalid index !== 1 (${event.index})`)
                successor.box.index.setValue(0)
            }
        }
        event.box.delete()
    }
    export const createOrMoveEvent = (collection: ValueEventCollectionBoxAdapter,
                                      snapping: Snapping,
                                      pointer: ppqn,
                                      value: unitValue,
                                      interpolation: Interpolation = Interpolation.Linear): ValueEventBoxAdapter => {
        const position: ppqn = snapping.round(pointer)
        const le = collection.events.lowerEqual(position)
        const ge = collection.events.greaterEqual(position)
        if (null === le || null === ge) { // alone > no interference
            return collection.createEvent({
                position: position,
                index: 0,
                value,
                interpolation
            })
        } else if (le === ge) {
            if (pointer >= position) {
                if (le.index === 0) {
                    return collection.createEvent({
                        position,
                        index: 1,
                        value,
                        interpolation
                    })
                } else {
                    le.box.value.setValue(value)
                    return le
                }
            } else {
                le.box.index.setValue(1)
                return collection.createEvent({
                    position,
                    index: 0,
                    value,
                    interpolation
                })
            }
        } else if (le.position === ge.position) {
            if (pointer < position) {
                ge.box.value.setValue(value)
                return ge
            } else {
                le.box.value.setValue(value)
                return le
            }
        } else {
            return collection.createEvent({
                position,
                index: 0,
                value,
                interpolation
            })
        }
    }
}