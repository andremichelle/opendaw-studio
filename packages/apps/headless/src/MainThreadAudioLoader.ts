import {int, Notifier, Observer, Option, Subscription, Terminable, UUID} from "lib-std"
import {AudioData, AudioLoader, AudioLoaderState} from "studio-adapters"
import {Peaks} from "lib-fusion"
import {SampleApi} from "@/SampleApi"

export class MainThreadAudioLoader implements AudioLoader {
    readonly #context: AudioContext
    readonly #uuid: UUID.Format
    readonly #notifier: Notifier<AudioLoaderState>

    #data: Option<AudioData> = Option.None
    #state: AudioLoaderState = {type: "progress", progress: 0.0}
    #version: int = 0

    constructor(context: AudioContext, uuid: UUID.Format) {
        this.#context = context
        this.#uuid = uuid

        this.#notifier = new Notifier<AudioLoaderState>()
        this.#get()
    }

    invalidate(): void {
        this.#state = {type: "progress", progress: 0.0}
        this.#data = Option.None
        this.#version++
        this.#get()
    }

    subscribe(observer: Observer<AudioLoaderState>): Subscription {
        if (this.#state.type === "loaded") {
            observer(this.#state)
            return Terminable.Empty
        }
        return this.#notifier.subscribe(observer)
    }

    get uuid(): UUID.Format {return this.#uuid}
    get data(): Option<AudioData> {return this.#data}
    get peaks(): Option<Peaks> {return Option.None}
    get state(): AudioLoaderState {return this.#state}

    #setState(value: AudioLoaderState): void {
        this.#state = value
        this.#notifier.notify(this.#state)
    }

    #get(): void {
        console.debug("GET", UUID.toString(this.#uuid))
        SampleApi.load(this.#context, this.#uuid, progress => this.#setState({type: "progress", progress}))
            .then(([data]) => {
                console.debug("LOADED", UUID.toString(this.#uuid))
                this.#data = Option.wrap(data)
                this.#setState({type: "loaded"})
            }, reason => this.#setState({type: "error", reason}))
    }
}