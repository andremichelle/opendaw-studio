import { RingBuffer } from "@/RingBuffer"
import { RecordingProcessorOptions } from "@/audio-engine-shared/RecordingProcessorOptions"

registerProcessor("recording-processor", class extends AudioWorkletProcessor {
	readonly #writer: RingBuffer.Writer

	constructor({ processorOptions: config }: { processorOptions: RecordingProcessorOptions } & AudioNodeOptions) {
		super()

		this.#writer = RingBuffer.writer(config)
	}

	process(inputs: ReadonlyArray<ReadonlyArray<Float32Array>>): boolean {
		this.#writer.write(inputs[0])
		return true
	}
})