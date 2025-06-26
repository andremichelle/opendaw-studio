import {AutomatableParameterFieldAdapter} from "@core/shared/AutomatableParameterFieldAdapter.ts"
import {Editing, PrimitiveValues} from "box"
import {MutableObservableValue, ObservableValue, Observer, Subscription} from "std"

export namespace EditWrapper {
    export const forValue = <T extends PrimitiveValues>(
        editing: Editing, owner: MutableObservableValue<T>): MutableObservableValue<T> =>
        new class implements MutableObservableValue<T> {
            getValue(): T {return owner.getValue()}
            setValue(value: T) {editing.modify(() => owner.setValue(value))}
            subscribe(observer: Observer<ObservableValue<T>>): Subscription {
                return owner.subscribe(() => observer(this))
            }
            catchupAndSubscribe(observer: Observer<ObservableValue<T>>): Subscription {
                return owner.catchupAndSubscribe(observer)
            }
        }

    export const forAutomatableParameter = <T extends PrimitiveValues>(
        editing: Editing,
        adapter: AutomatableParameterFieldAdapter<T>): MutableObservableValue<T> =>
        new class implements MutableObservableValue<T> {
            getValue(): T {return adapter.getControlledValue()}
            setValue(value: T) {
                if (editing.canModify()) {
                    editing.modify(() => adapter.setValue(value))
                } else {
                    adapter.setValue(value)
                }
            }
            subscribe(observer: Observer<ObservableValue<T>>): Subscription {
                return adapter.subscribe(() => observer(this))
            }
            catchupAndSubscribe(observer: Observer<ObservableValue<T>>): Subscription {
                return adapter.catchupAndSubscribe(observer)
            }
        }
}