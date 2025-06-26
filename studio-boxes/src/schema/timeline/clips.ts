import { Pointers } from "@core/data/pointers"
import { ClassSchema } from "box-forge"

export const ClipPlaybackFields = {
	name: "ClipPlaybackFields",
	fields: {
		1: { type: "boolean", name: "loop", value: true },
		2: { type: "boolean", name: "reverse" },
		3: { type: "boolean", name: "mute" }, // TODO Remove
		4: { type: "int32", name: "speed" },
		5: { type: "int32", name: "quantise" },
		6: { type: "int32", name: "trigger" }
	}
} satisfies ClassSchema<Pointers>