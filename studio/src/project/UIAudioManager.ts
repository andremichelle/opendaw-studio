import {ProgressHandler, SortedSet, UUID} from "std"
import {UIAudioLoader} from "@/project/UIAudioLoader"
import {AudioLoaderManager} from "@core/shared/AudioLoader.ts"
import {AudioServerApi} from "@/audio/AudioServerApi"
import {AudioData} from "@core/shared/AudioData.ts"
import {AudioMetaData} from "@/audio/AudioMetaData"

export class UIAudioManager implements AudioLoaderManager, AudioServerApi {
    readonly #api: AudioServerApi
    readonly #context: AudioContext
    readonly #loaders: SortedSet<UUID.Format, UIAudioLoader>

    constructor(api: AudioServerApi, context: AudioContext) {
        this.#api = api
        this.#context = context
        this.#loaders = UUID.newSet(loader => loader.uuid)
    }

    get context(): AudioContext {return this.#context}

    fetch(uuid: UUID.Format, progress: ProgressHandler): Promise<[AudioData, AudioMetaData]> {
        return this.#api.fetch(uuid, progress)
    }

    invalidate(uuid: UUID.Format) {this.#loaders.opt(uuid).ifSome(loader => loader.invalidate())}

    getOrCreateAudioLoader(uuid: UUID.Format): UIAudioLoader {
        return this.#loaders.getOrCreate(uuid, uuid => new UIAudioLoader(this, uuid))
    }
}