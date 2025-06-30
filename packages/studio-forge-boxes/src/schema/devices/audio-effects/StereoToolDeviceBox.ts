import {BoxSchema} from "lib-box-forge"
import {Pointers} from "studio-enums"
import {DefaultParameterPointerRules} from "../../defaults"
import {createAudioEffectDevice} from "../builder"
import {StereoMatrix} from "lib-dsp"

export const StereoToolDeviceBox: BoxSchema<Pointers> = createAudioEffectDevice("StereoToolDeviceBox", {
    10: {type: "float32", name: "volume", pointerRules: DefaultParameterPointerRules},
    11: {type: "float32", name: "panning", pointerRules: DefaultParameterPointerRules},
    12: {type: "float32", name: "stereo", pointerRules: DefaultParameterPointerRules},
    13: {type: "boolean", name: "invert-l", pointerRules: DefaultParameterPointerRules},
    14: {type: "boolean", name: "invert-r", pointerRules: DefaultParameterPointerRules},
    15: {type: "boolean", name: "swap", pointerRules: DefaultParameterPointerRules},
    20: {type: "int32", name: "panning-mixing", value: StereoMatrix.Mixing.EqualPower}
})