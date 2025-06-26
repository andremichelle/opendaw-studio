import {Devices} from "@core/shared/devices.ts"
import {AudioBusBoxAdapter} from "@core/shared/adapters/audio-unit/AudioBusBoxAdapter.ts"
import {
    assert,
    DefaultObservableValue,
    Notifier,
    ObservableValue,
    Observer,
    Option,
    Subscription,
    Terminable,
    Terminator
} from "std"
import {PointerHub} from "box"
import {BoxAdapters} from "@core/shared/BoxAdapters.ts"
import {AudioBusBox} from "@core/data/boxes"
import {Pointers} from "@core/data/pointers.ts"
import {AudioUnitInputAdapter} from "@core/shared/adapters/audio-unit/AudioUnitInputAdapter.ts"
import {IconSymbol} from "@core/IconSymbol.ts"

export class AudioUnitInput implements ObservableValue<Option<AudioUnitInputAdapter>>, Terminable {
    readonly #terminator: Terminator
    readonly #labelNotifier: Notifier<Option<string>>
    readonly #iconValue: DefaultObservableValue<IconSymbol>
    readonly #observable: DefaultObservableValue<Option<AudioUnitInputAdapter>>

    #subscription: Subscription = Terminable.Empty

    constructor(pointerHub: PointerHub, boxAdapters: BoxAdapters) {
        this.#terminator = new Terminator()
        this.#labelNotifier = this.#terminator.own(new Notifier<Option<string>>())
        this.#iconValue = this.#terminator.own(new DefaultObservableValue<IconSymbol>(IconSymbol.Unknown))
        this.#observable = this.#terminator.own(new DefaultObservableValue<Option<AudioUnitInputAdapter>>(Option.None))
        this.#terminator.own(this.#observable.subscribe(owner => {
            this.#subscription.terminate()
            this.#subscription = owner.getValue().match({
                none: () => {
                    this.#labelNotifier.notify(Option.None)
                    return Terminable.Empty
                },
                some: ({labelField, iconField}) => Terminable.many(
                    iconField.catchupAndSubscribe(field => this.#iconValue.setValue(IconSymbol.fromName(field.getValue()))),
                    labelField.catchupAndSubscribe(field => this.#labelNotifier.notify(Option.wrap(field.getValue())))
                )
            })
        }))
        this.#terminator.own(pointerHub.catchupAndSubscribeTransactual({
            onAdd: ({box}) => {
                assert(this.#observable.getValue().isEmpty(), "Already set")
                const input: AudioUnitInputAdapter = box instanceof AudioBusBox
                    ? boxAdapters.adapterFor(box, AudioBusBoxAdapter)
                    : boxAdapters.adapterFor(box, Devices.isInstrument)
                if (this.#observable.getValue().unwrapOrNull() !== input) {
                    this.#observable.setValue(Option.wrap(input))
                }
            },
            onRemove: ({box}) => {
                assert(this.#observable.getValue().unwrap("Cannot remove").box.address
                    .equals(box.address), "Unexpected value to remove")
                this.#observable.setValue(Option.None)
            }
        }, Pointers.InstrumentHost, Pointers.AudioOutput))
    }

    getValue(): Option<AudioUnitInputAdapter> {return this.#observable.getValue()}

    subscribe(observer: Observer<ObservableValue<Option<AudioUnitInputAdapter>>>): Terminable {
        return this.#observable.subscribe(observer)
    }

    catchupAndSubscribe(observer: Observer<ObservableValue<Option<AudioUnitInputAdapter>>>): Terminable {
        observer(this.#observable)
        return this.subscribe(observer)
    }

    catchupAndSubscribeLabelChange(observer: Observer<Option<string>>): Terminable {
        observer(this.label)
        return this.#labelNotifier.subscribe(observer)
    }

    catchupAndSubscribeIconChange(observer: Observer<ObservableValue<IconSymbol>>): Terminable {
        return this.#iconValue.catchupAndSubscribe(observer)
    }

    set label(value: string) {this.getValue().ifSome(input => input.labelField.setValue(value))}
    get label(): Option<string> {return this.getValue().map(input => input.labelField.getValue())}

    set icon(value: IconSymbol) {this.getValue().ifSome(input => input.iconField.setValue(IconSymbol.toName(value)))}
    get icon(): IconSymbol {
        return this.getValue().match({
            none: () => IconSymbol.Unknown,
            some: input => IconSymbol.fromName(input.iconField.getValue())
        })
    }

    get iconValue(): DefaultObservableValue<IconSymbol> {return this.#iconValue}

    terminate(): void {
        this.#terminator.terminate()
        this.#subscription.terminate()
    }
}