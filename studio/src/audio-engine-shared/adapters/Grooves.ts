import {AutomatableParameter} from "@/worklet/AutomatableParameter.ts"
import {GrooveShuffleBoxAdapter} from "@/audio-engine-shared/adapters/grooves/GrooveShuffleBoxAdapter.ts"
import {AbstractProcessor} from "@/worklet/AbstractProcessor.ts"
import {Groove, GroovePattern, GroovePatternFunction, PPQN, ppqn} from "dsp"
import {asDefined, moebiusEase, squashUnit, Terminable, Terminator} from "std"
import {BoxVisitor, GrooveShuffleBox} from "@/data/boxes"
import {BoxAdapters} from "@/audio-engine-shared/BoxAdapters.ts"
import {Box} from "box"

export interface GrooveEngineAdapter extends Terminable {
    groove(): Groove
    parameterChanged(parameter: AutomatableParameter): void
}

export namespace GrooveEngineAdapter {
    export const create = (boxAdapters: BoxAdapters,
                           processor: AbstractProcessor,
                           box: Box): GrooveEngineAdapter => asDefined(box.accept<BoxVisitor<GrooveEngineAdapter>>({
        visitGrooveShuffleBox: (box: GrooveShuffleBox): GrooveEngineAdapter =>
            new GrooveShuffleEngineAdapter(processor, boxAdapters.adapterFor(box, GrooveShuffleBoxAdapter))
    }), `Could not find groove engine adapter for ${box.name}`)
}

class GrooveShuffleEngineAdapter implements GrooveEngineAdapter {
    readonly #terminator = new Terminator()
    readonly #amountParameter: AutomatableParameter<number>
    readonly #durationParameter: AutomatableParameter<number>

    readonly #groove: GroovePattern = new GroovePattern({
        duration: (): ppqn => this.#duration,
        fx: x => moebiusEase(x, this.#amount),
        fy: y => moebiusEase(y, 1.0 - this.#amount)
    } satisfies GroovePatternFunction)

    #amount: number = 0.0
    #duration: ppqn = PPQN.SemiQuaver * 2

    constructor(processor: AbstractProcessor, boxAdapter: GrooveShuffleBoxAdapter) {
        this.#amountParameter = this.#terminator.own(processor.bindParameter(boxAdapter.namedParameter.amount))
        this.#durationParameter = this.#terminator.own(processor.bindParameter(boxAdapter.namedParameter.duration))
    }

    groove(): Groove {return this.#groove}

    parameterChanged(parameter: AutomatableParameter): void {
        if (parameter === this.#amountParameter) {
            this.#amount = squashUnit(this.#amountParameter.getValue(), 0.01)
        } else if (parameter === this.#durationParameter) {
            this.#duration = this.#durationParameter.getValue()
        }
    }

    terminate(): void {this.#terminator.terminate()}
}
