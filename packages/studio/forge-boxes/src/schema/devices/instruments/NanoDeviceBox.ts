import {BoxSchema} from "lib-box-forge"
import {Pointers} from "studio-enums"
import {createInstrumentDevice} from "../builder"
import {DefaultParameterPointerRules} from "../../defaults"

export const NanoDeviceBox: BoxSchema<Pointers> = createInstrumentDevice("NanoDeviceBox", {
    10: {type: "float32", name: "volume", pointerRules: DefaultParameterPointerRules, value: -3.0},
    15: {type: "pointer", name: "file", pointerType: Pointers.AudioFile, mandatory: false},
    20: {type: "float32", name: "release", pointerRules: DefaultParameterPointerRules, value: 0.1}
})