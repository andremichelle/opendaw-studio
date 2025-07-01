import {UUID} from "lib-std"

export type ClipSequencingUpdates = {
    started: ReadonlyArray<UUID.Format>
    stopped: ReadonlyArray<UUID.Format>
    obsolete: ReadonlyArray<UUID.Format> // were scheduled but never started
}

export type ClipNotification = {
    type: "sequencing"
    changes: ClipSequencingUpdates
} | {
    type: "waiting"
    clips: ReadonlyArray<UUID.Format>
}