import {UnionBoxTypes} from "@core/data/unions.ts"
import {AudioRegionBoxAdapter} from "@core/shared/adapters/timeline/region/AudioRegionBoxAdapter.ts"
import {NoteRegionBoxAdapter} from "@core/shared/adapters/timeline/region/NoteRegionBoxAdapter.ts"
import {ValueRegionBoxAdapter} from "@core/shared/adapters/timeline/region/ValueRegionBoxAdapter.ts"
import {NoteClipBoxAdapter} from "@core/shared/adapters/timeline/clip/NoteClipBoxAdapter.ts"
import {ValueClipBoxAdapter} from "@core/shared/adapters/timeline/clip/ValueClipBoxAdapter.ts"
import {AudioClipBoxAdapter} from "@core/shared/adapters/timeline/clip/AudioClipBoxAdapter.ts"
import {BoxAdapter} from "./BoxAdapter.ts"

export type AnyClipBoxAdapter = NoteClipBoxAdapter | ValueClipBoxAdapter | AudioClipBoxAdapter

export type AnyRegionBoxAdapter = NoteRegionBoxAdapter | ValueRegionBoxAdapter | AudioRegionBoxAdapter
export type AnyLoopableRegionBoxAdapter = AnyRegionBoxAdapter // TODO Clarify

export const UnionAdapterTypes = {
    isRegion: (adapter: BoxAdapter): adapter is AnyRegionBoxAdapter =>
        UnionBoxTypes.isRegionBox(adapter.box),
    isLoopableRegion: (adapter: BoxAdapter): adapter is AnyLoopableRegionBoxAdapter =>
        UnionBoxTypes.isLoopableRegionBox(adapter.box)
}