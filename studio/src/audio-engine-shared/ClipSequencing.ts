import {Option, Terminable, UUID} from "std"
import {ppqn} from "dsp"
import {AnyClipBoxAdapter} from "@/audio-engine-shared/adapters/UnionAdapterTypes.ts"

export type Section = {
    optClip: Option<AnyClipBoxAdapter>
    sectionFrom: ppqn
    sectionTo: ppqn
}

export interface ClipSequencing extends Terminable {
    iterate(trackKey: UUID.Format, a: ppqn, b: ppqn): Generator<Section>
}