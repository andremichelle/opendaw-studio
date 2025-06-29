import {BoxSchema} from "lib-box-forge"
import {Pointers} from "studio-enums"
import {createInstrumentDevice} from "./builder"

const ParameterPointerRules = {
    accepts: [Pointers.Modulation, Pointers.Automation, Pointers.StepAutomation],
    mandatory: false
}

export const DeviceClashBox: BoxSchema<Pointers> = createInstrumentDevice("DeviceClashBox", {
    10: {type: "float32", name: "delay", pointerRules: ParameterPointerRules, value: 0.5},
    11: {type: "float32", name: "feedback", pointerRules: ParameterPointerRules, value: 0.9},
    12: {type: "float32", name: "cross", pointerRules: ParameterPointerRules, value: 0.0},
    13: {type: "float32", name: "filter", pointerRules: ParameterPointerRules, value: 0.0},
    14: {type: "float32", name: "wet", pointerRules: ParameterPointerRules, value: -3.0},
    15: {type: "float32", name: "dry", pointerRules: ParameterPointerRules, value: -3.0},
    30: {
        type: "array", name: "patterns", element: {
            type: "object",
            class: {
                name: "ClashPattern", fields: {
                    10: {
                        type: "array", name: "steps", element: {
                            type: "object",
                            class: {
                                name: "ClashStep", fields: {
                                    1: {
                                        type: "boolean",
                                        name: "active",
                                        pointerRules: {accepts: [Pointers.StepAutomation], mandatory: false}
                                    }
                                }
                            }
                        },
                        length: 128
                    },
                    11: {type: "int32", name: "length", value: 16},
                    12: {type: "int32", name: "scale", value: 960}
                }
            }
        },
        length: 16
    }
})
