import {BoxSchema} from "box-forge"
import {Pointers} from "@core/data/pointers"

export const AudioFileBox: BoxSchema<Pointers> = {
    type: "box",
    class: {
        name: "AudioFileBox",
        fields: {
            1: {type: "int32", name: "start-in-seconds"},
            2: {type: "int32", name: "end-in-seconds"},
            3: {type: "string", name: "file-name"}
        }
    }, pointerRules: {accepts: [Pointers.AudioFile], mandatory: true}
}