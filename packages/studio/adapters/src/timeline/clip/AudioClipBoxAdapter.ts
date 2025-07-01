import {ppqn, PPQN} from "lib-dsp"
import {
    DefaultObservableValue,
    int,
    Notifier,
    Nullish,
    ObservableValue,
    Observer,
    Option,
    safeExecute,
    Subscription,
    Terminator,
    UUID
} from "lib-std"
import {AudioClipBox} from "studio-boxes"
import {Address, Int32Field, PointerField, Propagation, Update} from "lib-box"
import {ClipBoxAdapter, ClipBoxAdapterVisitor} from "../ClipBoxAdapter"
import {Pointers} from "studio-enums"
import {TrackBoxAdapter} from "../TrackBoxAdapter"
import {BoxAdaptersContext} from "../../BoxAdaptersContext"
import {AudioFileBoxAdapter} from "../../AudioFileBoxAdapter"

export class AudioClipBoxAdapter implements ClipBoxAdapter<never> {
    readonly type = "audio-clip"

    readonly #terminator: Terminator = new Terminator()

    readonly #context: BoxAdaptersContext
    readonly #box: AudioClipBox

    readonly #selectedValue: DefaultObservableValue<boolean>
    readonly #changeNotifier: Notifier<void>

    #isConstructing: boolean // Prevents stack overflow due to infinite adapter queries

    #fileAdapter: Option<AudioFileBoxAdapter> = Option.None
    #fileSubscription: Option<Subscription> = Option.None

    constructor(context: BoxAdaptersContext, box: AudioClipBox) {
        this.#context = context
        this.#box = box

        this.#isConstructing = true
        this.#selectedValue = this.#terminator.own(new DefaultObservableValue(false))
        this.#changeNotifier = this.#terminator.own(new Notifier<void>())

        this.#terminator.ownAll(
            this.#box.pointerHub.subscribeImmediate({
                onAdd: () => this.#dispatchChange(),
                onRemove: () => this.#dispatchChange()
            }),
            this.#box.file.catchupAndSubscribe((pointerField: PointerField<Pointers.AudioFile>) => {
                this.#fileAdapter = pointerField.targetVertex
                    .map(vertex => this.#context.boxAdapters.adapterFor(vertex.box, AudioFileBoxAdapter))
                this.#fileSubscription.ifSome(subscription => subscription.terminate())
                this.#fileSubscription = this.#fileAdapter.map(adapter =>
                    adapter.getOrCreateAudioLoader().subscribe(() => this.#dispatchChange()))
            }),
            this.#box.subscribe(Propagation.Children, (_update: Update) => this.#dispatchChange()),
            {
                terminate: (): void => {
                    this.#fileSubscription.ifSome(subscription => subscription.terminate())
                    this.#fileSubscription = Option.None
                }
            }
        )
        this.#isConstructing = false
    }

    catchupAndSubscribeSelected(observer: Observer<ObservableValue<boolean>>): Subscription {
        return this.#selectedValue.catchupAndSubscribe(observer)
    }

    subscribeChange(observer: Observer<void>): Subscription {return this.#changeNotifier.subscribe(observer)}
    accept<R>(visitor: ClipBoxAdapterVisitor<R>): Nullish<R> {return safeExecute(visitor.visitAudioClipBoxAdapter, this)}

    consolidate(): void {}
    clone(_mirrored: boolean): void {
        AudioClipBox.create(this.#context.boxGraph, UUID.generate(), box => {
            box.index.setValue(this.indexField.getValue())
            box.gain.setValue(this.gain)
            box.label.setValue(this.label)
            box.hue.setValue(this.hue)
            box.duration.setValue(this.duration)
            box.mute.setValue(this.mute)
            box.clips.refer(this.#box.clips.targetVertex.unwrap())
            box.file.refer(this.#box.file.targetVertex.unwrap())
        })
    }

    onSelected(): void {this.#selectedValue.setValue(true)}
    onDeselected(): void {this.#selectedValue.setValue(false)}

    get isSelected(): boolean {return this.#selectedValue.getValue()}

    terminate(): void {this.#terminator.terminate()}

    get box(): AudioClipBox {return this.#box}
    get uuid(): UUID.Format {return this.#box.address.uuid}
    get address(): Address {return this.#box.address}
    get indexField(): Int32Field {return this.#box.index}
    get duration(): ppqn {return this.#box.duration.getValue()}
    get mute(): boolean {return this.#box.mute.getValue()}
    get hue(): int {return this.#box.hue.getValue()}
    get gain(): number {return this.#box.gain.getValue()}
    get file(): AudioFileBoxAdapter {return this.#fileAdapter.unwrap("Cannot access file.")}
    get hasCollection() {return !this.optCollection.isEmpty()}
    get optCollection(): Option<never> {return Option.None}
    get label(): string {return this.#box.label.getValue()}
    get trackBoxAdapter(): Option<TrackBoxAdapter> {
        if (this.#isConstructing) {return Option.None}
        return this.#box.clips.targetVertex
            .map(vertex => this.#context.boxAdapters.adapterFor(vertex.box, TrackBoxAdapter))
    }
    get isMirrowed(): boolean {return false}
    get canMirror(): boolean {return false}

    toString(): string {return `{AudioClipBoxAdapter ${UUID.toString(this.#box.address.uuid)} d: ${PPQN.toString(this.duration)}}`}

    #dispatchChange(): void {
        this.#changeNotifier.notify()
        this.trackBoxAdapter.unwrapOrNull()?.clips?.dispatchChange()
    }
}