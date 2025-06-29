import {AudioData} from "./AudioData"
import {Peaks} from "lib-fusion"
import {Observer, Option, Subscription, unitValue, UUID} from "lib-std"

export interface AudioLoaderManager {
    getOrCreateAudioLoader(uuid: UUID.Format): AudioLoader
}

export interface AudioLoader {
    readonly data: Option<AudioData>
    readonly peaks: Option<Peaks>
    readonly uuid: UUID.Format
    readonly state: AudioLoaderState
    subscribe(observer: Observer<AudioLoaderState>): Subscription
}

export type AudioLoaderState =
    | { type: "progress", progress: unitValue }
    | { type: "error", reason: string }
    | { type: "loaded" }
