import {createVoltageConnector, ModularBox, ModuleConnectionBox} from "./modules"
import {createModule} from "./builder"
import {Pointers} from "studio-enums"

export const ModuleDefinitions = [
    ModularBox,
    ModuleConnectionBox,
    ...[
        createModule("ModularAudioInputBox", {10: createVoltageConnector("output")}),
        createModule("ModularAudioOutputBox", {10: createVoltageConnector("input")}),
        createModule("ModuleDelayBox", {
            10: createVoltageConnector("voltage-input"),
            11: createVoltageConnector("voltage-output"),
            20: {
                type: "float32",
                name: "time",
                value: 500,
                pointerRules: {accepts: [Pointers.ParameterController], mandatory: false}
            }
        }),
        createModule("ModuleMultiplierBox", {
            10: createVoltageConnector("voltage-input-x"),
            11: createVoltageConnector("voltage-input-y"),
            12: createVoltageConnector("voltage-output"),
            20: {type: "float32", name: "multiplier"}
        }),
        createModule("ModuleGainBox", {
            10: createVoltageConnector("voltage-input"),
            12: createVoltageConnector("voltage-output"),
            20: {
                type: "float32",
                name: "gain",
                pointerRules: {accepts: [Pointers.ParameterController], mandatory: false}
            }
        })
    ]
]