import {Address, FieldKeys} from "box"
import {BoxAdaptersContext} from "@core/shared/BoxAdaptersContext.ts"
import {GrooveShuffleBox} from "@core/data/boxes"
import {int, StringMapping, UUID, ValueMapping} from "std"
import {ParameterAdapterSet} from "@core/shared/ParameterAdapterSet.ts"
import {AutomatableParameterFieldAdapter} from "@core/shared/AutomatableParameterFieldAdapter.ts"
import {GrooveAdapter} from "@core/shared/adapters/grooves/GrooveBoxAdapter.ts"
import {PPQN} from "dsp"

export class GrooveShuffleBoxAdapter implements GrooveAdapter {
    static readonly Durations: ReadonlyArray<[int, int]> = [
        [1, 8], [1, 4], [1, 4], [1, 2], [1, 1], [2, 1], [4, 1], [8, 1], [16, 1]
    ]

    static readonly DurationPPQNs: ReadonlyArray<int> =
        GrooveShuffleBoxAdapter.Durations.map(([n, d]) => PPQN.fromSignature(n, d))
    static readonly DurationStrings: ReadonlyArray<string> =
        GrooveShuffleBoxAdapter.Durations.map(([n, d]) => (`${n}/${d}`))

    readonly type = "groove-adapter"

    readonly #context: BoxAdaptersContext
    readonly #box: GrooveShuffleBox

    readonly #parametric: ParameterAdapterSet
    readonly namedParameter // let typescript infer the type

    constructor(context: BoxAdaptersContext, box: GrooveShuffleBox) {
        this.#context = context
        this.#box = box

        this.#parametric = new ParameterAdapterSet(this.#context)
        this.namedParameter = this.#wrapParameters(box)
    }

    get box(): GrooveShuffleBox {return this.#box}
    get uuid(): UUID.Format {return this.#box.address.uuid}
    get address(): Address {return this.#box.address}

    parameterAt(fieldIndices: FieldKeys): AutomatableParameterFieldAdapter {return this.#parametric.parameterAt(fieldIndices)}

    terminate(): void {this.#parametric.terminate()}

    #wrapParameters(box: GrooveShuffleBox) {
        return {
            duration: this.#parametric.createParameter(
                box.duration,
                ValueMapping.values(GrooveShuffleBoxAdapter.DurationPPQNs),
                StringMapping.values("", GrooveShuffleBoxAdapter.DurationPPQNs, GrooveShuffleBoxAdapter.DurationStrings),
                "duration"),
            amount: this.#parametric.createParameter(
                box.amount,
                ValueMapping.unipolar(),
                StringMapping.percent({fractionDigits: 0}), "amount")
        } as const
    }
}