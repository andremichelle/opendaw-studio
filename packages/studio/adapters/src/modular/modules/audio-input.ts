import {ModularAudioInputBox} from "studio-boxes"
import {Pointers} from "studio-enums"
import {Arrays} from "lib-std"
import {AbstractModuleAdapter} from "../abstract"
import {ModuleAdapter} from "../module"
import {Direction, ModuleConnectorAdapter} from "../connector"
import {BoxAdaptersContext} from "../../BoxAdaptersContext"

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