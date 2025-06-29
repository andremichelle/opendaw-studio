import {Arrays} from "./arrays"
import {NumberComparator} from "./comparators"
import {assert, int, isDefined, unitValue} from "./lang"
import {clamp} from "./math"
import {BinarySearch} from "./binary-search"

export interface ValueGuide {
    begin(value: unitValue): void
    moveBy(delta: number): void
    ratio(value: number): void
    value(): unitValue
    disable(): void
    enable(): void
}

export namespace ValueGuide {
    export type Options = {
        horizontal?: boolean
        trackLength?: number
        ratio?: number
        snap?: {
            threshold: number | ReadonlyArray<number>
            snapLength?: number
        }
    }

    export const create = (option?: Options): ValueGuide => {
        if (isDefined(option)) {
            if (isDefined(option?.snap)) {
                return ValueGuide.snap(
                    option?.trackLength, option?.snap?.snapLength, Array.isArray(option?.snap?.threshold)
                        ? option?.snap.threshold
                        : [option?.snap?.threshold])
            } else {
                return ValueGuide.identity(option?.trackLength)
            }
        } else {
            return ValueGuide.identity()
        }
    }

    export const snap = (
        trackLength: number = DEFAULT_TRACK_LENGTH,
        snapLength: number = DEFAULT_SNAP_LENGTH,
        thresholds: unitValue[]): Snap => new Snap(trackLength, snapLength / trackLength, thresholds)

    export const identity = (trackLength: number = DEFAULT_TRACK_LENGTH): ValueGuide => new Identity(trackLength)

    const DEFAULT_TRACK_LENGTH = 128
    const DEFAULT_SNAP_LENGTH = 24

    class Identity implements ValueGuide {
        #x: number = NaN
        #value: number = NaN
        #ratio: number = 1.0

        constructor(private readonly length: number) {}

        begin(value: unitValue): void {this.#value = this.#x = value}

        moveBy(delta: number): void {
            assert(!isNaN(this.#value), () => "value has never been set")
            this.#x += delta / this.length * this.#ratio
            this.#value = clamp(this.#x, 0.0, 1.0)
        }

        ratio(value: number): void {this.#ratio = value}

        value(): unitValue {
            assert(!isNaN(this.#value), () => "value has never been set")
            return this.#value
        }

        disable(): void {}
        enable(): void {}
    }

    class Snap implements ValueGuide {
        readonly #length: number
        readonly #margin: number
        readonly #thresholds: Array<number>
        readonly #ranges: Array<number>

        #x: number = NaN // unhinged floating value including the snapping margin
        #value: number = NaN // clamped normalised, exposable value
        #ratio: number = 1.0
        #enabled: boolean = true

        constructor(length: number, margin: number, thresholds: Array<number>) {
            assert(margin > 0.0, () => `margin(${margin}) must be greater then 0`)
            assert(Arrays.isSorted(thresholds), () => "thresholds are not sorted")
            assert(margin < length, () => `margin(${margin}) must be lower then length(${length})`)
            this.#length = length
            this.#margin = margin
            this.#thresholds = thresholds
            this.#ranges = thresholds.map((x: number, index: int) => x + index * this.#margin)
        }

        begin(value: unitValue): void {
            if (this.#enabled) {this.#x = this.valueToX(value)}
            this.#value = value
        }

        moveBy(delta: number): void {
            assert(!isNaN(this.#value), () => "value has never been set")
            this.#x += delta / this.#length * this.#ratio
            this.#value = this.#enabled ? this.xToValue(this.#x) : clamp(this.#x, 0.0, 1.0)
        }

        ratio(value: number): void {this.#ratio = value}

        value(): unitValue {
            assert(!isNaN(this.#value), () => "value has never been set")
            return this.#value
        }

        disable(): void {
            if (!this.#enabled) {return}
            this.#enabled = false
            this.#x = this.xToValue(this.#x)
        }

        enable(): void {
            if (this.#enabled) {return}
            this.#enabled = true
            this.#x = this.valueToX(this.#x)
        }

        valueToX(value: unitValue): number {
            const index: int = BinarySearch.rightMost(this.#thresholds, value, NumberComparator)
            if (index < 0) {
                return value
            } else {
                const range = this.#ranges[index]
                const threshold = this.#thresholds[index]
                return value === threshold ? range + this.#margin / 2.0 : range + this.#margin + (value - threshold)
            }
        }

        xToValue(x: number): unitValue {
            const clamped = clamp(x, 0.0, 1.0 + this.#margin * this.#thresholds.length)
            const index: int = BinarySearch.rightMost(this.#ranges, clamped, NumberComparator)
            if (index < 0) {
                return clamped
            } else {
                const range = this.#ranges[index]
                const threshold = this.#thresholds[index]
                if (clamped > range + this.#margin) {
                    return clamped - (range + this.#margin) + threshold
                } else {
                    return threshold
                }
            }
        }

        get margin(): number {return this.#margin}
    }
}