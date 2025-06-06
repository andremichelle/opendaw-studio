import {Comparator, int, Option, Terminator, UUID} from "std"
import {Event} from "dsp"
import {Address, Propagation, Update} from "box"
import {TimelineBoxAdapter} from "@/audio-engine-shared/adapters/timeline/TimelineBoxAdapter.ts"
import {MarkerTrackAdapter} from "@/audio-engine-shared/adapters/timeline/MarkerTrackAdapter.ts"
import {MarkerBox} from "@/data/boxes"
import {BoxAdaptersContext} from "@/audio-engine-shared/BoxAdaptersContext"
import {BoxAdapter} from "@/audio-engine-shared/BoxAdapter"

export class MarkerBoxAdapter implements BoxAdapter, Event {
    static readonly Comparator: Comparator<MarkerBoxAdapter> = (a, b) => a.position - b.position

    readonly type = "marker-event"

    readonly #terminator: Terminator = new Terminator()

    readonly #context: BoxAdaptersContext
    readonly #box: MarkerBox

    constructor(context: BoxAdaptersContext, box: MarkerBox) {
        this.#context = context
        this.#box = box

        this.#terminator.own(this.#box.subscribe(Propagation.Children, (update: Update) => {
            if (this.trackAdapter.isEmpty()) {return}
            if (update.type === "primitive" || update.type === "pointer") {
                const track = this.trackAdapter.unwrap()
                if (this.#box.position.address.equals(update.address)) {
                    track.onSortingChanged()
                } else {
                    track.dispatchChange()
                }
            }
        }))
    }

    get box(): MarkerBox {return this.#box}
    get uuid(): UUID.Format {return this.#box.address.uuid}
    get address(): Address {return this.#box.address}
    get position(): int {return this.#box.position.getValue()}
    get plays(): int {return this.#box.plays.getValue()}
    get hue(): int {return this.#box.hue.getValue()}
    get label(): string {return this.#box.label.getValue()}
    get trackAdapter(): Option<MarkerTrackAdapter> {
        return this.#box.track.targetVertex
            .map(vertex => this.#context.boxAdapters.adapterFor(vertex.box, TimelineBoxAdapter).markerTrack)
    }

    terminate() {this.#terminator.terminate()}
    toString(): string {return `{MarkerBoxAdapter ${UUID.toString(this.#box.address.uuid).substring(0, 4)}, plays: ${this.plays}`}
}