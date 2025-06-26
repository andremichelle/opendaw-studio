import {TimelineBox} from "@core/data/boxes"
import {UUID} from "std"
import {Address} from "box"
import {MarkerTrackAdapter} from "@/audio-engine-shared/adapters/timeline/MarkerTrackAdapter.ts"
import {BoxAdaptersContext} from "@/audio-engine-shared/BoxAdaptersContext"
import {BoxAdapter} from "@/audio-engine-shared/BoxAdapter"

export class TimelineBoxAdapter implements BoxAdapter {
    readonly #box: TimelineBox
    readonly #markerTrack: MarkerTrackAdapter

    constructor(context: BoxAdaptersContext, box: TimelineBox) {
        this.#box = box
        this.#markerTrack = new MarkerTrackAdapter(context, this.#box.markerTrack)
    }

    terminate(): void {}

    get box(): TimelineBox {return this.#box}
    get uuid(): UUID.Format {return this.#box.address.uuid}
    get address(): Address {return this.#box.address}
    get markerTrack(): MarkerTrackAdapter {return this.#markerTrack}
}