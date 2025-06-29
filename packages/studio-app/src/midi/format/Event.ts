import {int} from "lib-std"

export interface Event<TYPE> {
    readonly ticks: int
    readonly type: TYPE
}