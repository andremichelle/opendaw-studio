import {int, Terminable} from "lib-std"
import {NoteEvent, ppqn} from "lib-dsp"
import {EventBuffer} from "./EventBuffer.ts"
import {AudioBuffer} from "./AudioBuffer.ts"
import {UpdateEvent} from "./UpdateClock.ts"

export const enum BlockFlag {
    transporting = 1 << 0, // is true if the (main) timeline should not advance
    discontinuous = 1 << 1, // set, if the time has not been advanced naturally (release notes)
    playing = 1 << 2, // set, if arrangement should generate sound
    tempoChanged = 1 << 3 // true if the tempo has been changed
}

export namespace BlockFlags {
    export const create = (transporting: boolean, discontinuous: boolean, playing: boolean, tempoChanged: boolean): int => 0
        | (transporting ? BlockFlag.transporting : 0)
        | (discontinuous ? BlockFlag.discontinuous : 0)
        | (playing ? BlockFlag.playing : 0)
        | (tempoChanged ? BlockFlag.tempoChanged : 0)
}

export type Block = Readonly<{
    index: int,
    // range in ppqn time
    p0: ppqn
    p1: ppqn
    // range in audio block
    s0: int
    s1: int
    // tempo in this block
    bpm: number
    // BlockFlag
    flags: int
}>

export enum ProcessPhase {Before, After}

export type AnyEvent = UpdateEvent | NoteEvent

export interface ProcessInfo {
    blocks: ReadonlyArray<Block>
}

export interface Processor extends EventReceiver {
    reset(): void
    process(processInfo: ProcessInfo): void
}

export interface EventReceiver {
    get eventInput(): EventBuffer
}

export interface AudioGenerator {
    get audioOutput(): AudioBuffer
}

export interface EventGenerator {
    setEventTarget(target: EventBuffer): Terminable
}

export interface AudioInput {
    setAudioSource(source: AudioBuffer): Terminable
}