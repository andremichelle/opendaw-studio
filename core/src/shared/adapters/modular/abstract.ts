import {Address, Box, PointerTypes} from "box"
import {ModuleAttributes} from "@core/data/boxes/ModuleAttributes.ts"
import {Terminable, Terminator} from "std"
import {Direction, ModuleConnectorAdapter} from "@core/shared/adapters/modular/connector.ts"
import {Pointers} from "@core/data/pointers.ts"
import {ModuleAdapter} from "@core/shared/adapters/modular/module.ts"
import {ParameterAdapterSet} from "@core/shared/ParameterAdapterSet.ts"
import {ModularAdapter} from "@core/shared/adapters/modular/modular.ts"
import {BoxAdaptersContext} from "@core/shared/BoxAdaptersContext.ts"

export abstract class AbstractModuleAdapter<BOX extends Box & {
    attributes: ModuleAttributes
}> implements ModuleAdapter {
    readonly #context: BoxAdaptersContext
    readonly #box: BOX

    readonly #terminator: Terminator
    readonly #attributes: ModuleAttributes
    readonly #parameters: ParameterAdapterSet

    #selected: boolean = false

    protected constructor(context: BoxAdaptersContext, box: BOX) {
        this.#context = context
        this.#box = box

        this.#terminator = new Terminator()
        this.#attributes = box.attributes
        this.#parameters = this.#terminator.own(new ParameterAdapterSet(context))
    }

    get inputs(): ReadonlyArray<ModuleConnectorAdapter<Pointers.VoltageConnection, Direction.Input>> {
        throw new Error("Method not implemented.")
    }
    get outputs(): ReadonlyArray<ModuleConnectorAdapter<Pointers.VoltageConnection, Direction.Output>> {
        throw new Error("Method not implemented.")
    }

    own<T extends Terminable>(terminable: T): T {return this.#terminator.own(terminable)}
    ownAll<T extends Terminable>(...terminables: ReadonlyArray<T>) {this.#terminator.ownAll(...terminables)}

    onSelected(): void {this.#selected = true}
    onDeselected(): void {this.#selected = false}
    isSelected(): boolean {return this.#selected}

    get box(): Box<PointerTypes, any> {return this.#box}
    get attributes(): ModuleAttributes {return this.#attributes}
    get uuid(): Readonly<Uint8Array> {return this.#box.address.uuid}
    get address(): Address {return this.#box.address}
    get parameters(): ParameterAdapterSet {return this.#parameters}
    get modular(): ModularAdapter {
        return this.#context.boxAdapters
            .adapterFor(this.#box.attributes.collection.targetVertex.unwrap().box, ModularAdapter)
    }

    terminate(): void {this.#terminator.terminate()}
}