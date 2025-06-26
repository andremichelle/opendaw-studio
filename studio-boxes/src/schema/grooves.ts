import { Pointers } from "@core/data/pointers"
import { DefaultParameterPointerRules } from "./defaults"
import { BoxSchema, FieldRecord, mergeFields, reserveMany } from "box-forge"
import { PPQN } from "dsp"
import { Objects } from "std"

const GrooveBoxAttributes = {
	1: { type: "string", name: "label" },
	...reserveMany(2, 3, 4, 5, 6, 7, 8, 9)
} as const satisfies FieldRecord<Pointers>

const createGrooveBox = <FIELDS extends FieldRecord<Pointers>>(
	name: string, fields: Objects.Disjoint<typeof GrooveBoxAttributes, FIELDS>): BoxSchema<Pointers> => ({
	type: "box",
	class: { name, fields: mergeFields(GrooveBoxAttributes, fields) },
	pointerRules: { mandatory: true, accepts: [Pointers.Groove] }
})

export const GrooveShuffleBox: BoxSchema<Pointers> = createGrooveBox("GrooveShuffleBox", {
	10: {
		type: "float32",
		name: "amount",
		pointerRules: DefaultParameterPointerRules, value: 0.6
	},
	11: {
		type: "int32",
		name: "duration",
		pointerRules: DefaultParameterPointerRules,
		value: PPQN.fromSignature(1, 8)
	}
})

export const GrooveOffsetBox: BoxSchema<Pointers> = createGrooveBox("GrooveOffsetBox", {
	10: {
		type: "float32",
		name: "amount",
		pointerRules: DefaultParameterPointerRules, value: 0.0
	},
	11: {
		type: "boolean",
		name: "sync",
		pointerRules: DefaultParameterPointerRules,
		value: true
	}
})