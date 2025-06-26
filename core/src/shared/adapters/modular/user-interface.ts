import {DeviceInterfaceKnobBox} from "@core/data/boxes"
import {ModuleAdapter, Modules} from "@core/shared/adapters/modular/module.ts"
import {AutomatableParameterFieldAdapter} from "@core/shared/AutomatableParameterFieldAdapter.ts"
import {Address, Box, PointerTypes, PrimitiveField} from "box"
import {BoxAdaptersContext} from "@core/shared/BoxAdaptersContext.ts"
import {BoxAdapter} from "@core/shared/BoxAdapter.ts"

export interface DeviceInterfaceElementAdapter extends BoxAdapter {
    get moduleAdapter(): ModuleAdapter
    get parameterAdapter(): AutomatableParameterFieldAdapter
}

export class DeviceInterfaceKnobAdapter implements DeviceInterfaceElementAdapter {
    readonly #context: BoxAdaptersContext
    readonly #box: DeviceInterfaceKnobBox

    constructor(context: BoxAdaptersContext, box: DeviceInterfaceKnobBox) {
        this.#context = context
        this.#box = box
    }

    get box(): Box<PointerTypes, any> {return this.#box}
    get uuid(): Readonly<Uint8Array> {return this.#box.address.uuid}
    get address(): Address {return this.#box.address}

    get moduleAdapter(): ModuleAdapter {
        return Modules.adapterFor(this.#context.boxAdapters, this.#parameterTarget.box)
    }

    get parameterAdapter(): AutomatableParameterFieldAdapter {
        return this.moduleAdapter.parameters.parameterAt(this.#parameterTarget.address.fieldKeys)
    }

    get #parameterTarget(): PrimitiveField {
        return this.#box.parameter.targetVertex.unwrap("Parameter not assigned") as PrimitiveField
    }

    terminate(): void {
    }
}