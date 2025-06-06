import {BoxSchema} from "box-forge"
import {Pointers} from "@/data/pointers"

export const StepAutomationBox: BoxSchema<Pointers> = {
    type: "box",
    class: {
        name: "StepAutomationBox",
        fields: {
            1: {type: "pointer", name: "step", pointerType: Pointers.StepAutomation, mandatory: true},
            2: {type: "pointer", name: "parameter", pointerType: Pointers.StepAutomation, mandatory: true},
            3: {type: "float32", name: "value"}
        }
    }
}