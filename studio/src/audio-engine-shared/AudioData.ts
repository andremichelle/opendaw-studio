import {Arrays} from "std"

export type AudioData = {
    sampleRate: number
    numberOfFrames: number
    numberOfChannels: number
    frames: ReadonlyArray<Float32Array>
}

export namespace AudioData {
    export const from = (buffer: AudioBuffer): AudioData => ({
        sampleRate: buffer.sampleRate,
        numberOfFrames: buffer.length,
        numberOfChannels: buffer.numberOfChannels,
        frames: Arrays.create(index => buffer.getChannelData(index), buffer.numberOfChannels)
    })
}