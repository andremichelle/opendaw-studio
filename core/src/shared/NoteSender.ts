import {byte, Terminable, unitValue} from "std"

export interface NoteSender {
    noteOn(note: byte, velocity: unitValue): void
    noteOff(note: byte): void
}

export namespace NoteSustainer {
    export const start = (sender: NoteSender, note: byte, velocity: unitValue = 1.0): Terminable => {
        let playing = true
        sender.noteOn(note, velocity)
        return {
            terminate: () => {
                if (playing) {
                    sender.noteOff(note)
                    playing = false
                }
            }
        }
    }
}