import {PPQN} from "opendaw-dsp"
import {BoxSchema} from "box-forge"
import {Pointers} from "studio-enums"
import {ClipPlaybackFields} from "./clips"

export const NoteEventBox: BoxSchema<Pointers> = {
    type: "box",
    class: {
        name: "NoteEventBox",
        fields: {
            1: {type: "pointer", name: "events", pointerType: Pointers.NoteEvents, mandatory: true},
            10: {type: "int32", name: "position"},
            11: {type: "int32", name: "duration", value: PPQN.SemiQuaver}, // [1...]
            20: {type: "int32", name: "pitch", value: 60}, // [0...127]
            21: {type: "float32", name: "velocity", value: 100.0 / 127.0}, // [0...1]
            22: {type: "int32", name: "play-count", value: 1}, // [1...128]
            23: {type: "float32", name: "play-curve", value: 0.0}, // [-1...1]
            24: {type: "float32", name: "cent", value: 0}, // [-50...50]
            25: {type: "int32", name: "chance", value: 100} // [1...100]
        }
    }, pointerRules: {accepts: [Pointers.Selection, Pointers.NoteEventFeature], mandatory: false}
}

// TODO Create, refer this and remove 'play-count' and 'play-curve' from NoteEventBox
export const NoteEventRepeatBox: BoxSchema<Pointers> = {
    type: "box",
    class: {
        name: "NoteEventRepeatBox",
        fields: {
            1: {type: "pointer", name: "event", pointerType: Pointers.NoteEventFeature, mandatory: true},
            2: {type: "int32", name: "count", value: 1}, // [1...128]
            3: {type: "float32", name: "curve", value: 0.0}, // [-1...1]
            4: {type: "float32", name: "length", value: 1.0} // [0...1]
        }
    }
}

export const NoteEventCollectionBox: BoxSchema<Pointers> = {
    type: "box",
    class: {
        name: "NoteEventCollectionBox",
        fields: {
            1: {type: "field", name: "events", pointerRules: {accepts: [Pointers.NoteEvents], mandatory: false}},
            2: {type: "field", name: "owners", pointerRules: {accepts: [Pointers.NoteEventCollection], mandatory: true}}
        }
    }, pointerRules: {accepts: [Pointers.Selection], mandatory: false}
}

export const NoteRegionBox: BoxSchema<Pointers> = {
    type: "box",
    class: {
        name: "NoteRegionBox",
        fields: {
            1: {type: "pointer", name: "regions", pointerType: Pointers.RegionCollection, mandatory: true},
            2: {type: "pointer", name: "events", pointerType: Pointers.NoteEventCollection, mandatory: true},
            10: {type: "int32", name: "position"},
            11: {type: "int32", name: "duration"},
            12: {type: "int32", name: "loop-offset"},
            13: {type: "int32", name: "loop-duration"},
            14: {type: "int32", name: "event-offset"},
            15: {type: "boolean", name: "mute"},
            16: {type: "string", name: "label"},
            17: {type: "int32", name: "hue"}
        }
    }, pointerRules: {accepts: [Pointers.Selection, Pointers.Editing], mandatory: false}
}

export const NoteClipBox: BoxSchema<Pointers> = {
    type: "box",
    class: {
        name: "NoteClipBox",
        fields: {
            1: {type: "pointer", name: "clips", pointerType: Pointers.ClipCollection, mandatory: true},
            2: {type: "pointer", name: "events", pointerType: Pointers.NoteEventCollection, mandatory: true},
            3: {type: "int32", name: "index"},
            4: {type: "object", name: "playback", class: ClipPlaybackFields},
            10: {type: "int32", name: "duration"},
            11: {type: "boolean", name: "mute"},
            12: {type: "string", name: "label"},
            13: {type: "int32", name: "hue"}
        }
    }, pointerRules: {accepts: [Pointers.Selection, Pointers.Editing], mandatory: false}
}