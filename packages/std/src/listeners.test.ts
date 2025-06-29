import {describe, expect, it, vi} from "vitest"
import {Listeners} from "./listeners"

describe("listeners", () => {
    interface Foo {
        onSignal(): void
    }

    it("will call", () => {
        const listeners = new Listeners<Foo>()
        const listener = vi.fn()
        const subscription = listeners.subscribe({onSignal: () => listener()})
        expect(listener).toBeCalledTimes(0)
        listeners.proxy.onSignal()
        expect(listener).toBeCalledTimes(1)
        listeners.proxy.onSignal()
        expect(listener).toBeCalledTimes(2)
        subscription.terminate()
        listeners.proxy.onSignal()
        expect(listener).toBeCalledTimes(2)
    })
})