import {Arrays} from "./arrays"
import {int} from "./lang"

export class Bits {
    static readonly every = (set: int, flag: int): boolean => (set & flag) === flag
    static readonly some = (set: int, flag: int): boolean => (set & flag) > 0

    readonly #numBits: int
    readonly #array: Uint32Array

    constructor(numBits: int = 32) {
        this.#numBits = numBits
        this.#array = new Uint32Array(((numBits - 1) >>> 5) + 1)
    }

    getBit(index: int): boolean {
        const arrayIndex = index >>> 5
        const byte = 1 << (index - (arrayIndex << 5))
        return (this.#array[arrayIndex] & byte) !== 0
    }

    setBit(index: int, value: boolean): boolean {
        const arrayIndex: int = index >>> 5
        const byte: int = 1 << (index - (arrayIndex << 5))
        const was: int = this.#array[arrayIndex]
        const val: int = value ? was | byte : was & ~byte
        if (val === was) {return false}
        this.#array[arrayIndex] = val
        return true
    }

    isEmpty(): boolean {return this.#array.every(value => value === 0)}
    nonEmpty(): boolean {return this.#array.some(value => value > 0)}

    set buffer(value: ArrayBufferLike) {this.#array.set(new Uint32Array(value))}
    get buffer(): ArrayBufferLike {return this.#array.buffer}

    replace(buffer: ArrayBufferLike): boolean {
        const source = new Uint32Array(buffer)
        if (source.every((value, index) => this.#array[index] === value)) {return false}
        this.#array.set(source)
        return true
    }

    toString(): string {
        let result: string = ""
        for (const value of Arrays.iterateReverse(this.#array)) {
            result += value.toString(2).padStart(32, "0")
        }
        return result.substring(result.length - this.#numBits)
    }

    clear(): void {this.#array.fill(0)}
}