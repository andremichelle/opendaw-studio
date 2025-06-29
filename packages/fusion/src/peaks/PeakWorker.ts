import {Arrays, float, Float16, FloatArray, int, panic, Procedure} from "opendaw-std"
import {Peaks} from "./Peaks"
import {PeakProtocol} from "./PeakProtocol"
import {Communicator, Messenger, stopwatch} from "opendaw-runtime"

export namespace PeakWorker {
    export const install = (messenger: Messenger) =>
        Communicator.executor(messenger.channel("peaks"), new class implements PeakProtocol {
            async generateAsync(progress: Procedure<number>,
                                shifts: Uint8Array,
                                frames: FloatArray[],
                                numFrames: int,
                                numChannels: int): Promise<ArrayBufferLike> {
                return generatePeaks(progress, shifts, frames, numFrames, numChannels).toArrayBuffer()
            }
        })

    const generatePeaks = (progress: Procedure<number>,
                           shifts: Uint8Array,
                           frames: ReadonlyArray<FloatArray>,
                           numFrames: int,
                           numChannels: int): Peaks => {
        if (frames.length !== numChannels) {
            return panic(`Invalid numberOfChannels. Expected: ${numChannels}. Got ${frames.length}`)
        }

        class State {
            min: number = Number.POSITIVE_INFINITY
            max: number = Number.NEGATIVE_INFINITY
            index: int = 0
        }

        const time = stopwatch()
        const numShifts = shifts.length
        const [stages, dataOffset] = initStages(shifts, numFrames)
        const data: Int32Array[] = Arrays.create(() => new Int32Array(dataOffset), numChannels)
        const minMask = stages[0].mask
        const total = numChannels * numFrames
        let count = 0
        for (let channel = 0; channel < numChannels; ++channel) {
            const channelData = data[channel]
            const channelFrames = frames[channel]
            const states: State[] = Arrays.create(() => new State(), numShifts)
            let min = Number.POSITIVE_INFINITY
            let max = Number.NEGATIVE_INFINITY
            let position = 0
            for (let i = 0; i < numFrames; ++i) {
                const frame = channelFrames[i]
                min = Math.min(frame, min)
                max = Math.max(frame, max)
                if ((++position & minMask) === 0) {
                    for (let j = 0; j < numShifts; ++j) {
                        const stage = stages[j]
                        const state = states[j]
                        state.min = Math.min(state.min, min)
                        state.max = Math.max(state.max, max)
                        if ((stage.mask & position) === 0) {
                            channelData[stage.dataOffset + state.index++] = pack(state.min, state.max)
                            state.min = Number.POSITIVE_INFINITY
                            state.max = Number.NEGATIVE_INFINITY
                        }
                    }
                    min = Number.POSITIVE_INFINITY
                    max = Number.NEGATIVE_INFINITY
                }
                if ((++count & 0xFFFF) === 0) {
                    progress(count / total)
                }
            }
        }
        progress(1.0)
        time.lab(`Peak-Gen '${self.constructor.name}'`)
        return new Peaks(stages, data, numFrames, numChannels)
    }

    const initStages = (shifts: Uint8Array, numFrames: int): [Peaks.Stage[], int] => {
        let dataOffset = 0
        const stages = Arrays.create((index: int) => {
            const shift = shifts[index]
            const numPeaks = Math.ceil(numFrames / (1 << shift))
            const stage = new Peaks.Stage((1 << shift) - 1, shift, numPeaks, dataOffset)
            dataOffset += numPeaks
            return stage
        }, shifts.length)
        return [stages, dataOffset]
    }

    const pack = (f0: float, f1: float): int => {
        const bits0 = Float16.floatToIntBits(f0)
        const bits1 = Float16.floatToIntBits(f1)
        return bits0 | (bits1 << 16)
    }
}