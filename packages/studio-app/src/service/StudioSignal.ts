import {AudioSample} from "@/audio/AudioSample"
import {ProjectMeta} from "@/project/ProjectMeta"

export type StudioSignal =
    | {
    type: "reset-peaks"
} | {
    type: "import-sample", sample: AudioSample
} | {
    type: "delete-project", meta: ProjectMeta
}