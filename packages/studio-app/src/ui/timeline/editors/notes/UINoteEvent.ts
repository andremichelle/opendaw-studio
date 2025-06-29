import {NoteEvent, ppqn} from "opendaw-dsp"
import {int} from "opendaw-std"

export type UINoteEvent = NoteEvent & {
    isSelected: boolean
    complete: ppqn
    chance: number
    playCount: int
    playCurve: number
}