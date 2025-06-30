import {Peaks} from "lib-fusion"
import {AudioData, AudioLoader, AudioLoaderManager, AudioLoaderState, EngineToClient} from "studio-shared"
import {Observer, Option, SortedSet, Subscription, Terminable, UUID} from "lib-std"

export type FetchAudio = (uuid: UUID.Format) => Promise<AudioData>

class AudioLoaderWorklet implements AudioLoader {
    readonly peaks: Option<Peaks> = Option.None
    readonly #state: AudioLoaderState = {type: "loaded"}

    #data: Option<AudioData> = Option.None

    constructor(readonly uuid: UUID.Format, readonly engineToClient: EngineToClient) {
        engineToClient.fetchAudio(uuid).then((data) => this.#data = Option.wrap(data))
    }

    get data(): Option<AudioData> {return this.#data}
    get state(): AudioLoaderState {return this.#state}

    subscribe(_observer: Observer<AudioLoaderState>): Subscription {return Terminable.Empty}
}

export class AudioManagerWorklet implements AudioLoaderManager {
    readonly #engineToClient: EngineToClient
    readonly #set: SortedSet<UUID.Format, AudioLoader>

    constructor(engineToClient: EngineToClient) {
        this.#engineToClient = engineToClient
        this.#set = UUID.newSet<AudioLoader>(handler => handler.uuid)
    }

    getOrCreateAudioLoader(uuid: UUID.Format): AudioLoader {
        return this.#set.getOrCreate(uuid, uuid => new AudioLoaderWorklet(uuid, this.#engineToClient))
    }
}