import {BoxSchema} from "lib-box-forge"
import {Pointers} from "studio-enums"

export const RootBox: BoxSchema<Pointers> = {
    type: "box",
    class: {
        name: "RootBox",
        fields: {
            1: {type: "pointer", name: "timeline", mandatory: true, pointerType: Pointers.Timeline},
            2: {type: "field", name: "users", pointerRules: {accepts: [Pointers.User], mandatory: true}},
            3: {type: "string", name: "created"},
            4: {type: "pointer", name: "groove", mandatory: true, pointerType: Pointers.Groove},
            10: {
                type: "field",
                name: "modular-setups",
                pointerRules: {accepts: [Pointers.ModularSetup], mandatory: false}
            },
            20: {
                type: "field",
                name: "audio-units",
                pointerRules: {accepts: [Pointers.AudioUnits], mandatory: false}
            },
            21: {
                type: "field",
                name: "audio-busses",
                pointerRules: {accepts: [Pointers.AudioBusses], mandatory: false}
            },
            30: {
                type: "field",
                name: "output-device",
                pointerRules: {accepts: [Pointers.AudioOutput], mandatory: true}
            },
            40: {
                type: "object",
                name: "piano-mode",
                class: {
                    name: "PianoMode",
                    fields: {
                        1: {type: "int32", name: "keyboard", value: 0},
                        2: {type: "float32", name: "time-range-in-quarters", value: 8},
                        3: {type: "float32", name: "note-scale", value: 1.5},
                        4: {type: "boolean", name: "note-labels", value: true},
                        5: {type: "int32", name: "transpose", value: 0},
                    }
                }
            },
            // TODO Move to UserInterfaceBox
            111: {type: "pointer", name: "editing-channel", pointerType: Pointers.Editing, mandatory: false}
        }
    }
}