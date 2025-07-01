import {ValueRegionBoxAdapter} from "studio-adapters"
import {
    ValueEventCollectionBoxAdapter
} from "studio-adapters"
import {AudioRegionBoxAdapter} from "studio-adapters"
import {LoopableRegionBoxAdapter} from "studio-adapters"
import {
    AudioEventOwnerReader,
    EventOwnerReader,
    NoteEventOwnerReader,
    ValueEventOwnerReader
} from "@/ui/timeline/editors/EventOwnerReader.ts"
import {NoteRegionBoxAdapter} from "studio-adapters"
import {
    NoteEventCollectionBoxAdapter
} from "studio-adapters"
import {ppqn} from "lib-dsp"
import {mod, Observer, Option, Subscription} from "lib-std"
import {TimelineRange} from "@/ui/timeline/TimelineRange.ts"
import {Propagation} from "lib-box"
import {AudioFileBoxAdapter} from "studio-adapters"
import {TrackBoxAdapter} from "studio-adapters"

export class RegionReader<REGION extends LoopableRegionBoxAdapter<CONTENT>, CONTENT> implements EventOwnerReader<CONTENT> {
    static forAudioRegionBoxAdapter(region: AudioRegionBoxAdapter): AudioEventOwnerReader {
        return new class extends RegionReader<AudioRegionBoxAdapter, never> implements AudioEventOwnerReader {
            constructor(region: AudioRegionBoxAdapter) {super(region)}
            get file(): AudioFileBoxAdapter {return region.file}
            get gain(): number {return region.gain}
        }(region)
    }

    static forNoteRegionBoxAdapter(adapter: NoteRegionBoxAdapter): NoteEventOwnerReader {
        return new RegionReader<NoteRegionBoxAdapter, NoteEventCollectionBoxAdapter>(adapter)
    }

    static forValueRegionBoxAdapter(adapter: ValueRegionBoxAdapter): ValueEventOwnerReader {
        return new RegionReader<ValueRegionBoxAdapter, ValueEventCollectionBoxAdapter>(adapter)
    }

    constructor(readonly region: REGION) {}

    get position(): number {return this.region.position}
    get duration(): number {return this.region.duration}
    get complete(): number {return this.region.position + this.region.duration}
    get loopOffset(): number {return this.region.loopOffset}
    get loopDuration(): number {return this.region.loopDuration}
    get contentDuration(): ppqn {return this.region.loopDuration}
    set contentDuration(value: ppqn) {this.region.box.loopDuration.setValue(value)}
    get hue(): number {return this.region.hue}
    get offset(): number {return this.region.offset}
    get hasContent(): boolean {return this.region.hasCollection}
    get isMirrored(): boolean {return this.region.isMirrowed}
    get content(): CONTENT {return this.region.optCollection.unwrap()}
    get trackBoxAdapter(): Option<TrackBoxAdapter> {return this.region.trackBoxAdapter}

    subscribeChange(observer: Observer<void>): Subscription {return this.region.subscribeChange(observer)}
    watchOverlap(range: TimelineRange): Subscription {
        const region = this.region
        return region.box.subscribe(Propagation.Children, update => {
            if (update.type === "primitive") {
                switch (true) {
                    case update.matches(region.box.position):
                    case update.matches(region.box.duration):
                    case update.matches(region.box.loopOffset):
                    case update.matches(region.box.loopDuration): {
                        let unit = range.unitMin
                        if (region.offset + region.loopDuration > range.unitMax) {
                            const paddingRight = range.unitPadding * 2
                            unit = (region.offset + region.loopDuration + paddingRight) - range.unitRange
                        }
                        if (region.offset < range.unitMin) {
                            unit = region.offset
                        }
                        range.moveToUnit(unit)
                        return
                    }
                }
            }
        })
    }
    mapPlaybackCursor(value: ppqn): ppqn {
        if (value < this.position || value > this.complete) {
            return value
        }
        return mod(value - this.offset, this.loopDuration) + this.offset
    }
}