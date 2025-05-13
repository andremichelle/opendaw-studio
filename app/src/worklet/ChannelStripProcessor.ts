import { AudioInput, Block, Processor } from "@/worklet/processing.ts"
import { int, Option, Terminable } from "std"
import { EngineContext } from "@/worklet/EngineContext.ts"
import { dbToGain, Event, Ramp, StereoMatrix } from "dsp"
import { AudioBuffer } from "@/worklet/AudioBuffer.ts"
import { AudioUnitBoxAdapter } from "@/audio-engine-shared/adapters/audio-unit/AudioUnitBoxAdapter.ts"
import { PeakBroadcaster } from "@/worklet/PeakBroadcaster.ts"
import { AudioProcessor } from "@/worklet/AudioProcessor.ts"
import { AutomatableParameter } from "@/worklet/AutomatableParameter.ts"
import { RenderQuantum } from "@/worklet/constants"

export class ChannelStripProcessor extends AudioProcessor implements Processor, AudioInput, Terminable {
	readonly #adapter: AudioUnitBoxAdapter

	readonly #audioOutput: AudioBuffer
	readonly #rawBuffer: StereoMatrix.Channels
	readonly #peaks: PeakBroadcaster

	readonly #parameterVolume: AutomatableParameter<number>
	readonly #parameterPanning: AutomatableParameter<number>
	readonly #parameterMute: AutomatableParameter<boolean>
	readonly #parameterSolo: AutomatableParameter<boolean>

	readonly #gainL: Ramp<number> = Ramp.linear(sampleRate)
	readonly #gainR: Ramp<number> = Ramp.linear(sampleRate)
	readonly #outGain: Ramp<number> = Ramp.linear(sampleRate)

	#source: Option<AudioBuffer> = Option.None

	#updateGain: boolean = true
	#processing: boolean = false

	constructor(context: EngineContext, adapter: AudioUnitBoxAdapter) {
		super(context)

		this.#adapter = adapter

		this.#audioOutput = new AudioBuffer()
		this.#rawBuffer = [new Float32Array(RenderQuantum), new Float32Array(RenderQuantum)]
		this.#peaks = this.own(new PeakBroadcaster(context.broadcaster, this.#adapter.address))

		this.#parameterVolume = this.own(this.bindParameter(this.#adapter.namedParameter.volume))
		this.#parameterPanning = this.own(this.bindParameter(this.#adapter.namedParameter.panning))
		this.#parameterMute = this.own(this.bindParameter(this.#adapter.namedParameter.mute))
		this.#parameterSolo = this.own(this.bindParameter(this.#adapter.namedParameter.solo))

		this.ownAll(
			context.registerProcessor(this),
			context.mixer.attachChannelStrip(this)
		)
		this.readAllParameters()
	}

	reset(): void {
		this.#peaks.clear()
		this.#audioOutput.clear()
		this.#rawBuffer[0].fill(0.0)
		this.#rawBuffer[1].fill(0.0)
		this.#processing = false
	}

	get isMute(): boolean {return this.#parameterMute.getValue()}
	get isSolo(): boolean {return this.#parameterSolo.getValue()}
	get adapter(): AudioUnitBoxAdapter {return this.#adapter}
	get audioOutput(): AudioBuffer {return this.#audioOutput}

	handleEvent(_event: Event): void {}

	processAudio(_block: Block, fromIndex: int, toIndex: int): void {
		if (this.#source.isEmpty()) {return}
		if (this.#updateGain) {
			const mixer = this.context.mixer
			mixer.updateSolo()
			const isSolo = this.isSolo || mixer.isVirtualSolo(this)
			const silent = this.isMute || (mixer.hasChannelSolo() && !isSolo && !this.#adapter.isOutput)
			const gain = dbToGain(this.#parameterVolume.getValue())
			const panning = this.#parameterPanning.getValue()
			this.#gainL.set((1.0 - Math.max(0.0, panning)) * gain, this.#processing)
			this.#gainR.set((1.0 + Math.min(0.0, panning)) * gain, this.#processing)
			this.#outGain.set(silent ? 0.0 : 1.0, this.#processing)
			this.#updateGain = false
		}
		const source = this.#source.unwrap()
		const [srcL, srcR] = source.channels()
		const [outL, outR] = this.#audioOutput.channels()
		const [rawL, rawR] = this.#rawBuffer
		if (this.#gainL.isInterpolating() || this.#gainR.isInterpolating() || this.#outGain.isInterpolating()) {
			for (let i = fromIndex; i < toIndex; i++) {
				const gain = this.#outGain.moveAndGet()
				const l = srcL[i] * this.#gainL.moveAndGet()
				const r = srcR[i] * this.#gainR.moveAndGet()
				outL[i] = l * gain
				outR[i] = r * gain
				rawL[i] = l
				rawR[i] = r
			}
		} else {
			const gainL = this.#gainL.get()
			const gainR = this.#gainR.get()
			const outGain = this.#outGain.get()
			for (let i = fromIndex; i < toIndex; i++) {
				const l = srcL[i] * gainL
				const r = srcR[i] * gainR
				rawL[i] = l
				rawR[i] = r
				outL[i] = l * outGain
				outR[i] = r * outGain
			}
		}
		this.#peaks.process(rawL, rawR, fromIndex, toIndex)
		this.#processing = true
	}

	finishProcess(): void {this.#audioOutput.assertSanity()}

	parameterChanged(parameter: AutomatableParameter): void {
		if (parameter === this.#parameterVolume) {
			this.requestGainUpdate()
		} else if (parameter === this.#parameterPanning) {
			this.requestGainUpdate()
		} else if (parameter === this.#parameterMute) {
			this.requestGainUpdate()
		} else if (parameter === this.#parameterSolo) {
			this.context.mixer.onChannelStripSoloChanged(this)
		}
	}

	requestGainUpdate(): void {this.#updateGain = true}

	// TODO Optimise me some day. Updating the solo like might be a bit cumbersome?
	requestSoloUpdate(): void {this.#updateGain = true}

	setAudioSource(source: AudioBuffer): Terminable {
		this.#source = Option.wrap(source)
		return { terminate: () => this.#source = Option.None }
	}

	toString(): string {return `{${this.constructor.name}}`}
}