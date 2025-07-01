import {byte} from "lib-std"

export interface ControlEventVisitor {
    noteOn?(note: byte, velocity: number): void
    noteOff?(note: byte): void
    pitchBend?(delta: number): void
    controller?(id: byte, value: number): void
}