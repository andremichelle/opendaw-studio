import {NoteEvent, ppqn} from "lib-dsp"
import {int} from "lib-std"

export type UINoteEvent = NoteEvent & {
    isSelected: boolean
    complete: ppqn
    chance: number
    playCount: int
    playCurve: number
}