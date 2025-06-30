import {WorkletFactory} from "@/audio-engine/WorkletFactory"
import WorkletUrl from "studio-worklet/RecordingProcessor.ts?worker&url"
import {mergeChunkPlanes, RingBuffer} from "studio-adapters"
import {encodeWavFloat} from "@/wav"
import {EmptyExec, int} from "lib-std"
import {Files} from "lib-dom"

const RenderQuantum = 128

export class RecordingWorklet extends AudioWorkletNode {
    static async bootFactory(context: BaseAudioContext): Promise<WorkletFactory<RecordingWorklet>> {
        return WorkletFactory.boot(context, WorkletUrl)
    }

    static create(factory: WorkletFactory<RecordingWorklet>, numChannels: int, numChunks: int = 64): RecordingWorklet {
        const audioBytes = numChannels * numChunks * RenderQuantum * Float32Array.BYTES_PER_ELEMENT
        const pointerBytes = Int32Array.BYTES_PER_ELEMENT * 2
        const sab = new SharedArrayBuffer(audioBytes + pointerBytes)
        const buffer: RingBuffer.Config = {sab, numChunks, numChannels, bufferSize: RenderQuantum}
        return factory.create(context => new RecordingWorklet(context, buffer))
    }

    readonly #reader: RingBuffer.Reader

    private constructor(context: BaseAudioContext, config: RingBuffer.Config) {
        super(context, "recording-processor", {
            numberOfInputs: 1,
            channelCount: config.numChannels,
            channelCountMode: "explicit",
            processorOptions: config
        })
        const sampleRate = this.context.sampleRate
        const output: Array<Array<Float32Array>> = []
        const seconds = 3.1452
        const numFrames = Math.ceil(sampleRate * seconds)
        console.debug(`numFrames: ${numFrames}`)
        this.#reader = RingBuffer.reader(config, array => {
            output.push(array)
            if (output.length * RenderQuantum >= numFrames) {
                this.#reader.stop()
                const channels = mergeChunkPlanes(output, numFrames)
                const wav = encodeWavFloat({channels, numFrames, sampleRate})
                Files.save(wav, {suggestedName: "recording.wav"})
                    .then(() => console.debug("WAV saved"), EmptyExec)
            }
        })
    }
}