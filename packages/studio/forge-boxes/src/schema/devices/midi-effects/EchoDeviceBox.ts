import {BoxSchema} from "lib-box-forge"
import {Pointers} from "studio-enums"
import {DefaultParameterPointerRules} from "../../defaults"
import {createMidiEffectDevice} from "../builder"

export const EchoDeviceBox: BoxSchema<Pointers> = createMidiEffectDevice("EchoDeviceBox", {
    10: {type: "float32", name: "rate", pointerRules: DefaultParameterPointerRules},
    11: {type: "boolean", name: "sync", pointerRules: DefaultParameterPointerRules},
    12: {type: "float32", name: "feedback", pointerRules: DefaultParameterPointerRules},
    13: {type: "float32", name: "velocity", pointerRules: DefaultParameterPointerRules}
})