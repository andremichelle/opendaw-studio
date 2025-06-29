import {AudioRegionBox} from "studio-boxes"
import {int, Notifier, Nullish, Observer, Option, safeExecute, Subscription, Terminator, UUID} from "opendaw-std"
import {Pointers} from "studio-enums"
import {Address, Field, PointerField, Propagation, Update} from "opendaw-box"
import {PPQN, ppqn} from "opendaw-dsp"
import {TrackBoxAdapter} from "../TrackBoxAdapter"
import {LoopableRegionBoxAdapter, RegionBoxAdapter, RegionBoxAdapterVisitor} from "../RegionBoxAdapter"
import {BoxAdaptersContext} from "../../../BoxAdaptersContext"
import {AudioFileBoxAdapter} from "../../../AudioFileBoxAdapter"

type CopyToParams = {
    track?: Field<Pointers.RegionCollection>
    position?: ppqn
    duration?: ppqn
    loopOffset?: ppqn
    loopDuration?: ppqn
}

export class AudioRegionBoxAdapter implements LoopableRegionBoxAdapter<never> {
    readonly type = "audio-region"

    readonly #terminator: Terminator

    readonly #context: BoxAdaptersContext
    readonly #box: AudioRegionBox

    readonly #changeNotifier: Notifier<void>

    #fileAdapter: Option<AudioFileBoxAdapter> = Option.None
    #fileSubscription: Option<Subscription> = Option.None

    #isSelected: boolean
    #constructing: boolean

    constructor(context: BoxAdaptersContext, box: AudioRegionBox) {
        this.#context = context
        this.#box = box

        this.#terminator = new Terminator()
        this.#changeNotifier = new Notifier<void>()

        this.#isSelected = false
        this.#constructing = true

        // TODO For unsyned audio samples
        // this.#terminator.own(this.#project.timelineBox.bpm.subscribe(() => this.trackAdapter.unwrapOrNull()?.dispatchChange()))

        this.#terminator.ownAll(
            this.#box.pointerHub.subscribeImmediate({
                onAdd: () => this.#dispatchChange(),
                onRemove: () => this.#dispatchChange()
            }),
            this.#box.file.catchupAndSubscribe((pointerField: PointerField<Pointers.AudioFile>) => {
                this.#fileAdapter = pointerField.targetVertex.map(vertex => this.#context.boxAdapters.adapterFor(vertex.box, AudioFileBoxAdapter))
                this.#fileSubscription.ifSome(subscription => subscription.terminate())
                this.#fileSubscription = this.#fileAdapter.map(adapter =>
                    adapter.getOrCreateAudioLoader().subscribe(() => this.#dispatchChange()))
            }),
            this.#box.subscribe(Propagation.Children, (update: Update) => {
                if (this.trackBoxAdapter.isEmpty()) {return}
                if (update.type === "primitive" || update.type === "pointer") {
                    const track = this.trackBoxAdapter.unwrap()
                    if (this.#box.position.address.equals(update.address)) {
                        track.regions.onIndexingChanged()
                        this.#dispatchChange()
                    } else {
                        this.#dispatchChange()
                    }
                }
            }),
            {
                terminate: (): void => {
                    this.#fileSubscription.ifSome(subscription => subscription.terminate())
                    this.#fileSubscription = Option.None
                }
            }
        )
        this.#constructing = false
    }

    subscribeChange(observer: Observer<void>): Subscription {return this.#changeNotifier.subscribe(observer)}

    accept<R>(visitor: RegionBoxAdapterVisitor<R>): Nullish<R> {
        return safeExecute(visitor.visitAudioRegionBoxAdapter, this)
    }

    onSelected(): void {
        this.#isSelected = true
        this.#dispatchChange()
    }

    onDeselected(): void {
        this.#isSelected = false
        this.#dispatchChange()
    }

    get isSelected(): boolean {return this.#isSelected}

    terminate() {this.#terminator.terminate()}

    get box(): AudioRegionBox {return this.#box}

    get uuid(): UUID.Format {return this.#box.address.uuid}
    get address(): Address {return this.#box.address}
    get position(): int {return this.#box.position.getValue()}
    get duration(): int {
        const duration = this.#box.duration.getValue()
        if (duration === 0) { // signals no synchronization with track bpm
            const fileBoxAdapter = this.#fileAdapter.unwrap("Cannot compute duration without file")
            const startInSeconds = fileBoxAdapter.startInSeconds
            const endInSeconds = fileBoxAdapter.endInSeconds
            const totalInSeconds = endInSeconds - startInSeconds
            return PPQN.secondsToPulses(totalInSeconds, this.#context.bpm)
        }
        return duration
    }
    get complete(): int {return this.position + this.duration}
    get loopOffset(): ppqn {return this.#box.loopOffset.getValue()}
    get loopDuration(): ppqn {return this.#box.loopDuration.getValue()}
    get offset(): ppqn {return this.position - this.loopOffset}
    get mute(): boolean {return this.#box.mute.getValue()}
    get hue(): int {return this.#box.hue.getValue()}
    get gain(): number {return this.#box.gain.getValue()}
    get file(): AudioFileBoxAdapter {return this.#fileAdapter.unwrap("Cannot access file.")}
    get hasCollection() {return this.#fileAdapter.nonEmpty()}
    get optCollection(): Option<never> {return Option.None}
    get label(): string {
        if (this.#fileAdapter.isEmpty()) {return "No Audio File"}
        const state = this.#fileAdapter.unwrap().getOrCreateAudioLoader().state
        if (state.type === "progress") {return `${Math.round(state.progress * 100)}%`}
        if (state.type === "error") {return String(state.reason)}
        return this.#box.label.getValue()
    }
    get isMirrowed(): boolean {return false}
    get canMirror(): boolean {return false}
    get trackBoxAdapter(): Option<TrackBoxAdapter> {
        return this.#box.regions.targetVertex
            .map(vertex => this.#context.boxAdapters.adapterFor(vertex.box, TrackBoxAdapter))
    }

    copyTo(params?: CopyToParams): AudioRegionBoxAdapter {
        return this.#context.boxAdapters.adapterFor(AudioRegionBox.create(this.#context.boxGraph, UUID.generate(), box => {
            box.position.setValue(params?.position ?? this.position)
            box.duration.setValue(params?.duration ?? this.duration)
            box.loopOffset.setValue(params?.loopOffset ?? this.loopOffset)
            box.loopDuration.setValue(params?.loopDuration ?? this.loopDuration)
            box.regions.refer(params?.track ?? this.#box.regions.targetVertex.unwrap())
            box.file.refer(this.#box.file.targetVertex.unwrap())
            box.mute.setValue(this.mute)
            box.hue.setValue(this.hue)
            box.label.setValue(this.label)
            box.gain.setValue(this.gain)
        }), AudioRegionBoxAdapter)
    }

    consolidate(): void {
        // TODO This needs to done by creating a new audio file
    }
    canFlatten(_regions: ReadonlyArray<RegionBoxAdapter<unknown>>): boolean {return false}
    flatten(_regions: ReadonlyArray<RegionBoxAdapter<unknown>>): Option<AudioRegionBox> {
        // TODO This needs to done by creating a new audio file
        return Option.None
    }
    toString(): string {return `{AudioRegionBoxAdapter ${UUID.toString(this.#box.address.uuid)}}`}

    #dispatchChange(): void {
        if (this.#constructing) {return}
        this.#changeNotifier.notify()
        this.trackBoxAdapter.unwrapOrNull()?.regions?.dispatchChange()
    }
}