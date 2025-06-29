import {assert, int, nextPowOf2, unitValue} from "opendaw-std"

export class Delay {
    readonly #delaySize: int
    readonly #delayBuffer: Float32Array
    readonly #interpolationLength: int

    #writePosition: int = 0 | 0
    #currentOffset: int = 0 | 0
    #pFeedback: unitValue = 0.7
    #pWetLevel: number = 0.75
    #pDryLevel: number = 0.75

    #deltaOffset = 0.0
    #targetOffset = 0.0
    #alphaPosition = 0 | 0
    #processed = false
    #interpolating = false

    constructor(maxFrames: int, interpolationLength: int) {
        const pow2Size = nextPowOf2(maxFrames)

        this.#delaySize = pow2Size
        this.#delayBuffer = new Float32Array(pow2Size)
        this.#interpolationLength = interpolationLength
    }

    reset(): void {
        this.#writePosition = 0
        if (this.#processed) {
            this.#delayBuffer.fill(0.0)
            this.#processed = false
            this.#interpolating = false
        }
        this.#initDelayTime()
    }

    set offset(value: number) {
        assert(value >= 0 && value < this.#delaySize, "Out of bounds")
        if (this.#targetOffset === value) {return}
        this.#targetOffset = value
        if (this.#processed) {
            this.#updateDelayTime()
        } else {
            this.#initDelayTime()
        }
    }
    get offset(): number {return this.#targetOffset}

    set feedback(value: unitValue) {this.#pFeedback = value}
    get feedback(): unitValue {return this.#pFeedback}

    mix(wet: unitValue, dry: unitValue): void {
        this.#pWetLevel = wet
        this.#pDryLevel = dry
    }

    process(input: Float32Array, output: Float32Array, fromIndex: int, toIndex: int): void {
        if (this.#interpolating) {
            this.#processInterpolate(input, output, fromIndex, toIndex)
        } else {
            this.#processSteady(input, output, fromIndex, toIndex)
        }
        this.#processed = true
    }

    #processSteady(input: Float32Array, output: Float32Array, fromIndex: int, toIndex: int): void {
        const delayMask = this.#delaySize - 1
        const delayBuffer = this.#delayBuffer
        const feedback = this.#pFeedback
        const pWetLevel = this.#pWetLevel
        const pDryLevel = this.#pDryLevel
        let writePosition = this.#writePosition
        let readPosition: int = writePosition - Math.floor(this.#currentOffset)
        if (readPosition < 0) {readPosition += this.#delaySize}
        for (let i: int = fromIndex; i < toIndex; ++i) {
            const inp = input[i]
            const dly = delayBuffer[readPosition]
            delayBuffer[writePosition] = inp + dly * feedback + 1.0e-18 - 1.0e-18
            output[i] = dly * pWetLevel + inp * pDryLevel
            readPosition = ++readPosition & delayMask
            writePosition = ++writePosition & delayMask
        }
        this.#writePosition = writePosition
    }

    #processInterpolate(input: Float32Array, output: Float32Array, fromIndex: int, toIndex: int): void {
        const delayMask = this.#delaySize - 1
        const delayBuffer = this.#delayBuffer
        const feedback = this.#pFeedback
        const pWetLevel = this.#pWetLevel
        const pDryLevel = this.#pDryLevel
        let writePosition = this.#writePosition
        for (let i: int = fromIndex; i < toIndex; ++i) {
            if (this.#alphaPosition > 0) {
                this.#currentOffset += this.#deltaOffset
                this.#alphaPosition--
            } else {
                this.#currentOffset = this.#targetOffset
                this.#interpolating = false
            }
            let readPosition: int = writePosition - this.#currentOffset
            if (readPosition < 0) {
                readPosition += this.#delaySize
            }
            const readPositionInt = readPosition | 0
            const alpha = readPosition - readPositionInt
            const inp = input[i]
            const dl0 = delayBuffer[readPositionInt]
            const dln = delayBuffer[(readPositionInt + 1) & delayMask] - dl0
            const dly = dl0 + alpha * dln
            delayBuffer[writePosition] = inp + dly * feedback + 1.0e-18 - 1.0e-18
            output[i] = dly * pWetLevel + inp * pDryLevel
            writePosition = ++writePosition & delayMask
        }
        this.#writePosition = writePosition
    }

    #initDelayTime(): void {
        this.#currentOffset = this.#targetOffset
        this.#alphaPosition = 0
        this.#interpolating = false
    }

    #updateDelayTime(): void {
        if (this.#targetOffset !== this.#currentOffset) {
            this.#alphaPosition = this.#interpolationLength
            this.#deltaOffset = (this.#targetOffset - this.#currentOffset) / this.#alphaPosition
            this.#interpolating = true
        }
    }
}