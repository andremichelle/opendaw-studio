import {Notifier, Observable, ObservableValue, Observer} from "./observers"
import {Subscription, Terminable} from "./terminable"
import {Primitive, unitValue} from "./lang"
import {ValueMapping} from "./value-mapping"
import {StringMapping, StringResult} from "./string-mapping"
import {clamp} from "./math"

export interface ObservableUnitValue extends Observable<ObservableUnitValue> {
    setUnitValue: (value: unitValue) => void
    getUnitValue: () => unitValue
}

export type PrintValue = StringResult

export interface ObservablePrintValue extends Observable<ObservablePrintValue> {
    setPrintValue(text: string): void
    getPrintValue(): PrintValue
}

export type ControlSource = "automated" | "modulated" | "midi" | "external"

export interface ControlSourceListener {
    onControlSourceAdd(source: ControlSource): void
    onControlSourceRemove(source: ControlSource): void
}

export interface Parameter<T extends Primitive = Primitive> extends ObservableValue<T>, ObservableUnitValue, ObservablePrintValue, Terminable {
    subscribe(observer: Observer<Parameter<T>>): Subscription
    catchupAndSubscribeControlSources(observer: ControlSourceListener): Subscription

    getControlledValue(): T
    getControlledUnitValue(): unitValue
    getControlledPrintValue(): Readonly<StringResult>

    get valueMapping(): ValueMapping<T>
    get stringMapping(): StringMapping<T>
    get name(): string
}

export class DefaultParameter<T extends Primitive = Primitive> implements Parameter<T> {
    static percent(name: string, value: unitValue): Parameter<unitValue> {
        return new DefaultParameter<unitValue>(ValueMapping.unipolar(), StringMapping.percent(), name, value)
    }

    readonly #notifier: Notifier<Parameter<T>> = new Notifier<Parameter<T>>()
    readonly #valueMapping: ValueMapping<T>
    readonly #stringMapping: StringMapping<T>
    readonly #name: string
    readonly #resetValue: T

    #value: T

    constructor(valueMapping: ValueMapping<T>, stringMapping: StringMapping<T>, name: string, value: T) {
        this.#valueMapping = valueMapping
        this.#stringMapping = stringMapping
        this.#name = name
        this.#resetValue = value
        this.#value = value
    }

    catchupAndSubscribeControlSources(_observer: ControlSourceListener): Subscription {return Terminable.Empty}

    getControlledValue(): T {return this.getValue()}
    getControlledUnitValue(): unitValue {return this.getUnitValue()}
    getControlledPrintValue(): Readonly<StringResult> {return this.getPrintValue()}

    get valueMapping(): ValueMapping<T> {return this.#valueMapping}
    get stringMapping(): StringMapping<T> {return this.#stringMapping}
    get name(): string {return this.#name}
    get resetValue(): T {return this.#resetValue}

    reset(): void {this.setValue(this.#resetValue)}

    subscribe(observer: Observer<Parameter<T>>): Subscription {return this.#notifier.subscribe(observer)}
    catchupAndSubscribe(observer: Observer<Parameter<T>>): Subscription {
        observer(this)
        return this.subscribe(observer)
    }

    getValue(): T {return this.#value}
    setValue(value: T): void {
        value = this.#valueMapping.clamp(value)
        if (this.#value === value) {return}
        this.#value = value
        this.#notifier.notify(this)
    }

    setUnitValue(value: unitValue): void {this.setValue(this.#valueMapping.y(clamp(value, 0.0, 1.0)))}
    getUnitValue(): unitValue {return this.#valueMapping.x(this.#value)}

    getPrintValue(): Readonly<StringResult> {return this.#stringMapping.x(this.#value)}
    setPrintValue(text: string): void {
        const result = this.#stringMapping.y(text)
        if (result.type === "unitValue") {
            this.setUnitValue(result.value)
        } else if (result.type === "explicit") {
            this.setValue(result.value)
        }
    }

    terminate(): void {this.#notifier.terminate()}
}