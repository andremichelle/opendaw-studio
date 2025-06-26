import {RootBox} from "@core/data/boxes"
import {Address} from "box"
import {UUID} from "std"
import {AudioBusBoxAdapter} from "@/audio-engine-shared/adapters/audio-unit/AudioBusBoxAdapter.ts"
import {Pointers} from "@core/data/pointers.ts"
import {SortedBoxAdapterCollection} from "@/audio-engine-shared/adapters/SortedBoxAdapterCollection.ts"
import {AudioUnitBoxAdapter} from "@/audio-engine-shared/adapters/audio-unit/AudioUnitBoxAdapter.ts"
import {AnyClipBoxAdapter} from "@/audio-engine-shared/adapters/UnionAdapterTypes.ts"
import {BoxAdapterCollection} from "@/audio-engine-shared/adapters/BoxAdapterCollection.ts"
import {BoxAdaptersContext} from "@/audio-engine-shared/BoxAdaptersContext"
import {BoxAdapter} from "@/audio-engine-shared/BoxAdapter"
import {TimelineBoxAdapter} from "@/audio-engine-shared/adapters/timeline/TimelineBoxAdapter"
import {GrooveShuffleBoxAdapter} from "@/audio-engine-shared/adapters/grooves/GrooveShuffleBoxAdapter"
import {PianoModeAdapter} from "@/audio-engine-shared/adapters/PianoModeAdapter.ts"

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