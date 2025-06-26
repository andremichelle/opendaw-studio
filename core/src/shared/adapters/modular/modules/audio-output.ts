import {ModularAudioOutputBox} from "@core/data/boxes"
import {Pointers} from "@core/data/pointers.ts"
import {ModuleAdapter} from "@core/shared/adapters/modular/module.ts"
import {Direction, ModuleConnectorAdapter} from "@core/shared/adapters/modular/connector.ts"
import {AbstractModuleAdapter} from "../abstract.ts"
import {Arrays} from "std"

import {BoxAdaptersContext} from "@core/shared/BoxAdaptersContext.ts"

export class ModularAudioOutputAdapter extends AbstractModuleAdapter<ModularAudioOutputBox> implements ModuleAdapter {
    readonly #voltageInput: ModuleConnectorAdapter<Pointers.VoltageConnection, Direction.Input>

    constructor(context: BoxAdaptersContext, box: ModularAudioOutputBox) {
        super(context, box)

        this.#voltageInput = ModuleConnectorAdapter.create(context.boxAdapters, box.input, Direction.Input, "Input")
    }

    get voltageInput(): ModuleConnectorAdapter<Pointers.VoltageConnection, Direction.Input> {return this.#voltageInput}

    get inputs(): ReadonlyArray<ModuleConnectorAdapter<Pointers.VoltageConnection, Direction.Input>> {
        return [this.#voltageInput]
    }
    get outputs(): ReadonlyArray<ModuleConnectorAdapter<Pointers.VoltageConnection, Direction.Output>> {
        return Arrays.empty()
    }
}