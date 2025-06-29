import {Func, Option, Terminable, Terminator} from "opendaw-std"
import {Browser} from "./browser"
import {AnimationFrame} from "./frames"
import {Events, PointerCaptureTarget} from "./events"
import {Keyboard} from "./keyboard"

export namespace Dragging {
    export interface Process {
        update(event: Event): void
        cancel?(): void
        approve?(): void
        finally?(): void
        abortSignal?: AbortSignal
    }

    export interface Event {
        readonly clientX: number
        readonly clientY: number
        readonly altKey: boolean
        readonly shiftKey: boolean
        readonly ctrlKey: boolean
    }

    export interface ProcessOptions {
        multiTouch?: boolean
        immediate?: boolean
        permanentUpdates?: boolean
    }

    export const attach = <T extends PointerCaptureTarget>(target: T,
                                                           factory: Func<PointerEvent, Option<Process>>,
                                                           options?: ProcessOptions): Terminable => {
        const processCycle = new Terminator()
        return Terminable.many(processCycle, Events.subscribe(target, "pointerdown", (event: PointerEvent) => {
            if (options?.multiTouch !== true && !event.isPrimary) {return Option.None}
            if (event.buttons !== 1 || (Browser.isMacOS() && event.ctrlKey)) {return Option.None}
            const option: Option<Process> = factory(event)
            if (option.isEmpty()) {return}
            const process: Process = option.unwrap()
            const pointerId: number = event.pointerId
            event.stopPropagation()
            event.stopImmediatePropagation()
            target.setPointerCapture(pointerId)
            const moveEvent = {
                clientX: event.clientX,
                clientY: event.clientY,
                altKey: event.altKey,
                shiftKey: event.shiftKey,
                ctrlKey: Keyboard.isControlKey(event)
            } satisfies Event
            if (options?.immediate === true) {
                process.update(moveEvent)
            }
            if (options?.permanentUpdates === true) {
                processCycle.own(AnimationFrame.add(() => process.update(moveEvent)))
                processCycle.own(Events.subscribe(target, "pointermove", (event: PointerEvent) => {
                    if (event.pointerId === pointerId) {
                        moveEvent.clientX = event.clientX
                        moveEvent.clientY = event.clientY
                        moveEvent.altKey = event.altKey
                        moveEvent.shiftKey = event.shiftKey
                        moveEvent.ctrlKey = Keyboard.isControlKey(event)
                    }
                }))
            } else {
                processCycle.own(Events.subscribe(target, "pointermove", (event: PointerEvent) => {
                    if (event.pointerId === pointerId) {
                        moveEvent.clientX = event.clientX
                        moveEvent.clientY = event.clientY
                        moveEvent.altKey = event.altKey
                        moveEvent.shiftKey = event.shiftKey
                        moveEvent.ctrlKey = Keyboard.isControlKey(event)
                        process.update(moveEvent)
                    }
                }))
            }
            const cancel = () => {
                process.cancel?.call(process)
                process.finally?.call(process)
                processCycle.terminate()
            }
            processCycle.ownAll(
                Events.subscribe(target, "pointerup", (event: PointerEvent) => {
                    if (event.pointerId === pointerId) {
                        process.approve?.call(process)
                        process.finally?.call(process)
                        processCycle.terminate()
                    }
                }, {capture: true}),
                Events.subscribe(target, "pointercancel", (event: PointerEvent) => {
                    console.debug(event.type)
                    if (event.pointerId === pointerId) {
                        target.releasePointerCapture(pointerId)
                        cancel()
                    }
                }, {capture: true}),
                Events.subscribe(self, "beforeunload", (_event: BeforeUnloadEvent) => {
                    // Workaround for Chrome (does not release or cancel pointer)
                    target.releasePointerCapture(pointerId)
                    cancel()
                }, {capture: true}),
                Events.subscribe(window, "keydown", (event: KeyboardEvent) => {
                    moveEvent.altKey = event.altKey
                    moveEvent.shiftKey = event.shiftKey
                    moveEvent.ctrlKey = Keyboard.isControlKey(event)
                    if (event.key === "Escape") {cancel()} else {process.update(moveEvent)}
                }),
                Events.subscribe(window, "keyup", (event: KeyboardEvent) => {
                    moveEvent.altKey = event.altKey
                    moveEvent.shiftKey = event.shiftKey
                    moveEvent.ctrlKey = Keyboard.isControlKey(event)
                    process.update(moveEvent)
                })
            )
            if (process.abortSignal) {
                processCycle.own(Events.subscribe(process.abortSignal, "abort", () => {
                    target.releasePointerCapture(pointerId)
                    cancel()
                }))
            }
        }))
    }
}