import {Notifier, Observer, Option, Subscription, Terminable, Terminator} from "std"
import {PointerField} from "box"
import {Pointers} from "@/data/pointers.ts"
import {BoxAdapters} from "@/audio-engine-shared/BoxAdapters.ts"
import {AudioBusBoxAdapter} from "@/audio-engine-shared/adapters/audio-unit/AudioBusBoxAdapter.ts"
import {AudioBusBox, BoxVisitor} from "@/data/boxes"

export class AudioUnitOutput implements Terminable {
    readonly #pointerField: PointerField<Pointers.AudioOutput>
    readonly #boxAdapters: BoxAdapters

    readonly #terminator: Terminator
    readonly #busChangeNotifier: Notifier<Option<AudioBusBoxAdapter>>

    #subscription: Subscription = Terminable.Empty

    constructor(pointerField: PointerField<Pointers.AudioOutput>, boxAdapters: BoxAdapters) {
        this.#pointerField = pointerField
        this.#boxAdapters = boxAdapters

        this.#terminator = new Terminator()
        this.#busChangeNotifier = this.#terminator.own(new Notifier<Option<AudioBusBoxAdapter>>())

        this.#terminator.own(pointerField.catchupAndSubscribe(() => {
            this.#subscription.terminate()
            this.#subscription = this.adapter.match({
                none: () => {
                    this.#busChangeNotifier.notify(Option.None)
                    return Terminable.Empty
                },
                some: adapter => adapter.catchupAndSubscribe(adapter => this.#busChangeNotifier.notify(Option.wrap(adapter)))
            })
        }))
    }

    subscribe(observer: Observer<Option<AudioBusBoxAdapter>>): Subscription {
        return this.#busChangeNotifier.subscribe(observer)
    }

    catchupAndSubscribe(observer: Observer<Option<AudioBusBoxAdapter>>): Subscription {
        observer(this.adapter)
        return this.subscribe(observer)
    }

    get adapter(): Option<AudioBusBoxAdapter> {
        return this.#pointerField.targetVertex
            .flatMap(target => Option.wrap(target.box.accept<BoxVisitor<AudioBusBoxAdapter>>({
                visitAudioBusBox: (box: AudioBusBox) => this.#boxAdapters.adapterFor(box, AudioBusBoxAdapter)
            })))
    }

    terminate(): void {
        this.#terminator.terminate()
        this.#subscription.terminate()
    }
}