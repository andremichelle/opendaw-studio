import { ProcessInfo, Processor } from "@/worklet/processing.ts"
import { Arrays, int, Option, Terminable, UUID } from "std"
import { EngineContext } from "@/worklet/EngineContext.ts"
import { AudioBusBoxAdapter } from "@/audio-engine-shared/adapters/audio-unit/AudioBusBoxAdapter.ts"
import { RenderQuantum } from "@/worklet/constants.ts"
import { AbstractProcessor } from "@/worklet/AbstractProcessor.ts"
import { AudioBuffer } from "@/worklet/AudioBuffer.ts"
import { PeakBroadcaster } from "@/worklet/PeakBroadcaster.ts"
import { AutomatableParameter } from "@/worklet/AutomatableParameter.ts"
import { DeviceProcessor, InstrumentDeviceProcessor } from "@/worklet/processors"
import { NoteEventTarget } from "@/worklet/NoteEventSource"

export class AudioBusProcessor extends AbstractProcessor implements InstrumentDeviceProcessor, Terminable {
	static ID: int = 0 | 0

	readonly #id: int = AudioBusProcessor.ID++

	readonly #adapter: AudioBusBoxAdapter

	readonly #audioOutput: AudioBuffer
	readonly #peaks: PeakBroadcaster
	readonly #sources: Array<AudioBuffer>

	constructor(context: EngineContext, adapter: AudioBusBoxAdapter) {
		super(context)

		this.#adapter = adapter

		this.#audioOutput = new AudioBuffer()
		this.#peaks = this.own(new PeakBroadcaster(context.broadcaster, adapter.address))
		this.#sources = []

		this.own(context.registerProcessor(this))
	}

	get noteEventTarget(): Option<NoteEventTarget & DeviceProcessor> {return Option.None}

	get incoming(): Processor {return this}
	get outgoing(): Processor {return this}
	get uuid(): UUID.Format {return this.#adapter.uuid}

	reset(): void {
		this.#peaks.clear()
		this.#audioOutput.clear()
	}

	addAudioSource(output: AudioBuffer): Terminable {
		this.#sources.push(output)
		return {
			terminate: () => {
				Arrays.remove(this.#sources, output)
				this.#audioOutput.clear()
			}
		}
	}

	get adapter(): AudioBusBoxAdapter {return this.#adapter}
	get audioOutput(): AudioBuffer {return this.#audioOutput}

	process(_processInfo: ProcessInfo): void {
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
		this.#peaks.process(this.#audioOutput.getChannel(0), this.#audioOutput.getChannel(1))
	}

	parameterChanged(_parameter: AutomatableParameter): void {}

	toString(): string {
		return `{${this.constructor.name} (${this.#id})}`
	}
}