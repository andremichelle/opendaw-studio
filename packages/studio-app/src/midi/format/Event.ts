import {int} from "opendaw-std"

export interface Event<TYPE> {
    readonly ticks: int
    readonly type: TYPE
}