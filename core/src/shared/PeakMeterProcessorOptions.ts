import {int} from "std"

export interface PeakMeterProcessorOptions {
    sab: SharedArrayBuffer
    numberOfChannels: int
    rmsWindowInSeconds: number
    valueDecay: number
}