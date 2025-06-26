export type AudioData = {
    sampleRate: number
    numberOfFrames: number
    numberOfChannels: number
    frames: ReadonlyArray<Float32Array>
}