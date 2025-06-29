import {byte, Nullable} from "lib-std"

export namespace MidiData {
    export const enum Command {NoteOn = 0x90, NoteOff = 0x80, PitchBend = 0xE0, Controller = 0xB0}

    export const readCommand = (data: Uint8Array) => data[0] & 0xF0
    export const readChannel = (data: Uint8Array) => data[0] & 0x0F
    export const readParam1 = (data: Uint8Array) => 1 < data.length ? data[1] & 0xFF : 0
    export const readParam2 = (data: Uint8Array) => 2 < data.length ? data[2] & 0xFF : 0
    export const isNoteOn = (data: Uint8Array) => MidiData.readCommand(data) === Command.NoteOn
    export const readPitch = (data: Uint8Array) => data[1]
    export const readVelocity = (data: Uint8Array) => data[2] / 127.0
    export const isNoteOff = (data: Uint8Array) => MidiData.readCommand(data) === Command.NoteOff
    export const isPitchWheel = (data: Uint8Array) => MidiData.readCommand(data) === Command.PitchBend
    export const asPitchBend = (data: Uint8Array) => {
        const p1 = MidiData.readParam1(data) & 0x7F
        const p2 = MidiData.readParam2(data) & 0x7F
        const value = p1 | p2 << 7
        return 8192 >= value ? value / 8192.0 - 1.0 : (value - 8191) / 8192.0
    }
    export const isController = (data: Uint8Array): boolean => MidiData.readCommand(data) === Command.Controller
    export const asValue = (data: Uint8Array) => {
        const value = MidiData.readParam2(data)
        if (64 < value) {
            return 0.5 + (value - 63) / 128
        } else if (64 > value) {
            return value / 128
        } else {
            return 0.5
        }
    }
    export const noteOn = (channel: byte, note: byte, velocity: byte) => {
        const bytes = new Uint8Array(3)
        bytes[0] = channel | Command.NoteOn
        bytes[1] = note | 0
        bytes[2] = velocity | 0
        return bytes
    }
    export const noteOff = (channel: byte, note: byte) => {
        const bytes = new Uint8Array(3)
        bytes[0] = channel | Command.NoteOff
        bytes[1] = note
        return bytes
    }

    export const debug = (data: Nullable<Uint8Array>): string => {
        if (data === null) {return "null"}
        if (isNoteOn(data)) {
            return `NoteOn #${readChannel(data)} ${readPitch(data)} : ${readVelocity(data).toFixed(2)}`
        } else if (isNoteOff(data)) {
            return `NoteOff #${readChannel(data)} ${readPitch(data)}`
        } else if (isPitchWheel(data)) {
            return `PitchWheel #${readChannel(data)} ${asPitchBend(data)}`
        } else if (isController(data)) {
            return `Control #${readChannel(data)} ${asValue(data)}`
        } else {
            return "Unknown"
        }
    }
}