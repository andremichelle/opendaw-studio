import {BoxSchema} from "lib-box-forge"
import {Pointers} from "studio-enums"
import {DefaultParameterPointerRules} from "../../defaults"
import {createAudioEffectDevice} from "../builder"

export const DelayDeviceBox: BoxSchema<Pointers> = createAudioEffectDevice("DelayDeviceBox", {
    10: {type: "float32", name: "delay", pointerRules: DefaultParameterPointerRules, value: 4},
    11: {type: "float32", name: "feedback", pointerRules: DefaultParameterPointerRules, value: 0.5},
    12: {type: "float32", name: "cross", pointerRules: DefaultParameterPointerRules, value: 0.0},
    13: {type: "float32", name: "filter", pointerRules: DefaultParameterPointerRules, value: 0.0},
    14: {type: "float32", name: "wet", pointerRules: DefaultParameterPointerRules, value: -6.0},
    15: {type: "float32", name: "dry", pointerRules: DefaultParameterPointerRules, value: 0.0}
})