import {int, Option, Terminable, UUID} from "lib-std"
import {AudioEffectDeviceBoxAdapter} from "studio-shared"
import {AudioEffectDeviceProcessor} from "../../processors.ts"
import {EngineContext} from "../../EngineContext.ts"
import {ProcessInfo, Processor} from "../../processing.ts"
import {RenderQuantum} from "../../constants.ts"
import {AbstractProcessor} from "../../AbstractProcessor.ts"
import {AudioBuffer} from "../../AudioBuffer.ts"
import {PeakBroadcaster} from "../../PeakBroadcaster.ts"
import {AutomatableParameter} from "../../AutomatableParameter.ts"

export class NopDeviceProcessor extends AbstractProcessor implements AudioEffectDeviceProcessor {
    static ID: int = 0 | 0

    readonly #id: int = NopDeviceProcessor.ID++

    readonly #adapter: AudioEffectDeviceBoxAdapter
    readonly #output: AudioBuffer
    readonly #peaks: PeakBroadcaster

    #source: Option<AudioBuffer> = Option.None

    constructor(context: EngineContext, adapter: AudioEffectDeviceBoxAdapter) {
        super(context)

        this.#adapter = adapter
        this.#output = new AudioBuffer()
        this.#peaks = this.own(new PeakBroadcaster(context.broadcaster, adapter.address))

        this.own(context.registerProcessor(this))
    }

    get incoming(): Processor {return this}
    get outgoing(): Processor {return this}

    reset(): void {
        this.#peaks.clear()
        this.#output.clear()
        this.eventInput.clear()
    }

    get uuid(): UUID.Format {return this.#adapter.uuid}

    get audioOutput(): AudioBuffer {return this.#output}

    setAudioSource(source: AudioBuffer): Terminable {
        this.#source = Option.wrap(source)
        return {terminate: () => this.#source = Option.None}
    }

    index(): int {return this.#adapter.indexField.getValue()}
    adapter(): AudioEffectDeviceBoxAdapter {return this.#adapter}

    process(_processInfo: ProcessInfo): void {
        if (this.#source.isEmpty()) {return}
        const input = this.#source.unwrap()
        const [inpL, inpR] = input.channels()
        const [outL, outR] = this.#output.channels()
        for (let i = 0; i < RenderQuantum; i++) {
            outL[i] = inpL[i]
            outR[i] = inpR[i]
        }
        this.#peaks.process(outL, outR)
    }

    parameterChanged(_parameter: AutomatableParameter): void {}

    toString(): string {return `{${this.constructor.name} (${this.#id})`}
}