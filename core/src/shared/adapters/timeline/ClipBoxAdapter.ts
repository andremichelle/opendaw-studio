import {BoxAdapters} from "@core/shared/BoxAdapters.ts"
import {asDefined, int, Nullish, ObservableValue, Observer, Option, Selectable, Subscription} from "std"
import {AudioClipBox, BoxVisitor, NoteClipBox, ValueClipBox} from "@core/data/boxes"
import {Box} from "box"
import {AnyClipBox} from "@core/data/unions.ts"
import {AnyClipBoxAdapter} from "@core/shared/UnionAdapterTypes.ts"
import {TrackBoxAdapter} from "@core/shared/adapters/timeline/TrackBoxAdapter.ts"
import {NoteClipBoxAdapter} from "@core/shared/adapters/timeline/clip/NoteClipBoxAdapter.ts"
import {ValueClipBoxAdapter} from "./clip/ValueClipBoxAdapter.ts"
import {ppqn} from "dsp"
import {AudioClipBoxAdapter} from "./clip/AudioClipBoxAdapter.ts"
import {BoxAdapter} from "@core/shared/BoxAdapter.ts"

export interface ClipBoxAdapterVisitor<R> {
    visitAudioClipBoxAdapter?(adapter: AudioClipBoxAdapter): R
    visitNoteClipBoxAdapter?(adapter: NoteClipBoxAdapter): R
    visitValueClipBoxAdapter?(adapter: ValueClipBoxAdapter): R
}

export interface ClipBoxAdapter<CONTENT> extends BoxAdapter, Selectable {
    get box(): AnyClipBox
    get isSelected(): boolean
    get hasCollection(): boolean
    get duration(): ppqn
    get hue(): int
    get mute(): boolean
    get label(): string
    get isMirrowed(): boolean
    get canMirror(): boolean
    get optCollection(): Option<CONTENT>
    get trackBoxAdapter(): Option<TrackBoxAdapter>

    consolidate(): void
    clone(consolidate: boolean): void
    catchupAndSubscribeSelected(observer: Observer<ObservableValue<boolean>>): Subscription
    subscribeChange(observer: Observer<void>): Subscription
    accept<VISITOR extends ClipBoxAdapterVisitor<any>>(visitor: VISITOR)
        : VISITOR extends ClipBoxAdapterVisitor<infer R> ? Nullish<R> : void
}

export const ClipAdapters = {
    for: (boxAdapters: BoxAdapters, box: Box): AnyClipBoxAdapter => asDefined(box.accept<BoxVisitor<AnyClipBoxAdapter>>({
        visitNoteClipBox: (box: NoteClipBox) => boxAdapters.adapterFor(box, NoteClipBoxAdapter),
        visitValueClipBox: (box: ValueClipBox) => boxAdapters.adapterFor(box, ValueClipBoxAdapter),
        visitAudioClipBox: (box: AudioClipBox) => boxAdapters.adapterFor(box, AudioClipBoxAdapter)
    }), "")
}