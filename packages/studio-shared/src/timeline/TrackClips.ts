import {Pointers} from "studio-enums"
import {Notifier, Observer, Subscription, Terminable, Terminator} from "lib-std"
import {TrackBoxAdapter} from "./TrackBoxAdapter"
import {SortedBoxAdapterCollection} from "../SortedBoxAdapterCollection"
import {AnyClipBoxAdapter} from "../UnionAdapterTypes"
import {BoxAdapters} from "../BoxAdapters"
import {ClipAdapters} from "./ClipBoxAdapter"

export class TrackClips implements Terminable {
    readonly #trackBoxAdapter: TrackBoxAdapter
    readonly #terminator: Terminator
    readonly #changeNotifier: Notifier<void>
    readonly #collection: SortedBoxAdapterCollection<AnyClipBoxAdapter, Pointers.ClipCollection>

    constructor(adapter: TrackBoxAdapter, boxAdapters: BoxAdapters) {
        this.#trackBoxAdapter = adapter

        this.#terminator = new Terminator()
        this.#changeNotifier = this.#terminator.own(new Notifier<void>())
        this.#collection = this.#terminator.own(SortedBoxAdapterCollection.create(adapter.box.clips,
            box => ClipAdapters.for(boxAdapters, box), Pointers.ClipCollection))
        this.#collection.subscribe({
            onAdd: () => this.dispatchChange(),
            onRemove: () => this.dispatchChange(),
            onReorder: () => this.dispatchChange()
        })
    }

    get trackBoxAdapter(): TrackBoxAdapter {return this.#trackBoxAdapter}
    get collection(): SortedBoxAdapterCollection<AnyClipBoxAdapter, Pointers.ClipCollection> {return this.#collection}

    dispatchChange(): void {this.#changeNotifier.notify()}
    subscribeChanges(observer: Observer<void>): Subscription {return this.#changeNotifier.subscribe(observer)}
    terminate(): void {this.#terminator.terminate()}
}