import {BoxAdapters} from "@/audio-engine-shared/BoxAdapters.ts"
import {LoopableRegion, ppqn, Region} from "dsp"
import {asDefined, Comparator, int, Nullish, Observer, Option, Selectable, Subscription} from "std"
import {AudioRegionBox, BoxVisitor, NoteRegionBox, ValueRegionBox} from "@core/data/boxes"
import {AudioRegionBoxAdapter} from "./region/AudioRegionBoxAdapter.ts"
import {Box, Field} from "box"
import {AnyRegionBox} from "@core/data/unions.ts"
import {AnyRegionBoxAdapter} from "@/audio-engine-shared/adapters/UnionAdapterTypes.ts"
import {NoteRegionBoxAdapter} from "./region/NoteRegionBoxAdapter.ts"
import {Pointers} from "@core/data/pointers.ts"
import {TrackBoxAdapter} from "@/audio-engine-shared/adapters/timeline/TrackBoxAdapter.ts"
import {ValueRegionBoxAdapter} from "./region/ValueRegionBoxAdapter.ts"
import {BoxAdapter} from "@/audio-engine-shared/BoxAdapter"

export interface RegionBoxAdapterVisitor<R> {
    visitNoteRegionBoxAdapter?(adapter: NoteRegionBoxAdapter): R
    visitAudioRegionBoxAdapter?(adapter: AudioRegionBoxAdapter): R
    visitValueRegionBoxAdapter?(adapter: ValueRegionBoxAdapter): R
}

export interface RegionBoxAdapter<CONTENT> extends BoxAdapter, Region, Selectable {
    get box(): AnyRegionBox
    get isSelected(): boolean
    get hue(): int
    get mute(): boolean
    get label(): string
    get isMirrowed(): boolean
    get canMirror(): boolean
    get trackBoxAdapter(): Option<TrackBoxAdapter>
    get hasCollection(): boolean
    get optCollection(): Option<CONTENT>

    subscribeChange(observer: Observer<void>): Subscription
    copyTo(target?: { track?: Field<Pointers.RegionCollection>, position?: ppqn }): AnyRegionBoxAdapter
    consolidate(): void
    flatten(regions: ReadonlyArray<RegionBoxAdapter<unknown>>): void
    canFlatten(regions: ReadonlyArray<RegionBoxAdapter<unknown>>): boolean
    accept<VISITOR extends RegionBoxAdapterVisitor<any>>(visitor: VISITOR)
        : VISITOR extends RegionBoxAdapterVisitor<infer R> ? Nullish<R> : void
}

export interface LoopableRegionBoxAdapter<CONTENT> extends RegionBoxAdapter<CONTENT>, LoopableRegion {
    get offset(): ppqn
    get loopOffset(): ppqn
    get loopDuration(): ppqn
}

export const RegionComparator: Comparator<AnyRegionBoxAdapter> = (a, b) => a.position - b.position

export const RegionAdapters = {
    for: (boxAdapters: BoxAdapters, box: Box): AnyRegionBoxAdapter => asDefined(box.accept<BoxVisitor<AnyRegionBoxAdapter>>({
        visitNoteRegionBox: (box: NoteRegionBox) => boxAdapters.adapterFor(box, NoteRegionBoxAdapter),
        visitAudioRegionBox: (box: AudioRegionBox) => boxAdapters.adapterFor(box, AudioRegionBoxAdapter),
        visitValueRegionBox: (box: ValueRegionBox) => boxAdapters.adapterFor(box, ValueRegionBoxAdapter)
    }), "")
}