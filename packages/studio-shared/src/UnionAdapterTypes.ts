import {AudioRegionBoxAdapter} from "./adapters/timeline/region/AudioRegionBoxAdapter"
import {NoteRegionBoxAdapter} from "./adapters/timeline/region/NoteRegionBoxAdapter"
import {ValueRegionBoxAdapter} from "./adapters/timeline/region/ValueRegionBoxAdapter"
import {NoteClipBoxAdapter} from "./adapters/timeline/clip/NoteClipBoxAdapter"
import {ValueClipBoxAdapter} from "./adapters/timeline/clip/ValueClipBoxAdapter"
import {AudioClipBoxAdapter} from "./adapters/timeline/clip/AudioClipBoxAdapter"
import {BoxAdapter} from "./BoxAdapter"
import {UnionBoxTypes} from "./unions"

export type AnyClipBoxAdapter = NoteClipBoxAdapter | ValueClipBoxAdapter | AudioClipBoxAdapter

export type AnyRegionBoxAdapter = NoteRegionBoxAdapter | ValueRegionBoxAdapter | AudioRegionBoxAdapter
export type AnyLoopableRegionBoxAdapter = AnyRegionBoxAdapter // TODO Clarify

export const UnionAdapterTypes = {
    isRegion: (adapter: BoxAdapter): adapter is AnyRegionBoxAdapter =>
        UnionBoxTypes.isRegionBox(adapter.box),
    isLoopableRegion: (adapter: BoxAdapter): adapter is AnyLoopableRegionBoxAdapter =>
        UnionBoxTypes.isLoopableRegionBox(adapter.box)
}