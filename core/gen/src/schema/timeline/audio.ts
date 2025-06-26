import { BoxSchema } from "box-forge"
import { Pointers } from "@core/data/pointers"
import { ClipPlaybackFields } from "./clips"

export const AudioRegionBox: BoxSchema<Pointers> = {
	type: "box",
	class: {
		name: "AudioRegionBox",
		fields: {
			1: { type: "pointer", name: "regions", pointerType: Pointers.RegionCollection, mandatory: true },
			2: { type: "pointer", name: "file", pointerType: Pointers.AudioFile, mandatory: true },
			10: { type: "int32", name: "position" },
			11: { type: "int32", name: "duration" },
			12: { type: "int32", name: "loop-offset" },
			13: { type: "int32", name: "loop-duration" },
			14: { type: "boolean", name: "mute" },
			15: { type: "string", name: "label" },
			16: { type: "int32", name: "hue" },
			17: { type: "float32", name: "gain" }
		}
	}, pointerRules: { accepts: [Pointers.Selection, Pointers.Editing], mandatory: false }
}

export const AudioClipBox: BoxSchema<Pointers> = {
	type: "box",
	class: {
		name: "AudioClipBox",
		fields: {
			1: { type: "pointer", name: "clips", pointerType: Pointers.ClipCollection, mandatory: true },
			2: { type: "pointer", name: "file", pointerType: Pointers.AudioFile, mandatory: true },
			3: { type: "int32", name: "index" },
			4: { type: "object", name: "playback", class: ClipPlaybackFields },
			10: { type: "int32", name: "duration" },
			11: { type: "boolean", name: "mute" },
			12: { type: "string", name: "label" },
			13: { type: "int32", name: "hue" },
			14: { type: "float32", name: "gain" }
		}
	}, pointerRules: { accepts: [Pointers.Selection, Pointers.Editing], mandatory: false }
}