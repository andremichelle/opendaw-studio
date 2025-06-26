import {ModuleDelayBox} from "@core/data/boxes"
import {Pointers} from "@core/data/pointers.ts"
import {ModuleAdapter} from "@/audio-engine-shared/adapters/modular/module.ts"
import {Direction, ModuleConnectorAdapter} from "@/audio-engine-shared/adapters/modular/connector.ts"
import {AbstractModuleAdapter} from "../abstract.ts"
import {StringMapping, ValueMapping} from "std"
import {AutomatableParameterFieldAdapter} from "@/audio-engine-shared/adapters/AutomatableParameterFieldAdapter.ts"

import {BoxAdaptersContext} from "@/audio-engine-shared/BoxAdaptersContext"

export class ModuleDelayAdapter extends AbstractModuleAdapter<ModuleDelayBox> implements ModuleAdapter {
    readonly #parameterTime: AutomatableParameterFieldAdapter<number>
    readonly #voltageInput: ModuleConnectorAdapter<Pointers.VoltageConnection, Direction.Input>
    readonly #voltageOutput: ModuleConnectorAdapter<Pointers.VoltageConnection, Direction.Output>

    constructor(context: BoxAdaptersContext, box: ModuleDelayBox) {
        super(context, box)

        this.#parameterTime = this.parameters.createParameter(box.time,
            ValueMapping.exponential(1.0, 10000.0),
            StringMapping.numeric({unit: "ms"}),
            "Time")
        this.#voltageInput = ModuleConnectorAdapter.create(context.boxAdapters, box.voltageInput, Direction.Input, "Input")
        this.#voltageOutput = ModuleConnectorAdapter.create(context.boxAdapters, box.voltageOutput, Direction.Output, "Output")
    }

    get parameterTime(): AutomatableParameterFieldAdapter<number> {return this.#parameterTime}
    get voltageInput(): ModuleConnectorAdapter<Pointers.VoltageConnection, Direction.Input> {return this.#voltageInput}
    get voltageOutput(): ModuleConnectorAdapter<Pointers.VoltageConnection, Direction.Output> {return this.#voltageOutput}

    get inputs(): ReadonlyArray<ModuleConnectorAdapter<Pointers.VoltageConnection, Direction.Input>> {
        return [this.#voltageInput]
    }
    get outputs(): ReadonlyArray<ModuleConnectorAdapter<Pointers.VoltageConnection, Direction.Output>> {
        return [this.#voltageOutput]
    }
}