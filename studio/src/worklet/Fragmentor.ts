import {ppqn} from "dsp"
import {int} from "std"

export class Fragmentor {
    static* iterate(p0: ppqn, p1: ppqn, stepSize: ppqn): Generator<ppqn> {
        let index = Math.ceil(p0 / stepSize)
        let position = index * stepSize
        while (position < p1) {
            yield position
            position = ++index * stepSize
        }
    }

    static* iterateWithIndex(p0: ppqn, p1: ppqn, stepSize: ppqn): Generator<{ position: ppqn, index: int }> {
        let index = Math.ceil(p0 / stepSize)
        let position = index * stepSize
        while (position < p1) {
            yield {position, index}
            position = ++index * stepSize
        }
    }
}