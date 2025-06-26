import {AudioRegionBox} from "@core/data/boxes"
import {ColorCodes} from "@/ui/mixer/ColorCodes.ts"
import {RegionCaptureTarget} from "@/ui/timeline/tracks/audio-unit/regions/RegionCapturing.ts"
import {ElementCapturing} from "@/ui/canvas/capturing.ts"
import {PPQN} from "dsp"
import {UUID} from "std"
import {RegionClipResolver} from "@/ui/timeline/tracks/audio-unit/regions/RegionClipResolver.ts"
import {CreateParameters, TimelineDragAndDrop} from "@/ui/timeline/tracks/audio-unit/TimelineDragAndDrop"
import {Project} from "@/project/Project"
import {Snapping} from "@/ui/timeline/Snapping"

export class RegionSampleDragAndDrop extends TimelineDragAndDrop<RegionCaptureTarget> {
    readonly #snapping: Snapping

    constructor(project: Project, capturing: ElementCapturing<RegionCaptureTarget>, snapping: Snapping) {
        super(project, capturing)

        this.#snapping = snapping
    }

    handleSample({
                     event,
                     trackBoxAdapter,
                     audioFileBox,
                     sample: {name, duration: durationInSeconds, bpm}
                 }: CreateParameters): void {
        const position = Math.max(this.#snapping.xToUnitFloor(event.clientX - this.capturing.element.getBoundingClientRect().left), 0)
        const duration = Math.round(PPQN.secondsToPulses(durationInSeconds, bpm))
        const solver = RegionClipResolver.fromRange(trackBoxAdapter, position, position + duration)
        solver()
        AudioRegionBox.create(this.project.boxGraph, UUID.generate(), box => {
            box.position.setValue(position)
            box.duration.setValue(duration)
            box.loopDuration.setValue(duration)
            box.regions.refer(trackBoxAdapter.box.regions)
            box.hue.setValue(ColorCodes.forTrackType(trackBoxAdapter.type))
            box.label.setValue(name)
            box.file.refer(audioFileBox)
        })
    }
}