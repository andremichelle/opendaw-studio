import { BoxSchema } from "box-forge"
import {Pointers} from "studio-enums"
import { createInstrumentDevice } from "../builder"
import { DefaultParameterPointerRules } from "../../defaults"

export const TapeDeviceBox: BoxSchema<Pointers> = createInstrumentDevice("TapeDeviceBox", {
	10: { type: "float32", name: "flutter", pointerRules: DefaultParameterPointerRules },
	11: { type: "float32", name: "wow", pointerRules: DefaultParameterPointerRules },
	12: { type: "float32", name: "noise", pointerRules: DefaultParameterPointerRules },
	13: { type: "float32", name: "saturation", pointerRules: DefaultParameterPointerRules }
}, Pointers.Automation)