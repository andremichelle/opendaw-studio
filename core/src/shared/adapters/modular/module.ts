import {BoxAdapters} from "@core/shared/BoxAdapters.ts"
import {Box, Vertex} from "box"
import {ModuleAttributes} from "@core/data/boxes/ModuleAttributes.ts"
import {
    BoxVisitor,
    ModularAudioInputBox,
    ModularAudioOutputBox,
    ModuleDelayBox,
    ModuleGainBox,
    ModuleMultiplierBox
} from "@core/data/boxes"
import {asDefined, Selectable} from "std"
import {ModuleMultiplierAdapter} from "@core/shared/adapters/modular/modules/multiplier.ts"
import {ModuleDelayAdapter} from "./modules/delay.ts"
import {Direction, ModuleConnectorAdapter} from "@core/shared/adapters/modular/connector.ts"
import {Pointers} from "@core/data/pointers.ts"
import {ModularAudioInputAdapter} from "@core/shared/adapters/modular/modules/audio-input.ts"
import {ModularAudioOutputAdapter} from "./modules/audio-output.ts"
import {ParameterAdapterSet} from "@core/shared/ParameterAdapterSet.ts"
import {ModularAdapter} from "@core/shared/adapters/modular/modular.ts"
import {ModuleGainAdapter} from "./modules/gain.ts"
import {BoxAdapter} from "@core/shared/BoxAdapter.ts"

export interface ModuleAdapter extends BoxAdapter, Selectable {
    get attributes(): ModuleAttributes
    get parameters(): ParameterAdapterSet
    get modular(): ModularAdapter
    get inputs(): ReadonlyArray<ModuleConnectorAdapter<Pointers.VoltageConnection, Direction.Input>>
    get outputs(): ReadonlyArray<ModuleConnectorAdapter<Pointers.VoltageConnection, Direction.Output>>
}

export namespace Modules {
    export const isVertexOfModule = (vertex: Vertex): boolean => vertex.box.accept<BoxVisitor<true>>({
        visitModuleGainBox: (): true => true,
        visitModuleDelayBox: (): true => true,
        visitModuleMultiplierBox: (): true => true,
        visitModularAudioInputBox: (): true => true,
        visitModularAudioOutputBox: (): true => true
    }) ?? false

    export const adapterFor = (adapters: BoxAdapters, box: Box): ModuleAdapter => asDefined(box.accept<BoxVisitor<ModuleAdapter>>({
        visitModuleGainBox: (box: ModuleGainBox): ModuleAdapter => adapters.adapterFor(box, ModuleGainAdapter),
        visitModuleDelayBox: (box: ModuleDelayBox): ModuleAdapter => adapters.adapterFor(box, ModuleDelayAdapter),
        visitModuleMultiplierBox: (box: ModuleMultiplierBox): ModuleAdapter => adapters.adapterFor(box, ModuleMultiplierAdapter),
        visitModularAudioInputBox: (box: ModularAudioInputBox): ModuleAdapter => adapters.adapterFor(box, ModularAudioInputAdapter),
        visitModularAudioOutputBox: (box: ModularAudioOutputBox): ModuleAdapter => adapters.adapterFor(box, ModularAudioOutputAdapter)
    }), `Could not find ModuleAdapter for ${box.name}`)
}
