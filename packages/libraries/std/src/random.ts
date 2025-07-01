import {FloatArray, int, panic, unitValue} from "./lang"

export interface Random {
    setSeed(value: int): void
    nextDouble(min: number, max: number): number
    nextInt(min: int, max: int): int
    nextElement<T>(array: ArrayLike<T>): T
    nextBoolean(): boolean
    uniform(): unitValue
}

export namespace Random {
    export const create = (seed: int = 0xF123F42): Random => new Mulberry32(seed)

    /**
     * Generates a monotone ascending sequence of random unitValue numbers.
     * @param target The target array to fill with random values.
     * @param noise Tell the method how noisy the sequence should be. 0 leads to a linear sequence.
     * @param random The random number generator to use.
     * @returns The target array.
     */
    export const monotoneAscending = (target: FloatArray, noise: int = 128, random: Random = create()): FloatArray => {
        const length = target.length
        if (length < 2) {return panic("Array must have at least 2 elements")}
        let sum = 0.0
        for (let i = 1; i < length; i++) {
            const value = Math.floor(random.uniform() * (1.0 + noise)) + 1.0
            target[i] = value
            sum += value
        }
        let acc = 0.0
        target[0] = 0.0
        for (let i = 1; i < length; i++) {
            acc += target[i]
            target[i] = acc / sum
        }
        return target
    }
}

export class Mulberry32 implements Random {
    #seed: int = 0

    constructor(seed: int) {this.setSeed(seed)}

    setSeed(value: int): void {this.#seed = value & 0xFFFFFFFF}
    nextDouble(min: number, max: number): number {return min + this.uniform() * (max - min)}
    nextInt(min: int, max: int): int {return min + Math.floor(this.uniform() * (max - min))}
    nextElement<T>(array: ArrayLike<T>): T {return array[Math.floor(this.uniform() * array.length)]}
    nextBoolean(): boolean {return this.uniform() < 0.5}
    uniform(): unitValue {
        let t = this.#seed += 0x6D2B79F5
        t = Math.imul(t ^ t >>> 15, t | 1)
        t ^= t + Math.imul(t ^ t >>> 7, t | 61)
        return ((t ^ t >>> 14) >>> 0) / 4294967296.0
    }
}