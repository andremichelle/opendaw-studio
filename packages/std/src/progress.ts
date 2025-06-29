import {int, Procedure, unitValue} from "./lang"
import {Arrays} from "./arrays"

export type ProgressHandler = Procedure<unitValue>
export const SilentProgressHandler: ProgressHandler = _ => {}

export namespace Progress {
    export const split = (progress: ProgressHandler, count: int): ReadonlyArray<ProgressHandler> => {
        const collect = new Float32Array(count)
        return Arrays.create(index => (value: number) => {
            collect[index] = value
            progress(collect.reduce((total, value) => total + value, 0.0) / count)
        }, count)
    }
}