import {beforeEach, describe, expect, it} from "vitest"
import {Option} from "./option"
import {CascadingSubscriptions, Subscription, Terminable, Terminator} from "./terminable"
import {Notifier, Observable, Observer} from "./observers"

class TestObservable<T> implements Observable<T> {
    readonly #notifier: Notifier<T>
    #value: T
    constructor(value: T) {
        this.#notifier = new Notifier<T>()
        this.#value = value
    }
    isEmpty(): boolean {return this.#notifier.isEmpty()}
    setValue(value: T): void {
        if (this.#value === value) {return}
        this.#value = value
        this.#notifier.notify(this.#value)
    }
    getValue(): T {return this.#value}
    subscribe(observer: Observer<T>): Terminable {return this.#notifier.subscribe(observer)}
    catchupAndSubscribe(observer: Observer<T>): Terminable {
        observer(this.#value)
        return this.#notifier.subscribe(observer)
    }
    terminate(): void {this.#notifier.terminate()}
    toString(): string {return `{TestObserver value: ${this.#value}`}
}

interface Context {
    targetA: TestObservable<Option<number>>
    targetB: TestObservable<Option<number>>
    bodyA: TestObservable<Option<TestObservable<Option<number>>>>
    bodyB: TestObservable<Option<TestObservable<Option<number>>>>
    root: TestObservable<Option<TestObservable<Option<TestObservable<Option<number>>>>>>
}

beforeEach<Context>(ctx => {
    const targetA = new TestObservable<Option<number>>(Option.None)
    const targetB = new TestObservable<Option<number>>(Option.None)
    const bodyA = new TestObservable<Option<typeof targetA>>(Option.None)
    const bodyB = new TestObservable<Option<typeof targetA>>(Option.None)
    ctx.root = new TestObservable<Option<typeof bodyA>>(Option.None)
    ctx.bodyA = bodyA
    ctx.bodyB = bodyB
    ctx.targetA = targetA
    ctx.targetB = targetB
})

describe("CascadingSubscriptions", () => {
    it<Context>("without", ({root, bodyA, bodyB, targetA, targetB}) => {
        const catchupAndSubscribe = (observer: Observer<Option<number>>): Subscription => {
            const terminator = new Terminator()
            const nested = terminator.own(new Terminator())
            terminator.own(root.catchupAndSubscribe((option: Option<typeof bodyA>) => {
                    nested.terminate()
                    nested.own(option.match({
                        none: () => {
                            observer(Option.None)
                            return Terminable.Empty
                        },
                        some: body => {
                            const sub = nested.own(new Terminator())
                            return body.catchupAndSubscribe((option: Option<typeof targetA>) => {
                                sub.terminate()
                                sub.own(option.match({
                                    none: () => {
                                        observer(Option.None)
                                        return Terminable.Empty
                                    },
                                    some: target => target.catchupAndSubscribe(observer)
                                }))
                            })
                        }
                    }))
                }
            ))
            return terminator
        }
        expect(root.isEmpty()).true
        const subscription = catchupAndSubscribe(_option => {})
        expect(root.isEmpty()).false
        targetA.setValue(Option.wrap(42))
        targetB.setValue(Option.wrap(43))
        expect(targetA.isEmpty()).true
        expect(targetB.isEmpty()).true
        bodyA.setValue(Option.wrap(targetA))
        bodyB.setValue(Option.wrap(targetB))
        expect(targetA.isEmpty()).true
        expect(targetB.isEmpty()).true
        expect(bodyA.isEmpty()).true
        expect(bodyB.isEmpty()).true
        expect(root.isEmpty()).false

        root.setValue(Option.wrap(bodyA)) // point to body A which observes now target A
        expect(bodyA.isEmpty()).false
        expect(targetA.isEmpty()).false
        bodyA.setValue(Option.wrap(targetB)) // point to target B
        expect(bodyA.isEmpty()).false
        expect(bodyB.isEmpty()).true
        expect(targetA.isEmpty()).true
        expect(targetB.isEmpty()).false
        bodyA.setValue(Option.wrap(targetA)) // point to target A
        expect(bodyA.isEmpty()).false
        expect(bodyB.isEmpty()).true
        expect(targetA.isEmpty()).false
        expect(targetB.isEmpty()).true
        subscription.terminate()
        expect(targetA.isEmpty()).true
        expect(targetB.isEmpty()).true
        expect(bodyA.isEmpty()).true
        expect(bodyB.isEmpty()).true
        expect(root.isEmpty()).true
    })

    it<Context>("with", ({root, bodyA, bodyB, targetA, targetB}) => {
        const catchupAndSubscribe = (observer: Observer<Option<number>>): Subscription => {
            const chain = new CascadingSubscriptions()
            return chain.append(observer => root.catchupAndSubscribe(observer), (option: Option<typeof bodyA>) => {
                    return option.match({
                        none: () => {
                            observer(Option.None)
                            return Terminable.Empty
                        },
                        some: body => {
                            return chain.append(observer => body.catchupAndSubscribe(observer), (option: Option<typeof targetA>) => {
                                return option.match({
                                    none: () => {
                                        observer(Option.None)
                                        return Terminable.Empty
                                    },
                                    some: target => target.catchupAndSubscribe(observer)
                                })
                            })
                        }
                    })
                }
            )
        }
        expect(root.isEmpty()).true
        const subscription = catchupAndSubscribe(_option => {})
        expect(root.isEmpty()).false
        targetA.setValue(Option.wrap(42))
        targetB.setValue(Option.wrap(43))
        expect(targetA.isEmpty()).true
        expect(targetB.isEmpty()).true
        bodyA.setValue(Option.wrap(targetA))
        bodyB.setValue(Option.wrap(targetB))
        expect(targetA.isEmpty()).true
        expect(targetB.isEmpty()).true
        expect(bodyA.isEmpty()).true
        expect(bodyB.isEmpty()).true
        expect(root.isEmpty()).false

        root.setValue(Option.wrap(bodyA)) // point to body A which observes now target A
        expect(bodyA.isEmpty()).false
        expect(targetA.isEmpty()).false
        bodyA.setValue(Option.wrap(targetB)) // point to target B
        expect(bodyA.isEmpty()).false
        expect(bodyB.isEmpty()).true
        expect(targetA.isEmpty()).true
        expect(targetB.isEmpty()).false
        bodyA.setValue(Option.wrap(targetA)) // point to target A
        expect(bodyA.isEmpty()).false
        expect(bodyB.isEmpty()).true
        expect(targetA.isEmpty()).false
        expect(targetB.isEmpty()).true
        subscription.terminate()
        expect(targetA.isEmpty()).true
        expect(targetB.isEmpty()).true
        expect(bodyA.isEmpty()).true
        expect(bodyB.isEmpty()).true
        expect(root.isEmpty()).true
    })

    it<Context>("with next", ({root, bodyA, bodyB, targetA, targetB}) => {
        const catchupAndSubscribe = (observer: Observer<Option<number>>): Subscription => {
            const cascading = new CascadingSubscriptions()
            const {own, toObserver} = cascading.next()
            return own(root.catchupAndSubscribe(toObserver((option: Option<typeof bodyA>): Subscription =>
                option.match({
                    none: () => {
                        observer(Option.None)
                        return Terminable.Empty
                    },
                    some: body => {
                        const {own, toObserver} = cascading.next()
                        return own(body.catchupAndSubscribe(toObserver((option: Option<typeof targetA>): Subscription => option.match({
                            none: () => {
                                observer(Option.None)
                                return Terminable.Empty
                            },
                            some: target => target.catchupAndSubscribe(observer)
                        }))))
                    }
                })
            )))
        }
        expect(root.isEmpty()).true
        const subscription = catchupAndSubscribe(_option => {})
        expect(root.isEmpty()).false
        targetA.setValue(Option.wrap(42))
        targetB.setValue(Option.wrap(43))
        expect(targetA.isEmpty()).true
        expect(targetB.isEmpty()).true
        bodyA.setValue(Option.wrap(targetA))
        bodyB.setValue(Option.wrap(targetB))
        expect(targetA.isEmpty()).true
        expect(targetB.isEmpty()).true
        expect(bodyA.isEmpty()).true
        expect(bodyB.isEmpty()).true
        expect(root.isEmpty()).false

        root.setValue(Option.wrap(bodyA)) // point to body A which observes now target A
        expect(bodyA.isEmpty()).false
        expect(targetA.isEmpty()).false
        bodyA.setValue(Option.wrap(targetB)) // point to target B
        expect(bodyA.isEmpty()).false
        expect(bodyB.isEmpty()).true
        expect(targetA.isEmpty()).true
        expect(targetB.isEmpty()).false
        bodyA.setValue(Option.wrap(targetA)) // point to target A
        expect(bodyA.isEmpty()).false
        expect(bodyB.isEmpty()).true
        expect(targetA.isEmpty()).false
        expect(targetB.isEmpty()).true
        subscription.terminate()
        expect(targetA.isEmpty()).true
        expect(targetB.isEmpty()).true
        expect(bodyA.isEmpty()).true
        expect(bodyB.isEmpty()).true
        expect(root.isEmpty()).true
    })
})