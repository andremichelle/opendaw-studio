import {ModuleMultiplierBox} from "@core/data/boxes"
import {Pointers} from "@core/data/pointers.ts"
import {ModuleAdapter} from "@core/shared/adapters/modular/module.ts"
import {Direction, ModuleConnectorAdapter} from "@core/shared/adapters/modular/connector.ts"
import {AbstractModuleAdapter} from "../abstract.ts"

import {BoxAdaptersContext} from "@core/shared/BoxAdaptersContext.ts"

export class ModuleMultiplierAdapter extends AbstractModuleAdapter<ModuleMultiplierBox> implements ModuleAdapter {
    readonly #voltageInputX: ModuleConnectorAdapter<Pointers.VoltageConnection, Direction.Input>
    readonly #voltageInputY: ModuleConnectorAdapter<Pointers.VoltageConnection, Direction.Input>
    readonly #voltageOutput: ModuleConnectorAdapter<Pointers.VoltageConnection, Direction.Output>

    constructor(context: BoxAdaptersContext, box: ModuleMultiplierBox) {
        super(context, box)

        this.#voltageInputX = ModuleConnectorAdapter.create(context.boxAdapters, box.voltageInputX, Direction.Input, "X")
        this.#voltageInputY = ModuleConnectorAdapter.create(context.boxAdapters, box.voltageInputY, Direction.Input, "Y")
        this.#voltageOutput = ModuleConnectorAdapter.create(context.boxAdapters, box.voltageOutput, Direction.Output, "Result")
    }

    get inputs(): ReadonlyArray<ModuleConnectorAdapter<Pointers.VoltageConnection, Direction.Input>> {
        return [this.#voltageInputX, this.#voltageInputY]
    }
    get outputs(): ReadonlyArray<ModuleConnectorAdapter<Pointers.VoltageConnection, Direction.Output>> {
        return [this.#voltageOutput]
    }
}