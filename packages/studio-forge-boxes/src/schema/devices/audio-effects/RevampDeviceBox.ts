import {BoxSchema, ClassSchema} from "box-forge"
import {Pointers} from "studio-pointers"
import {DefaultParameterPointerRules} from "../../defaults"
import {createAudioEffectDevice} from "../builder"

const Pass = {
    name: "RevampPass",
    fields: {
        1: {type: "boolean", name: "enabled", pointerRules: DefaultParameterPointerRules},
        10: {type: "float32", name: "frequency", pointerRules: DefaultParameterPointerRules},
        11: {type: "int32", name: "order", pointerRules: DefaultParameterPointerRules},
        12: {type: "float32", name: "q", pointerRules: DefaultParameterPointerRules}
    }
} satisfies ClassSchema<Pointers>

const Shelf = {
    name: "RevampShelf",
    fields: {
        1: {type: "boolean", name: "enabled", pointerRules: DefaultParameterPointerRules},
        10: {type: "float32", name: "frequency", pointerRules: DefaultParameterPointerRules},
        11: {type: "float32", name: "gain", pointerRules: DefaultParameterPointerRules}
    }
} satisfies ClassSchema<Pointers>

const Bell = {
    name: "RevampBell",
    fields: {
        1: {type: "boolean", name: "enabled", pointerRules: DefaultParameterPointerRules},
        10: {type: "float32", name: "frequency", pointerRules: DefaultParameterPointerRules},
        11: {type: "float32", name: "gain", pointerRules: DefaultParameterPointerRules},
        12: {type: "float32", name: "q", pointerRules: DefaultParameterPointerRules}
    }
} satisfies ClassSchema<Pointers>

export const RevampDeviceBox: BoxSchema<Pointers> = createAudioEffectDevice("RevampDeviceBox", {
    10: {type: "object", name: "high-pass", class: Pass},
    11: {type: "object", name: "low-shelf", class: Shelf},
    12: {type: "object", name: "low-bell", class: Bell},
    13: {type: "object", name: "mid-bell", class: Bell},
    14: {type: "object", name: "high-bell", class: Bell},
    15: {type: "object", name: "high-shelf", class: Shelf},
    16: {type: "object", name: "low-pass", class: Pass},
    17: {type: "float32", name: "gain", pointerRules: DefaultParameterPointerRules}
})