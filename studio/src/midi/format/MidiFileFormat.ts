import {int} from "std"
import {MidiTrack} from "./MidiTrack"

export class MidiFileFormat {
    constructor(readonly tracks: ReadonlyArray<MidiTrack>, readonly formatType: int, readonly timeDivision: int) {}
}