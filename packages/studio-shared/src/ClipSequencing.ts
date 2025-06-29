import {Option, Terminable, UUID} from "opendaw-std"
import {ppqn} from "opendaw-dsp"
import {AnyClipBoxAdapter} from "./UnionAdapterTypes"

export type Section = {
    optClip: Option<AnyClipBoxAdapter>
    sectionFrom: ppqn
    sectionTo: ppqn
}

export interface ClipSequencing extends Terminable {
    iterate(trackKey: UUID.Format, a: ppqn, b: ppqn): Generator<Section>
}