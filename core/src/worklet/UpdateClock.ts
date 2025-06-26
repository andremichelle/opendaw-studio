import {BlockFlag, ProcessInfo} from "./processing.ts"
import {Event} from "dsp"
import {EngineContext} from "@core/worklet/EngineContext.ts"
import {Arrays, Bits, int, Terminable} from "std"
import {AbstractProcessor} from "@core/worklet/AbstractProcessor.ts"
import {EventBuffer} from "@core/worklet/EventBuffer.ts"
import {Fragmentor} from "@core/worklet/Fragmentor.ts"
import {UpdateClockRate} from "@core/shared/UpdateClockRate.ts"

export interface UpdateEvent extends Event {type: "update-event"}

export namespace UpdateEvent {
    export const isOfType = (event: Event): event is UpdateEvent => event.type === "update-event"
}

export class UpdateClock extends AbstractProcessor {
    readonly #outputs: Array<EventBuffer> = []

    constructor(context: EngineContext) {
        super(context)

        this.own(this.context.registerProcessor(this))
    }

    reset(): void {this.eventInput.clear()}

    addEventOutput(output: EventBuffer): Terminable {
        this.#outputs.push(output)
        return {terminate: () => Arrays.remove(this.#outputs, output)}
    }

    process({blocks}: ProcessInfo): void {
        blocks.forEach(({p0, p1, flags}, index: int) => {
            if (!Bits.every(flags, BlockFlag.transporting)) {return}
            for (const position of Fragmentor.iterate(p0, p1, UpdateClockRate)) {
                const event: UpdateEvent = {type: "update-event", position}
                this.#outputs.forEach(output => output.add(index, event))
            }
        })
    }

    toString(): string {return `{${this.constructor.name}}`}
}