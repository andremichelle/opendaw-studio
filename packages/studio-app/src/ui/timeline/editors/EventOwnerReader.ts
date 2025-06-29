import {ppqn} from "opendaw-dsp"
import {int, Observer, Option, Subscription} from "opendaw-std"
import {TimelineRange} from "@/ui/timeline/TimelineRange.ts"
import {TimeAxisCursorMapper} from "@/ui/timeline/TimeAxis.tsx"
import {
    NoteEventCollectionBoxAdapter
} from "studio-shared"
import {
    ValueEventCollectionBoxAdapter
} from "studio-shared"
import {AudioFileBoxAdapter} from "studio-shared"
import {TrackBoxAdapter} from "studio-shared"

export interface AudioEventOwnerReader extends EventOwnerReader<never> {
    get file(): AudioFileBoxAdapter
    get gain(): number
}

export interface NoteEventOwnerReader extends EventOwnerReader<NoteEventCollectionBoxAdapter> {}

export interface ValueEventOwnerReader extends EventOwnerReader<ValueEventCollectionBoxAdapter> {}

export interface EventOwnerReader<CONTENT> extends TimeAxisCursorMapper {
    get position(): ppqn
    get duration(): ppqn
    get loopOffset(): ppqn
    get loopDuration(): ppqn
    get contentDuration(): ppqn
    set contentDuration(value: ppqn)
    get offset(): ppqn
    get complete(): ppqn
    get hue(): int
    get hasContent(): boolean
    get isMirrored(): boolean
    get content(): CONTENT
    get trackBoxAdapter(): Option<TrackBoxAdapter>

    subscribeChange(observer: Observer<void>): Subscription
    watchOverlap(range: TimelineRange): Subscription
}