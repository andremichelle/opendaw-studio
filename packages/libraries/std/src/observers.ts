import {Procedure} from "./lang"
import {Subscription, Terminable} from "./terminable"
import {Option} from "./option"

export type Observer<VALUE> = Procedure<VALUE>

export interface Observable<VALUE> {
    subscribe(observer: Observer<VALUE>): Subscription
}

export class Notifier<T> implements Observable<T>, Terminable {
    static subscribeMany<T extends Observable<any>>(observer: Observer<T>,
                                                    ...observables: ReadonlyArray<T>): Subscription {
        return Terminable.many(...observables
            .map(observable => observable.subscribe(() => observer(observable))))
    }

    readonly #observers: Set<Observer<T>> = new Set<Observer<T>>() // A set allows us to remove while iterating

    subscribe(observer: Observer<T>): Subscription {
        this.#observers.add(observer)
        return {terminate: (): unknown => this.#observers.delete(observer)}
    }

    isEmpty(): boolean {return this.#observers.size === 0}
    notify(value: T): void {this.#observers.forEach((observer: Observer<T>) => observer(value))}
    observers(): Set<Observer<T>> {return this.#observers}
    terminate(): void {this.#observers.clear()}
}

export interface ObservableValue<T> extends Observable<ObservableValue<T>> {
    getValue(): T
    catchupAndSubscribe(observer: Observer<ObservableValue<T>>): Subscription
}

export namespace ObservableValue {
    export const make = <T>(value: T): ObservableValue<T> => new class implements ObservableValue<T> {
        getValue(): T {return value}
        subscribe(_observer: Observer<ObservableValue<T>>): Subscription {return Terminable.Empty}
        catchupAndSubscribe(observer: Observer<ObservableValue<T>>): Subscription {
            observer(this)
            return Terminable.Empty
        }
    }
}

export interface MutableObservableValue<T> extends ObservableValue<T> {
    setValue(value: T): void
}

export namespace MutableObservableValue {
    export const False: MutableObservableValue<boolean> =
        new class implements MutableObservableValue<boolean> {
            getValue() {return false}
            setValue(_: boolean): void {}
            subscribe(_: Observer<ObservableValue<boolean>>) {return Terminable.Empty}
            catchupAndSubscribe(observer: Observer<ObservableValue<boolean>>) {
                observer(this)
                return Terminable.Empty
            }
        }

    export const inverseBoolean = (observableValue: MutableObservableValue<boolean>): MutableObservableValue<boolean> =>
        new class implements MutableObservableValue<boolean> {
            getValue() {return !observableValue.getValue()}
            setValue(value: boolean): void {observableValue.setValue(!value)}
            subscribe(observer: Observer<ObservableValue<boolean>>) {return observableValue.subscribe(observer)}
            catchupAndSubscribe(observer: Observer<ObservableValue<boolean>>) {
                observer(this)
                return this.subscribe(observer)
            }
        }
}

export interface ValueGuard<T> {
    guard(value: T): T
}

export class DefaultObservableValue<T> implements MutableObservableValue<T>, Terminable {
    readonly #notifier: Notifier<ObservableValue<T>>

    readonly #guard: Option<ValueGuard<any>> = Option.None

    #value: T

    constructor(value: T, guard?: ValueGuard<T>) {
        this.#notifier = new Notifier<ObservableValue<T>>()
        this.#value = guard?.guard(value) ?? value
        this.#guard = Option.wrap(guard)
    }

    setValue(value: T): void {
        if (this.#guard.nonEmpty()) {value = this.#guard.unwrap().guard(value)}
        if (this.#value === value) {return}
        this.#value = value
        this.#notifier.notify(this)
    }
    getValue(): T {return this.#value}
    subscribe(observer: Observer<ObservableValue<T>>): Terminable {return this.#notifier.subscribe(observer)}
    catchupAndSubscribe(observer: Observer<ObservableValue<T>>): Terminable {
        observer(this)
        return this.#notifier.subscribe(observer)
    }
    terminate(): void {this.#notifier.terminate()}
    toString(): string {return `{DefaultObservableValue value: ${this.#value}`}
}