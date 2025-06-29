import {AudioSample} from "@/audio/AudioSample"
import {AudioData} from "studio-shared"
import {AudioPeaks} from "@/audio/AudioPeaks"
import {AudioMetaData} from "@/audio/AudioMetaData"
import {AudioStorage} from "@/audio/AudioStorage"
import {Arrays, ProgressHandler, UUID} from "opendaw-std"
import {Promises} from "opendaw-runtime"
import {estimateBpm} from "opendaw-dsp"

export namespace AudioImporter {
    export type Creation = {
        uuid?: UUID.Format,
        name: string,
        arrayBuffer: ArrayBuffer,
        progressHandler: ProgressHandler
    }

    export const run = async (context: AudioContext,
                              {uuid, name, arrayBuffer, progressHandler}: Creation): Promise<AudioSample> => {
        uuid ??= await UUID.sha256(arrayBuffer) // Must run before decodeAudioData, because it will detach the ArrayBuffer
        const audioResult = await Promises.tryCatch(context.decodeAudioData(arrayBuffer))
        if (audioResult.status === "rejected") {return Promise.reject(name)}
        const {value: audioBuffer} = audioResult
        const audioData: AudioData = {
            sampleRate: audioBuffer.sampleRate,
            numberOfFrames: audioBuffer.length,
            numberOfChannels: audioBuffer.numberOfChannels,
            frames: Arrays.create(index => audioBuffer.getChannelData(index), audioBuffer.numberOfChannels)
        }
        const peaks = await AudioPeaks.generate(audioData, progressHandler)
        const meta: AudioMetaData = {
            bpm: estimateBpm(audioBuffer.duration),
            name: name.substring(0, name.lastIndexOf(".")),
            duration: audioBuffer.duration,
            sample_rate: audioBuffer.sampleRate
        }
        await AudioStorage.store(uuid, audioData, peaks, meta)
        return {uuid: UUID.toString(uuid), ...meta}
    }
}