import { BoxSchema } from "box-forge"
import {Pointers} from "studio-enums"

export const UserInterfaceBox: BoxSchema<Pointers> = {
	type: "box",
	class: {
		fields: {
			1: { type: "pointer", name: "root", mandatory: true, pointerType: Pointers.User },
			10: { type: "field", name: "selection", pointerRules: { accepts: [Pointers.Selection], mandatory: false } },
			21: { type: "pointer", name: "editing-device-chain", pointerType: Pointers.Editing, mandatory: false },
			22: { type: "pointer", name: "editing-timeline-region", pointerType: Pointers.Editing, mandatory: false },
			23: { type: "pointer", name: "editing-modular-system", pointerType: Pointers.Editing, mandatory: false }
		},
		name: "UserInterfaceBox"
	}
}