import {RegionCollection} from "dsp"
import {AnyRegionBoxAdapter} from "@core/shared/UnionAdapterTypes.ts"
import {RegionAdapters, RegionComparator} from "@core/shared/adapters/timeline/RegionBoxAdapter.ts"
import {assert, Notifier, Observer, SortedSet, Subscription, Terminator, UUID} from "std"
import {Pointers} from "@core/data/pointers.ts"
import {BoxAdapters} from "@core/shared/BoxAdapters.ts"
import {TrackBoxAdapter} from "./TrackBoxAdapter.ts"

export class TrackRegions {
    readonly #trackBoxAdapter: TrackBoxAdapter

    readonly #terminator: Terminator
    readonly #changeNotifier: Notifier<void>
    readonly #collection: RegionCollection<AnyRegionBoxAdapter>
    readonly #adapters: SortedSet<UUID.Format, AnyRegionBoxAdapter>

    constructor(adapter: TrackBoxAdapter, boxAdapters: BoxAdapters) {
        this.#trackBoxAdapter = adapter

        this.#terminator = new Terminator()
        this.#changeNotifier = this.#terminator.own(new Notifier<void>())
        this.#collection = RegionCollection.create<AnyRegionBoxAdapter>(RegionComparator)
        this.#adapters = UUID.newSet<AnyRegionBoxAdapter>(adapter => adapter.uuid)
        this.#terminator.ownAll(
            this.#trackBoxAdapter.box.regions.pointerHub.catchupAndSubscribeTransactual({
                onAdd: ({box}) => {
                    const adapter = RegionAdapters.for(boxAdapters, box)
                    const added = this.#adapters.add(adapter)
                    assert(added, `Cannot add ${box}`)
                    this.#collection.add(adapter)
                    this.dispatchChange()
                },
                onRemove: ({box: {address: {uuid}}}) => {
                    this.#collection.remove(this.#adapters.removeByKey(uuid))
                    this.dispatchChange()
                }
            }, Pointers.RegionCollection)
        )
    }

    get trackBoxAdapter(): TrackBoxAdapter {return this.#trackBoxAdapter}
    get collection(): RegionCollection<AnyRegionBoxAdapter> {return this.#collection}
    get adapters(): SortedSet<Readonly<Uint8Array>, AnyRegionBoxAdapter> {return this.#adapters}

    onIndexingChanged(): void {
        this.#collection.onIndexingChanged()
        this.dispatchChange()
    }

    subscribeChanges(observer: Observer<void>): Subscription {return this.#changeNotifier.subscribe(observer)}
    dispatchChange(): void {this.#changeNotifier.notify()}
    terminate() {this.#terminator.terminate()}
}