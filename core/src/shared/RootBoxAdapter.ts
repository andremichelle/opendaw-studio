import {RootBox} from "@core/data/boxes"
import {Address} from "box"
import {UUID} from "std"
import {AudioBusBoxAdapter} from "./adapters/audio-unit/AudioBusBoxAdapter.ts"
import {Pointers} from "@core/data/pointers.ts"
import {SortedBoxAdapterCollection} from "./SortedBoxAdapterCollection.ts"
import {AudioUnitBoxAdapter} from "./adapters/audio-unit/AudioUnitBoxAdapter.ts"
import {AnyClipBoxAdapter} from "./UnionAdapterTypes.ts"
import {BoxAdapterCollection} from "./BoxAdapterCollection.ts"
import {BoxAdaptersContext} from "./BoxAdaptersContext.ts"
import {BoxAdapter} from "./BoxAdapter.ts"
import {TimelineBoxAdapter} from "./adapters/timeline/TimelineBoxAdapter.ts"
import {GrooveShuffleBoxAdapter} from "./adapters/grooves/GrooveShuffleBoxAdapter.ts"
import {PianoModeAdapter} from "./PianoModeAdapter.ts"

export class RootBoxAdapter implements BoxAdapter {
    readonly #context: BoxAdaptersContext
    readonly #box: RootBox

    readonly #audioUnits: SortedBoxAdapterCollection<AudioUnitBoxAdapter, Pointers.AudioUnits>
    readonly #audioBusses: BoxAdapterCollection<AudioBusBoxAdapter>
    readonly #pianoMode: PianoModeAdapter

    constructor(context: BoxAdaptersContext, box: RootBox) {
        this.#context = context
        this.#box = box

        this.#audioUnits = SortedBoxAdapterCollection.create(this.#box.audioUnits,
            box => this.#context.boxAdapters.adapterFor(box, AudioUnitBoxAdapter), Pointers.AudioUnits)

        this.#audioBusses = new BoxAdapterCollection<AudioBusBoxAdapter>(this.#box.audioBusses.pointerHub, box =>
            this.#context.boxAdapters.adapterFor(box, AudioBusBoxAdapter), Pointers.AudioBusses)

        this.#pianoMode = new PianoModeAdapter(this.#box.pianoMode)
    }

    get uuid(): UUID.Format {return this.#box.address.uuid}
    get address(): Address {return this.#box.address}
    get box(): RootBox {return this.#box}
    get audioBusses(): BoxAdapterCollection<AudioBusBoxAdapter> {return this.#audioBusses}
    get audioUnits(): SortedBoxAdapterCollection<AudioUnitBoxAdapter, Pointers.AudioUnits> {return this.#audioUnits}
    get clips(): ReadonlyArray<AnyClipBoxAdapter> {
        return this.#audioUnits.adapters()
            .flatMap(adapter => adapter.tracks.collection.adapters())
            .flatMap(track => track.clips.collection.adapters())
    }
    get groove(): GrooveShuffleBoxAdapter {
        return this.#context.boxAdapters
            .adapterFor(this.#box.groove.targetVertex.unwrap("no groove").box, GrooveShuffleBoxAdapter)
    }
    get timeline(): TimelineBoxAdapter {
        return this.#context.boxAdapters
            .adapterFor(this.#box.timeline.targetVertex.unwrap("no timeline").box, TimelineBoxAdapter)
    }
    get pianoMode(): PianoModeAdapter {return this.#pianoMode}
    get created(): Date {return new Date(this.#box.created.getValue())}

    terminate(): void {this.#audioUnits.terminate()}
}