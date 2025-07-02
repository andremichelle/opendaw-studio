import {SortedSet, UUID} from "lib-std"
import {AudioLoader, AudioLoaderManager} from "studio-adapters"
import {MainThreadAudioLoader} from "@/MainThreadAudioLoader"

export class MainThreadAudioLoaderManager implements AudioLoaderManager {
    readonly #context: AudioContext
    readonly #loaders: SortedSet<UUID.Format, MainThreadAudioLoader>

    constructor(context: AudioContext) {
        this.#context = context
        this.#loaders = UUID.newSet(loader => loader.uuid)
    }

    getOrCreateAudioLoader(uuid: UUID.Format): AudioLoader {
        return this.#loaders.getOrCreate(uuid, uuid => new MainThreadAudioLoader(this.#context, uuid))
    }
}