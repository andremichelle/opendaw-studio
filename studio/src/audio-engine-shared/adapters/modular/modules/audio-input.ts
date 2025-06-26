import {ModularAudioInputBox} from "@core/data/boxes"
import {Pointers} from "@core/data/pointers.ts"
import {ModuleAdapter} from "@/audio-engine-shared/adapters/modular/module.ts"
import {Direction, ModuleConnectorAdapter} from "@/audio-engine-shared/adapters/modular/connector.ts"
import {AbstractModuleAdapter} from "../abstract.ts"
import {Arrays} from "std"

import {BoxAdaptersContext} from "@/audio-engine-shared/BoxAdaptersContext"

export class ModularAudioInputAdapter extends AbstractModuleAdapter<ModularAudioInputBox> implements ModuleAdapter {
    readonly #voltageOutput: ModuleConnectorAdapter<Pointers.VoltageConnection, Direction.Output>

    constructor(context: BoxAdaptersContext, box: ModularAudioInputBox) {
        super(context, box)

        this.#voltageOutput = ModuleConnectorAdapter.create(context.boxAdapters, box.output, Direction.Output, "Output")
    }

    get voltageOutput(): ModuleConnectorAdapter<Pointers.VoltageConnection, Direction.Output> {return this.#voltageOutput}

    get inputs(): ReadonlyArray<ModuleConnectorAdapter<Pointers.VoltageConnection, Direction.Input>> {
        return Arrays.empty()
    }
    get outputs(): ReadonlyArray<ModuleConnectorAdapter<Pointers.VoltageConnection, Direction.Output>> {
        return [this.#voltageOutput]
    }
}