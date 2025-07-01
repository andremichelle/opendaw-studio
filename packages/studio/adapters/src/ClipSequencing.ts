import {Option, Terminable, UUID} from "lib-std"
import {ppqn} from "lib-dsp"
import {AnyClipBoxAdapter} from "./UnionAdapterTypes"

export type Section = {
    optClip: Option<AnyClipBoxAdapter>
    sectionFrom: ppqn
    sectionTo: ppqn
}

export interface ClipSequencing extends Terminable {
    iterate(trackKey: UUID.Format, a: ppqn, b: ppqn): Generator<Section>
}