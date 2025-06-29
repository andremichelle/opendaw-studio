import {describe, expect, it} from "vitest"
import {EventCollection} from "./events"
import {Interpolation, ValueEvent} from "./value"
import {PPQN} from "./ppqn"

describe("ValueEvent", () => {
    it("iterate empty", () => {
        const events: EventCollection<ValueEvent> = EventCollection.create(ValueEvent.Comparator)
        expect(Array.from(ValueEvent.iterateWindow(events, 0, 1))).toStrictEqual([])
    })
    it("iterate one", () => {
        const events: EventCollection<ValueEvent> = EventCollection.create(ValueEvent.Comparator)
        const event: ValueEvent = {
            type: "value-event",
            position: 0,
            index: 0,
            value: 0,
            interpolation: Interpolation.Linear
        }
        events.add(event)
        expect(Array.from(ValueEvent.iterateWindow(events, 0, 1))).toStrictEqual([event])
    })
    it("iterate two (out)", () => {
        const events: EventCollection<ValueEvent> = EventCollection.create(ValueEvent.Comparator)
        const A0: ValueEvent = {
            type: "value-event",
            position: 0,
            index: 0,
            value: 0,
            interpolation: Interpolation.Linear
        }
        const A1: ValueEvent = {
            type: "value-event",
            position: 0,
            index: 1,
            value: 0,
            interpolation: Interpolation.Linear
        }
        const B: ValueEvent = {
            type: "value-event",
            position: PPQN.Bar * 3,
            index: 0,
            value: 0,
            interpolation: Interpolation.Linear
        }
        events.add(A1)
        events.add(A0)
        events.add(B)
        expect(Array.from(ValueEvent.iterateWindow(events, PPQN.Bar, PPQN.Bar * 2))).toStrictEqual([A1, B])
    })
    it("iterate two (in)", () => {
        const events: EventCollection<ValueEvent> = EventCollection.create(ValueEvent.Comparator)
        const A: ValueEvent = {
            type: "value-event",
            position: PPQN.Quarter,
            index: 0,
            value: 0,
            interpolation: Interpolation.Linear
        }
        const B: ValueEvent = {
            type: "value-event",
            position: PPQN.Quarter * 3,
            index: 0,
            value: 0,
            interpolation: Interpolation.Linear
        }
        events.add(B)
        events.add(A)
        expect(Array.from(ValueEvent.iterateWindow(events, 0, PPQN.Bar))).toStrictEqual([A, B])
    })
})