import { BoxSchema } from "box-forge"
import { Pointers } from "../../../../../src/data/pointers"
import { createMidiEffectDevice } from "../builder"

export const ZeitgeistDeviceBox: BoxSchema<Pointers> = createMidiEffectDevice("ZeitgeistDeviceBox", {
	10: { type: "pointer", name: "groove", pointerType: Pointers.Groove, mandatory: true }
})