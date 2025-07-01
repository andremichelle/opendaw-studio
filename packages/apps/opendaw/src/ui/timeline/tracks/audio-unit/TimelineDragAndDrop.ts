import {AnyDragData} from "@/ui/AnyDragData.ts"
import {TrackType} from "studio-adapters"
import {AudioFileBox} from "studio-boxes"
import {ClipCaptureTarget} from "@/ui/timeline/tracks/audio-unit/clips/ClipCapturing.ts"
import {ElementCapturing} from "@/ui/canvas/capturing.ts"
import {isDefined, Nullable, Option, panic, UUID} from "lib-std"
import {TrackBoxAdapter} from "studio-adapters"
import {Instruments} from "@/service/Instruments.ts"
import {RegionCaptureTarget} from "./regions/RegionCapturing"
import {Project} from "@/project/Project"
import {AudioSample} from "@/audio/AudioSample"
import {Promises} from "lib-runtime"

export type CreateParameters = {
    event: DragEvent
    trackBoxAdapter: TrackBoxAdapter
    audioFileBox: AudioFileBox
    sample: AudioSample
}

export abstract class TimelineDragAndDrop<T extends (ClipCaptureTarget | RegionCaptureTarget)> {
    readonly #project: Project
    readonly #capturing: ElementCapturing<T>

    protected constructor(project: Project, capturing: ElementCapturing<T>) {
        this.#project = project
        this.#capturing = capturing
    }

    get project(): Project {return this.#project}
    get capturing(): ElementCapturing<T> {return this.#capturing}

    canDrop(event: DragEvent, data: AnyDragData): Option<T | false> {
        const target: Nullable<T> = this.#capturing.captureEvent(event)
        if (target?.type === "track" && target.track.trackBoxAdapter.type !== TrackType.Audio) {
            return Option.None
        }
        if (target?.type === "clip" && target.clip.trackBoxAdapter.unwrap().type !== TrackType.Audio) {
            return Option.None
        }
        if (target?.type === "region" && target.region.trackBoxAdapter.unwrap().type !== TrackType.Audio) {
            return Option.None
        }
        if (data.type !== "sample" && data.type !== "instrument" && data.type !== "file") {
            return Option.None
        }
        return Option.wrap(isDefined(target) ? target : false)
    }

    async drop(event: DragEvent, data: AnyDragData) {
        const optDrop = this.canDrop(event, data)
        if (optDrop.isEmpty()) {return}
        const drop = optDrop.unwrap()
        const {boxAdapters, boxGraph, editing, service} = this.#project
        let sample: AudioSample
        if (data.type === "sample") {
            sample = data.sample
        } else if (data.type === "file") {
            const file = data.file
            if (!isDefined(file)) {return}
            const {status, value, error} = await Promises.tryCatch(file.arrayBuffer()
                .then(arrayBuffer => service.importSample({name: file.name, arrayBuffer})))
            if (status === "rejected") {
                console.warn(error)
                return
            }
            sample = value
        } else if (data.type === "instrument") {
            editing.modify(() => Instruments.create(this.#project, Instruments[data.device]))
            return
        } else {
            return
        }
        editing.modify(() => {
            let trackBoxAdapter: TrackBoxAdapter
            if (drop === false) {
                trackBoxAdapter = boxAdapters
                    .adapterFor(Instruments.create(this.#project, Instruments.Tape).track, TrackBoxAdapter)
            } else if (drop?.type === "track") {
                trackBoxAdapter = drop.track.trackBoxAdapter
            } else if (drop?.type === "clip") {
                trackBoxAdapter = drop.clip.trackBoxAdapter.unwrap()
            } else if (drop?.type === "region") {
                trackBoxAdapter = drop.region.trackBoxAdapter.unwrap()
            } else {
                return panic("Illegal State")
            }
            const {uuid: uuidAsString, name, duration: durationInSeconds} = sample
            const uuid = UUID.parse(uuidAsString)
            const audioFileBox: AudioFileBox = boxGraph.findBox<AudioFileBox>(uuid)
                .unwrapOrElse(() => AudioFileBox.create(boxGraph, uuid, box => {
                    box.fileName.setValue(name)
                    box.startInSeconds.setValue(0)
                    box.endInSeconds.setValue(durationInSeconds)
                }))
            this.handleSample({event, trackBoxAdapter, audioFileBox, sample})
        })
    }

    abstract handleSample({event, trackBoxAdapter, audioFileBox, sample}: CreateParameters): void
}