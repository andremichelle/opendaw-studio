import {isDefined, Nullable, Procedure, Subscription} from "lib-std"

export class Events {
    static subscribe<K extends keyof WindowEventMap>(eventTarget: EventTarget,
                                                     type: K,
                                                     listener: (ev: WindowEventMap[K]) => void,
                                                     options?: boolean | AddEventListenerOptions): Subscription {
        eventTarget.addEventListener(type, listener as EventListener, options)
        return {terminate: () => eventTarget.removeEventListener(type, listener as EventListener, options)}
    }

    static subscribeAny<E extends Event>(eventTarget: EventTarget,
                                         type: string,
                                         listener: (event: E) => void,
                                         options?: boolean | AddEventListenerOptions): Subscription {
        eventTarget.addEventListener(type, listener as EventListener, options)
        return {terminate: (): void => eventTarget.removeEventListener(type, listener as EventListener, options)}
    }

    static DOUBLE_DOWN_THRESHOLD = 200 as const

    static subscribeDblDwn = (eventTarget: EventTarget, listener: (event: PointerEvent) => void): Subscription => {
        let lastDownTime: number = 0.0
        return this.subscribe(eventTarget, "pointerdown", event => {
            const now = performance.now()
            if (now - lastDownTime < this.DOUBLE_DOWN_THRESHOLD) {
                listener(event)
            }
            lastDownTime = now
        }, {capture: true})
    }

    static readonly PreventDefault: Procedure<Event> = event => event.preventDefault()

    static readonly isTextInput = (target: Nullable<EventTarget>): boolean => target instanceof HTMLInputElement
        || target instanceof HTMLTextAreaElement
        || (target instanceof HTMLElement && isDefined(target.getAttribute("contenteditable")))
}

export interface PointerCaptureTarget extends EventTarget {
    setPointerCapture(pointerId: number): void
    releasePointerCapture(pointerId: number): void
    hasPointerCapture(pointerId: number): boolean
}