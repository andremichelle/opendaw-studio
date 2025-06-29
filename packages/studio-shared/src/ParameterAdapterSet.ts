import {FieldKeys, PointerTypes, PrimitiveField, PrimitiveValues} from "lib-box"
import {assert, NumberArrayComparator, SortedSet, StringMapping, Terminable, unitValue, ValueMapping} from "lib-std"
import {AutomatableParameterFieldAdapter} from "./AutomatableParameterFieldAdapter"

import {BoxAdaptersContext} from "./BoxAdaptersContext"

export class ParameterAdapterSet implements Terminable {
    readonly #context: BoxAdaptersContext
    readonly #parameters: SortedSet<FieldKeys, AutomatableParameterFieldAdapter>

    constructor(context: BoxAdaptersContext) {
        this.#context = context
        this.#parameters = new SortedSet(adapter => adapter.address.fieldKeys, NumberArrayComparator)
    }

    terminate(): void {
        this.#parameters.forEach(parameter => parameter.terminate())
        this.#parameters.clear()
    }

    parameters(): ReadonlyArray<AutomatableParameterFieldAdapter> {return this.#parameters.values()}
    parameterAt(fieldIndices: FieldKeys): AutomatableParameterFieldAdapter {
        return this.#parameters.getOrThrow(fieldIndices,
            () => new Error(`No ParameterAdapter found at [${fieldIndices}]`))
    }

    createParameter<T extends PrimitiveValues>(
        field: PrimitiveField<T, PointerTypes>,
        valueMapping: ValueMapping<T>,
        stringMapping: StringMapping<T>,
        name: string,
        anchor?: unitValue): AutomatableParameterFieldAdapter<T> {
        const adapter = new AutomatableParameterFieldAdapter<T>(this.#context, field, valueMapping, stringMapping, name, anchor)
        const added = this.#parameters.add(adapter)
        assert(added, `Could not add adapter for ${field}`)
        return adapter
    }

    removeParameter<T extends PrimitiveValues>(parameter: AutomatableParameterFieldAdapter<T>): void {
        this.#parameters.removeByValue(parameter)
    }
}