import { BoxSchema } from "box-forge"
import { Pointers } from "@/data/pointers"
import { DefaultParameterPointerRules } from "../../defaults"
import { createMidiEffectDevice } from "../builder"

export const EuclidDeviceBox: BoxSchema<Pointers> = createMidiEffectDevice("EuclidDeviceBox", {
	10: { type: "int32", name: "steps", pointerRules: DefaultParameterPointerRules, value: 8 },
	11: { type: "int32", name: "notes", pointerRules: DefaultParameterPointerRules, value: 3 },
	12: { type: "float32", name: "gate", pointerRules: DefaultParameterPointerRules, value: 1.0 },
	13: { type: "int32", name: "rotation", pointerRules: DefaultParameterPointerRules, value: 0.0 },
	14: { type: "float32", name: "velocity", pointerRules: DefaultParameterPointerRules, value: 0.0 },
	15: { type: "int32", name: "division", pointerRules: DefaultParameterPointerRules, value: 2 }
})
