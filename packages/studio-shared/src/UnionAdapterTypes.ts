import {AudioRegionBoxAdapter} from "./timeline/region/AudioRegionBoxAdapter"
import {NoteRegionBoxAdapter} from "./timeline/region/NoteRegionBoxAdapter"
import {ValueRegionBoxAdapter} from "./timeline/region/ValueRegionBoxAdapter"
import {NoteClipBoxAdapter} from "./timeline/clip/NoteClipBoxAdapter"
import {ValueClipBoxAdapter} from "./timeline/clip/ValueClipBoxAdapter"
import {AudioClipBoxAdapter} from "./timeline/clip/AudioClipBoxAdapter"
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