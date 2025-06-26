import {Pointers} from "@core/data/pointers.ts"
import {Address, Field} from "box"
import {ModuleConnectionAdapter} from "@/audio-engine-shared/adapters/modular/connection.ts"
import {Arrays} from "std"
import {BoxAdapters} from "@/audio-engine-shared/BoxAdapters.ts"

export const enum Direction {Input = "input", Output = "output"}

export class ModuleConnectorAdapter<CONNECTION_TYPE extends Pointers, Direction> {
    static create<CONNECTION_TYPE extends Pointers, Direction>(
        boxAdapters: BoxAdapters,
        field: Field<CONNECTION_TYPE>,
        direction: Direction,
        name?: string): ModuleConnectorAdapter<CONNECTION_TYPE, Direction> {
        return new ModuleConnectorAdapter<CONNECTION_TYPE, Direction>(boxAdapters, field, direction, name ?? field.fieldName)
    }

    readonly #boxAdapters: BoxAdapters
    readonly #field: Field<CONNECTION_TYPE>
    readonly #direction: Direction
    readonly #name: string

    private constructor(boxAdapters: BoxAdapters, field: Field<CONNECTION_TYPE>, direction: Direction, name: string) {
        this.#boxAdapters = boxAdapters
        this.#field = field
        this.#direction = direction
        this.#name = name
    }

    matches(other: ModuleConnectorAdapter<any, any>): boolean {
        return this.direction !== other.direction && this.field.pointerRules.accepts
            .some(accepts => other.field.pointerRules.accepts
                .some(type => type === accepts))
    }

    get connections(): ReadonlyArray<ModuleConnectionAdapter> {
        if (this.#field.pointerHub.isEmpty()) {return Arrays.empty() }
        return this.#field.pointerHub.filter(Pointers.VoltageConnection)
            .map(({box}) => this.#boxAdapters.adapterFor(box, ModuleConnectionAdapter))
    }
    get field(): Field<CONNECTION_TYPE> {return this.#field}
    get address(): Address {return this.#field.address}
    get direction(): Direction {return this.#direction}
    get name(): string {return this.#name}

    toString(): string {
        return `{ModuleConnectorAdapter address: ${this.#field.address.toString()}, direction: ${this.#direction}}`
    }
}