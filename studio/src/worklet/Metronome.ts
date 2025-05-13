import {BlockFlag, ProcessInfo} from "@/worklet/processing.ts"
import {PPQN} from "dsp"
import {assert, Bits, int, TAU} from "std"
import {RenderQuantum} from "@/worklet/constants.ts"
import {AudioBuffer} from "@/worklet/AudioBuffer.ts"
import {Fragmentor} from "@/worklet/Fragmentor.ts"

export class Metronome {
    readonly #audioOuput = new AudioBuffer()
    readonly #clicks: Click[] = []

    constructor() {}

    process({blocks}: ProcessInfo): void {
        blocks.forEach(({p0, p1, bpm, s0, s1, flags}) => {
            if (Bits.every(flags, BlockFlag.transporting)) {
                for (const position of Fragmentor.iterate(p0, p1, PPQN.Quarter)) {
                    assert(p0 <= position && position < p1, `${position} out of bounds (${p0}, ${p1})`)
                    const distanceToEvent = Math.floor(PPQN.pulsesToSamples(position - p0, bpm, sampleRate))
                    this.#clicks.push(new Click(position, s0 + distanceToEvent))
                }
            }
            this.#audioOuput.clear(s0, s1)
            for (let i = this.#clicks.length - 1; i >= 0; i--) {
                const processor = this.#clicks[i]
                if (processor.processAdd(this.#audioOuput, s0, s1)) {
                    this.#clicks.splice(i, 1)
                }
            }
        })
    }

    get audioOuput(): AudioBuffer {return this.#audioOuput}
}

class Click {
    readonly #frequency: number

    #position: int = 0 | 0
    #startIndex: int = 0 | 0

    constructor(timeCode: number, startIndex: int) {
        assert(startIndex >= 0 && startIndex < RenderQuantum, `${startIndex} out of bounds`)
        this.#frequency = PPQN.toParts(timeCode).beats === 0 ? 880.0 : 440.0
        this.#startIndex = startIndex
    }

    processAdd(buffer: AudioBuffer, start: int, end: int): boolean {
        const [l, r] = buffer.channels()
        const attack = Math.floor(0.002 * sampleRate)
        const release = Math.floor(0.050 * sampleRate)

        for (let index = Math.max(this.#startIndex, start); index < end; index++) {
            const env = Math.min(this.#position / attack, 1.0 - (this.#position - attack) / release)
            const amp = Math.sin(this.#position / sampleRate * TAU * this.#frequency) * 0.25 * env * env
            l[index] += amp
            r[index] += amp
            if (++this.#position > attack + release) {return true}
        }
        this.#startIndex = 0
        return false
    }
}