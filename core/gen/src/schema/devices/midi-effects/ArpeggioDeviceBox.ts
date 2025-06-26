import { BoxSchema } from "box-forge"
import { Pointers } from "../../../../../src/data/pointers"
import { DefaultParameterPointerRules } from "../../defaults"
import { createMidiEffectDevice } from "../builder"

// TODO Add an option to use milliseconds as a rate

export const ArpeggioDeviceBox: BoxSchema<Pointers> = createMidiEffectDevice("ArpeggioDeviceBox", {
	10: { type: "int32", name: "mode-index", pointerRules: DefaultParameterPointerRules },
	11: { type: "int32", name: "num-octaves", pointerRules: DefaultParameterPointerRules, value: 1 },
	12: { type: "int32", name: "rate-index", pointerRules: DefaultParameterPointerRules, value: 9 },
	13: { type: "float32", name: "gate", pointerRules: DefaultParameterPointerRules, value: 1.0 },
	14: { type: "int32", name: "repeat", pointerRules: DefaultParameterPointerRules, value: 1 },
	15: { type: "float32", name: "velocity", pointerRules: DefaultParameterPointerRules }
})