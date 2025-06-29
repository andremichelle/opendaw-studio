import {AudioSample} from "@/audio/AudioSample"
import {byte, int} from "lib-std"
import {Effects} from "@/service/Effects"
import {Instruments} from "@/service/Instruments"

export type DragCopyHint = { copy?: boolean }
export type DragSample = { type: "sample", sample: AudioSample } & DragCopyHint
export type DragFile = { type: "file", file: File /* This cannot be accessed while dragging! */ } & DragCopyHint
export type DragDevice = (
    {
        type: "midi-effect" | "audio-effect"
        start_index: int
    } |
    {
        type: "midi-effect"
        start_index: null
        device: Effects.MidiEffectKeys
    } |
    {
        type: "audio-effect"
        start_index: null
        device: Effects.AudioEffectKeys
    } |
    {
        type: "instrument"
        device: Instruments.Keys
    } |
    {
        type: "playfield-slot"
        index: byte
        uuid: string
    }) & DragCopyHint
export type DragChannelStrip = { type: "channelstrip", uuid: string, start_index: int } & DragCopyHint

export type AnyDragData = DragSample | DragFile | DragDevice | DragChannelStrip