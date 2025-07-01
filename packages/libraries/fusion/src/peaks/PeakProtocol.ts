import {FloatArray, int, Procedure} from "lib-std"

export interface PeakProtocol {
    generateAsync(progress: Procedure<number>,
                  shifts: Uint8Array,
                  frames: ReadonlyArray<FloatArray>,
                  numFrames: int,
                  numChannels: int): Promise<ArrayBufferLike>
}