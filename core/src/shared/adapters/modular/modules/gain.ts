import {ModuleGainBox} from "@core/data/boxes"
import {Pointers} from "@core/data/pointers.ts"
import {ModuleAdapter} from "@core/shared/adapters/modular/module.ts"
import {Direction, ModuleConnectorAdapter} from "@core/shared/adapters/modular/connector.ts"
import {AbstractModuleAdapter} from "../abstract.ts"
import {StringMapping, ValueMapping} from "std"
import {AutomatableParameterFieldAdapter} from "@core/shared/AutomatableParameterFieldAdapter.ts"

import {BoxAdaptersContext} from "@core/shared/BoxAdaptersContext.ts"

export class ModuleGainAdapter extends AbstractModuleAdapter<ModuleGainBox> implements ModuleAdapter {
    readonly #parameterGain: AutomatableParameterFieldAdapter<number>
    readonly #voltageInput: ModuleConnectorAdapter<Pointers.VoltageConnection, Direction.Input>
    readonly #voltageOutput: ModuleConnectorAdapter<Pointers.VoltageConnection, Direction.Output>

    constructor(context: BoxAdaptersContext, box: ModuleGainBox) {
        super(context, box)

        this.#parameterGain = this.parameters.createParameter(box.gain,
            ValueMapping.DefaultDecibel,
            StringMapping.numeric({unit: "db"}),
            "Gain")
        this.#voltageInput = ModuleConnectorAdapter.create(context.boxAdapters, box.voltageInput, Direction.Input, "Input")
        this.#voltageOutput = ModuleConnectorAdapter.create(context.boxAdapters, box.voltageOutput, Direction.Output, "Output")
    }

    get parameterGain(): AutomatableParameterFieldAdapter<number> {return this.#parameterGain}
    get voltageInput(): ModuleConnectorAdapter<Pointers.VoltageConnection, Direction.Input> {return this.#voltageInput}
    get voltageOutput(): ModuleConnectorAdapter<Pointers.VoltageConnection, Direction.Output> {return this.#voltageOutput}

    get inputs(): ReadonlyArray<ModuleConnectorAdapter<Pointers.VoltageConnection, Direction.Input>> {
        return [this.#voltageInput]
    }
    get outputs(): ReadonlyArray<ModuleConnectorAdapter<Pointers.VoltageConnection, Direction.Output>> {
        return [this.#voltageOutput]
    }
}