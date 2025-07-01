import {int} from "lib-std"

export interface PeakMeterProcessorOptions {
    sab: SharedArrayBuffer
    numberOfChannels: int
    rmsWindowInSeconds: number
    valueDecay: number
}