import {
    NoteEventCollectionBoxAdapter
} from "@core/shared/adapters/timeline/collection/NoteEventCollectionBoxAdapter.ts"
import {ppqn} from "dsp"
import {mod, Observer, Option, Subscription} from "std"
import {TimelineRange} from "@/ui/timeline/TimelineRange.ts"
import {Propagation} from "box"
import {
    AudioEventOwnerReader,
    EventOwnerReader,
    NoteEventOwnerReader,
    ValueEventOwnerReader
} from "@/ui/timeline/editors/EventOwnerReader.ts"
import {ClipBoxAdapter} from "@core/shared/adapters/timeline/ClipBoxAdapter.ts"
import {NoteClipBoxAdapter} from "@core/shared/adapters/timeline/clip/NoteClipBoxAdapter.ts"
import {
    ValueEventCollectionBoxAdapter
} from "@core/shared/adapters/timeline/collection/ValueEventCollectionBoxAdapter.ts"
import {ValueClipBoxAdapter} from "@core/shared/adapters/timeline/clip/ValueClipBoxAdapter.ts"
import {AudioClipBoxAdapter} from "@core/shared/adapters/timeline/clip/AudioClipBoxAdapter.ts"
import {AudioFileBoxAdapter} from "@core/shared/AudioFileBoxAdapter.ts"
import {TrackBoxAdapter} from "@core/shared/adapters/timeline/TrackBoxAdapter"

export class ClipReader<CONTENT> implements EventOwnerReader<CONTENT> {
    static forAudioClipBoxAdapter(clip: AudioClipBoxAdapter): AudioEventOwnerReader {
        return new class extends ClipReader<never> implements AudioEventOwnerReader {
            constructor(clip: AudioClipBoxAdapter) {super(clip)}

            get file(): AudioFileBoxAdapter {return clip.file}
            get gain(): number {return clip.gain}
        }(clip)
    }

    static forNoteClipBoxAdapter(adapter: NoteClipBoxAdapter): NoteEventOwnerReader {
        return new ClipReader<NoteEventCollectionBoxAdapter>(adapter)
    }

    static forValueClipBoxAdapter(adapter: ValueClipBoxAdapter): ValueEventOwnerReader {
        return new ClipReader<ValueEventCollectionBoxAdapter>(adapter)
    }

    constructor(readonly clip: ClipBoxAdapter<CONTENT>) {}

    get position(): number {return 0}
    get duration(): number {return this.clip.duration}
    get complete(): number {return this.clip.duration}
    get loopOffset(): number {return 0}
    get loopDuration(): number {return this.clip.duration}
    get contentDuration(): ppqn {return this.clip.duration}
    set contentDuration(value: ppqn) {this.clip.box.duration.setValue(value)}
    get hue(): number {return this.clip.hue}
    get offset(): number {return 0}
    get hasContent(): boolean {return this.clip.hasCollection}
    get isMirrored(): boolean {return this.clip.isMirrowed}
    get content(): CONTENT {return this.clip.optCollection.unwrap()}
    get trackBoxAdapter(): Option<TrackBoxAdapter> {return this.clip.trackBoxAdapter}

    subscribeChange(observer: Observer<void>): Subscription {return this.clip.subscribeChange(observer)}
    watchOverlap(range: TimelineRange): Subscription {
        const clip = this.clip
        return clip.box.subscribe(Propagation.Children, update => {
                if (update.type === "primitive") {
                    switch (true) {
                        case update.matches(clip.box.duration):
                            let unit = range.unitMin
                            if (clip.duration > range.unitMax) {
                                const paddingRight = range.unitPadding * 2
                                unit = (clip.duration + paddingRight) - range.unitRange
                            }
                            if (range.unitMin > 0) {
                                unit = 0
                            }
                            range.moveToUnit(unit)
                            return
                    }
                }
            }
        )
    }
    mapPlaybackCursor(value: ppqn): ppqn {return mod(value, this.loopDuration)}
}