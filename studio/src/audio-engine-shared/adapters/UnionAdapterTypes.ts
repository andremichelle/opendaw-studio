import {AudioRegionBoxAdapter} from "@/audio-engine-shared/adapters/timeline/region/AudioRegionBoxAdapter.ts"
import {UnionBoxTypes} from "@core/data/unions.ts"
import {NoteRegionBoxAdapter} from "./timeline/region/NoteRegionBoxAdapter.ts"
import {ValueRegionBoxAdapter} from "@/audio-engine-shared/adapters/timeline/region/ValueRegionBoxAdapter.ts"
import {NoteClipBoxAdapter} from "./timeline/clip/NoteClipBoxAdapter.ts"
import {ValueClipBoxAdapter} from "@/audio-engine-shared/adapters/timeline/clip/ValueClipBoxAdapter.ts"
import {AudioClipBoxAdapter} from "@/audio-engine-shared/adapters/timeline/clip/AudioClipBoxAdapter.ts"
import {BoxAdapter} from "@/audio-engine-shared/BoxAdapter"

export type AnyClipBoxAdapter = NoteClipBoxAdapter | ValueClipBoxAdapter | AudioClipBoxAdapter

export type AnyRegionBoxAdapter = NoteRegionBoxAdapter | ValueRegionBoxAdapter | AudioRegionBoxAdapter
export type AnyLoopableRegionBoxAdapter = AnyRegionBoxAdapter // TODO Clarify

export const UnionAdapterTypes = {
    isRegion: (adapter: BoxAdapter): adapter is AnyRegionBoxAdapter =>
        UnionBoxTypes.isRegionBox(adapter.box),
    isLoopableRegion: (adapter: BoxAdapter): adapter is AnyLoopableRegionBoxAdapter =>
        UnionBoxTypes.isLoopableRegionBox(adapter.box)
}