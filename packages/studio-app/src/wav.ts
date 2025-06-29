import {Arrays} from "lib-std"

export const encodeWavFloat = (audio: {
    channels: ReadonlyArray<Float32Array>,
    sampleRate: number,
    numFrames: number
} | AudioBuffer): ArrayBuffer => {
    const MAGIC_RIFF = 0x46464952
    const MAGIC_WAVE = 0x45564157
    const MAGIC_FMT = 0x20746d66
    const MAGIC_DATA = 0x61746164
    const bytesPerChannel = Float32Array.BYTES_PER_ELEMENT
    const sampleRate = audio.sampleRate
    let numFrames: number
    let numberOfChannels: number
    let channels: ReadonlyArray<Float32Array>
    if (audio instanceof AudioBuffer) {
        channels = Arrays.create(index => audio.getChannelData(index), audio.numberOfChannels)
        numFrames = audio.length
        numberOfChannels = audio.numberOfChannels
    } else {
        channels = audio.channels
        numFrames = audio.numFrames
        numberOfChannels = audio.channels.length
    }
    const size = 44 + numFrames * numberOfChannels * bytesPerChannel
    const buf = new ArrayBuffer(size)
    const view = new DataView(buf)
    view.setUint32(0, MAGIC_RIFF, true)
    view.setUint32(4, size - 8, true)
    view.setUint32(8, MAGIC_WAVE, true)
    view.setUint32(12, MAGIC_FMT, true)
    view.setUint32(16, 16, true) // chunk length
    view.setUint16(20, 3, true) // compression
    view.setUint16(22, numberOfChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * numberOfChannels * bytesPerChannel, true)
    view.setUint16(32, numberOfChannels * bytesPerChannel, true)
    view.setUint16(34, 8 * bytesPerChannel, true)
    view.setUint32(36, MAGIC_DATA, true)
    view.setUint32(40, numberOfChannels * numFrames * bytesPerChannel, true)
    let w = 44
    for (let i = 0; i < numFrames; ++i) {
        for (let j = 0; j < numberOfChannels; ++j) {
            view.setFloat32(w, channels[j][i], true)
            w += bytesPerChannel
        }
    }
    return view.buffer
}