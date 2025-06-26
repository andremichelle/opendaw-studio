import { BoxSchema } from "box-forge"
import { Pointers } from "@core/data/pointers"
import { createInstrumentDevice } from "../builder"
import { DefaultParameterPointerRules } from "../../defaults"

export const PlayfieldDeviceBox: BoxSchema<Pointers> = createInstrumentDevice("PlayfieldDeviceBox", {
	10: { type: "field", name: "samples", pointerRules: { accepts: [Pointers.Sample], mandatory: false } }
})

export const PlayfieldSampleBox: BoxSchema<Pointers> = {
	type: "box",
	class: {
		name: "PlayfieldSampleBox",
		fields: {
			10: { type: "pointer", name: "device", pointerType: Pointers.Sample, mandatory: true },
			11: { type: "pointer", name: "file", pointerType: Pointers.AudioFile, mandatory: true },
			12: {
				type: "field",
				name: "midi-effects",
				pointerRules: { accepts: [Pointers.MidiEffectHost], mandatory: false }
			},
			13: {
				type: "field",
				name: "audio-effects",
				pointerRules: { accepts: [Pointers.AudioEffectHost], mandatory: false }
			},
			15: { type: "int32", name: "index", value: 60 }, // midi-note
			20: { type: "string", name: "label" },
			21: { type: "string", name: "icon" },
			22: { type: "boolean", name: "enabled", value: true },
			23: { type: "boolean", name: "minimized", value: false },
			40: { type: "boolean", name: "mute" },
			41: { type: "boolean", name: "solo" },
			42: { type: "boolean", name: "exclude" },
			43: { type: "boolean", name: "polyphone" },
			44: { type: "int32", name: "gate", value: 0 }, // Off, On, Loop
			45: { type: "float32", name: "pitch", pointerRules: DefaultParameterPointerRules },
			46: { type: "float32", name: "sample-start", pointerRules: DefaultParameterPointerRules, value: 0.0 },
			47: { type: "float32", name: "sample-end", pointerRules: DefaultParameterPointerRules, value: 1.0 },
			48: { type: "float32", name: "attack", pointerRules: DefaultParameterPointerRules, value: 0.001 },
			49: { type: "float32", name: "release", pointerRules: DefaultParameterPointerRules, value: 0.020 }
		}
	}, pointerRules: { accepts: [Pointers.Editing], mandatory: false }
}