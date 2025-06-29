import {FloatArray, int, Procedure} from "opendaw-std"

export interface PeakProtocol {
    generateAsync(progress: Procedure<number>,
                  shifts: Uint8Array,
                  frames: ReadonlyArray<FloatArray>,
                  numFrames: int,
                  numChannels: int): Promise<ArrayBufferLike>
}