import {Arrays, Terminable, UUID} from "lib-std"
import {AudioProcessor} from "../../../AudioProcessor"
import {AudioDeviceProcessor} from "../../../processors"
import {AudioGenerator, Processor} from "../../../processing"
import {AudioBuffer} from "../../../AudioBuffer"
import {PeakBroadcaster} from "../../../PeakBroadcaster"
import {EventBuffer} from "../../../EventBuffer"
import {EngineContext} from "../../../EngineContext"
import {RenderQuantum} from "../../../constants"
import {PlayfieldDeviceProcessor} from "../PlayfieldDeviceProcessor"

export class MixProcessor extends AudioProcessor implements AudioDeviceProcessor, Processor, AudioGenerator {
    readonly #device: PlayfieldDeviceProcessor

    readonly #audioOutput: AudioBuffer
    readonly #peaksBroadcaster: PeakBroadcaster
    readonly #sources: Array<AudioBuffer>
    readonly #eventBuffer: EventBuffer

    constructor(context: EngineContext, device: PlayfieldDeviceProcessor) {
        super(context)

        this.#device = device

        this.#audioOutput = new AudioBuffer()
        this.#peaksBroadcaster = this.own(new PeakBroadcaster(context.broadcaster, device.adapter.address))
        this.#sources = []
        this.#eventBuffer = new EventBuffer()

        this.own(context.registerProcessor(this))
        this.readAllParameters()
    }

    get uuid(): UUID.Format {return this.#device.uuid}
    get incoming(): Processor {return this}
    get outgoing(): Processor {return this}

    setAudioSource(source: AudioBuffer): Terminable {
        this.#sources.push(source)
        return {
            terminate: () => {
                Arrays.remove(this.#sources, source)
                this.#audioOutput.clear()
            }
        }
    }

    get audioOutput(): AudioBuffer {return this.#audioOutput}
    get eventInput(): EventBuffer {return this.#eventBuffer}

    processAudio(_block: Readonly<{}>, _fromIndex: number, _toIndex: number): void {}

    reset(): void {this.#peaksBroadcaster.clear()}

    finishProcess(): void {
        this.#audioOutput.clear()
        const [outL, outR] = this.#audioOutput.channels()
        for (const source of this.#sources) {
            const [srcL, srcR] = source.channels()
            for (let i = 0; i < RenderQuantum; i++) {
                outL[i] += srcL[i]
                outR[i] += srcR[i]
            }
        }
        this.#audioOutput.assertSanity()
        this.#peaksBroadcaster.process(this.#audioOutput.getChannel(0), this.#audioOutput.getChannel(1))
    }

    toString(): string {return "{PlayfieldMixProcessor}"}
}