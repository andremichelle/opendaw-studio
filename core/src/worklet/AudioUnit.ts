import {AudioUnitBoxAdapter} from "@core/shared/adapters/audio-unit/AudioUnitBoxAdapter.ts"
import {EngineContext} from "@core/worklet/EngineContext.ts"
import {InstrumentDeviceProcessor} from "@core/worklet/processors.ts"
import {asInstanceOf, int, Option, Terminable, Terminator} from "std"
import {InstrumentDeviceProcessorFactory} from "@core/worklet/DeviceProcessorFactory.ts"
import {AudioBusProcessor} from "@core/worklet/AudioBusProcessor.ts"
import {AudioBuffer} from "@core/worklet/AudioBuffer.ts"
import {AudioDeviceChain} from "@core/worklet/AudioDeviceChain.ts"
import {MidiDeviceChain} from "./MidiDeviceChain.ts"
import {AudioUnitOptions} from "@core/worklet/AudioUnitOptions.ts"
import {AudioUnitInputAdapter} from "@core/shared/adapters/audio-unit/AudioUnitInputAdapter.ts"

export class AudioUnit implements Terminable {
    static ID: int = 0 | 0

    readonly #id: int = AudioUnit.ID++

    readonly #terminator = new Terminator()

    readonly #context: EngineContext
    readonly #adapter: AudioUnitBoxAdapter

    readonly #midiDeviceChain: MidiDeviceChain
    readonly #audioDeviceChain: AudioDeviceChain

    #input: Option<InstrumentDeviceProcessor | AudioBusProcessor> = Option.None

    constructor(context: EngineContext, adapter: AudioUnitBoxAdapter, options: AudioUnitOptions) {
        this.#context = context
        this.#adapter = adapter

        this.#midiDeviceChain = this.#terminator.own(new MidiDeviceChain(this))
        this.#audioDeviceChain = this.#terminator.own(new AudioDeviceChain(this, options))

        this.#terminator.ownAll(
            this.#adapter.input.catchupAndSubscribe(owner => {
                this.#midiDeviceChain.invalidateWiring()
                this.#audioDeviceChain.invalidateWiring()
                this.#input.ifSome(input => input.terminate())
                this.#input = owner.getValue().flatMap((input: AudioUnitInputAdapter) =>
                    Option.wrap(InstrumentDeviceProcessorFactory.create(context, input.box.box)))
            })
        )
    }

    input(): Option<InstrumentDeviceProcessor | AudioBusProcessor> {return this.#input}
    inputAsAudioBus(): AudioBusProcessor {return asInstanceOf(this.#input.unwrap("No input available"), AudioBusProcessor)}
    audioOutput(): AudioBuffer {return this.#audioDeviceChain.channelStrip.audioOutput}

    get midiDeviceChain(): MidiDeviceChain {return this.#midiDeviceChain}
    get audioDeviceChain(): AudioDeviceChain {return this.#audioDeviceChain}
    get context(): EngineContext {return this.#context}
    get adapter(): AudioUnitBoxAdapter {return this.#adapter}

    terminate(): void {
        console.debug(`terminate ${this}`)
        this.#terminator.terminate()
        this.#input.ifSome(input => input.terminate())
        this.#input = Option.None
    }

    toString(): string {return `{${this.constructor.name}(${this.#id})}`}
}