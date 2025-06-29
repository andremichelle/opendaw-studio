import {Pointers, AudioUnitType} from "studio-enums"
import {DefaultParameterPointerRules} from "./defaults"
import {BoxSchema} from "box-forge"

export const AudioUnitBox: BoxSchema<Pointers> = {
    type: "box",
    class: {
        name: "AudioUnitBox",
        fields: {
            1: {type: "string", name: "type", value: AudioUnitType.Instrument},
            2: {type: "pointer", name: "collection", pointerType: Pointers.AudioUnits, mandatory: true},
            3: {type: "field", name: "editing", pointerRules: {accepts: [Pointers.Editing], mandatory: false}},
            11: {type: "int32", name: "index"},
            12: {type: "float32", name: "volume", pointerRules: DefaultParameterPointerRules},
            13: {type: "float32", name: "panning", pointerRules: DefaultParameterPointerRules},
            14: {type: "boolean", name: "mute", pointerRules: DefaultParameterPointerRules},
            15: {type: "boolean", name: "solo", pointerRules: DefaultParameterPointerRules},
            20: {
                type: "field",
                name: "tracks",
                pointerRules: {accepts: [Pointers.TrackCollection], mandatory: false}
            },
            21: {
                type: "field",
                name: "midi-effects",
                pointerRules: {accepts: [Pointers.MidiEffectHost], mandatory: false}
            },
            22: {
                type: "field",
                name: "input",
                pointerRules: {accepts: [Pointers.InstrumentHost, Pointers.AudioOutput], mandatory: false}
            },
            23: {
                type: "field",
                name: "audio-effects",
                pointerRules: {accepts: [Pointers.AudioEffectHost], mandatory: false}
            },
            24: {
                type: "field",
                name: "aux-sends",
                pointerRules: {accepts: [Pointers.AuxSend], mandatory: false}
            },
            25: {
                type: "pointer",
                name: "output",
                pointerType: Pointers.AudioOutput, mandatory: false
            }
        } as const
    }, pointerRules: {accepts: [Pointers.Selection, Pointers.Automation], mandatory: false}
}

export const AudioBusBox: BoxSchema<Pointers> = {
    type: "box",
    class: {
        name: "AudioBusBox",
        fields: {
            1: {type: "pointer", name: "collection", pointerType: Pointers.AudioBusses, mandatory: true},
            2: {type: "pointer", name: "output", pointerType: Pointers.AudioOutput, mandatory: true},
            3: {
                type: "field",
                name: "input",
                pointerRules: {accepts: [Pointers.AudioOutput], mandatory: false}
            },
            4: {type: "boolean", name: "enabled", value: true},
            5: {type: "string", name: "icon"},
            6: {type: "string", name: "label"},
            7: {type: "string", name: "color", value: "red"},
            8: {type: "boolean", name: "minimized"}
        }
    }
}

export const AuxSendBox: BoxSchema<Pointers> = {
    type: "box",
    class: {
        name: "AuxSendBox",
        fields: {
            1: {type: "pointer", name: "audio-unit", pointerType: Pointers.AuxSend, mandatory: true},
            2: {type: "pointer", name: "target-bus", pointerType: Pointers.AudioOutput, mandatory: true},
            3: {type: "int32", name: "index"},
            4: {type: "int32", name: "routing"},
            6: {type: "float32", name: "send-pan", pointerRules: DefaultParameterPointerRules},
            5: {type: "float32", name: "send-gain", pointerRules: DefaultParameterPointerRules}
        }
    }
}