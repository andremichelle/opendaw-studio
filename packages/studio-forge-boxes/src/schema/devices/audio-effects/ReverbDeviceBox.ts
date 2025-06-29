import { BoxSchema } from "box-forge"
import { Pointers } from "studio-pointers"
import { DefaultParameterPointerRules } from "../../defaults"
import { createAudioEffectDevice } from "../builder"

export const ReverbDeviceBox: BoxSchema<Pointers> = createAudioEffectDevice("ReverbDeviceBox", {
	10: { type: "float32", name: "decay", pointerRules: DefaultParameterPointerRules, value: 0.5 },
	11: { type: "float32", name: "pre-delay", pointerRules: DefaultParameterPointerRules, value: 0.0 },
	12: { type: "float32", name: "damp", pointerRules: DefaultParameterPointerRules, value: 0.5 },
	13: { type: "float32", name: "filter", pointerRules: DefaultParameterPointerRules, value: 0.0 },
	14: { type: "float32", name: "wet", pointerRules: DefaultParameterPointerRules, value: -3.0 },
	15: { type: "float32", name: "dry", pointerRules: DefaultParameterPointerRules, value: 0.0 }
})