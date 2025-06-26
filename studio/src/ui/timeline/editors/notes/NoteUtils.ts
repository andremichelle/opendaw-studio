import {
    NoteEventCollectionBoxAdapter
} from "@core/shared/adapters/timeline/collection/NoteEventCollectionBoxAdapter"
import {MidiFile} from "@/midi/format/MidiFile"
import {MidiTrack} from "@/midi/format/MidiTrack"
import {Promises} from "runtime"
import {Files} from "dom"

export const exportNotesToMidiFile = async (collection: NoteEventCollectionBoxAdapter, suggestedName: string) => {
    const encoder = MidiFile.encoder()
    encoder.addTrack(MidiTrack.fromCollection(collection.events))
    return Promises.tryCatch(Files.save(encoder.encode().toArrayBuffer() as ArrayBuffer, {
        types: [{
            description: "Midi File",
            accept: {"application/octet-stream": [".mid", ".midi"]}
        }], suggestedName
    }))
}