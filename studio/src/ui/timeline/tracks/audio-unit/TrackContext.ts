import {TrackBoxAdapter} from "@/audio-engine-shared/adapters/timeline/TrackBoxAdapter.ts"
import {AudioUnitBoxAdapter} from "@/audio-engine-shared/adapters/audio-unit/AudioUnitBoxAdapter.ts"
import {asDefined, Terminable} from "std"

export type Construct = {
    audioUnitBoxAdapter: AudioUnitBoxAdapter
    trackBoxAdapter: TrackBoxAdapter
    element: HTMLElement
    lifecycle: Terminable
}

export class TrackContext {
    readonly #audioUnitBoxAdapter: AudioUnitBoxAdapter
    readonly #trackBoxAdapter: TrackBoxAdapter
    readonly #element: HTMLElement
    readonly #lifecycle: Terminable

    constructor({audioUnitBoxAdapter, trackBoxAdapter, element, lifecycle}: Construct) {
        this.#audioUnitBoxAdapter = audioUnitBoxAdapter
        this.#trackBoxAdapter = trackBoxAdapter
        this.#element = element
        this.#lifecycle = lifecycle
    }

    get audioUnitBoxAdapter(): AudioUnitBoxAdapter {return this.#audioUnitBoxAdapter}
    get trackBoxAdapter(): TrackBoxAdapter {return this.#trackBoxAdapter}
    get element(): HTMLElement {return this.#element}
    get lifecycle(): Terminable {return this.#lifecycle}
    get size(): number {return this.#element.clientHeight}
    get position(): number {
        return asDefined(this.#element.parentElement, "Track has no parent.").offsetTop + this.#element.offsetTop
    }
}