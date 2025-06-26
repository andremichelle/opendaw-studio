import {SortedBoxAdapterCollection} from "@core/shared/SortedBoxAdapterCollection.ts"
import {AnyClipBoxAdapter} from "@core/shared/UnionAdapterTypes.ts"
import {ClipAdapters} from "@core/shared/adapters/timeline/ClipBoxAdapter.ts"
import {Pointers} from "@core/data/pointers.ts"
import {BoxAdapters} from "@core/shared/BoxAdapters.ts"
import {Notifier, Observer, Subscription, Terminable, Terminator} from "std"
import {TrackBoxAdapter} from "@core/shared/adapters/timeline/TrackBoxAdapter.ts"

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