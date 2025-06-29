import {ByteArrayInput, Exec, int, Notifier, Observer, Option, Progress, Subscription, Terminable, UUID} from "opendaw-std"
import {AudioData} from "studio-shared"
import {Peaks} from "opendaw-fusion"
import {UIAudioManager} from "@/project/UIAudioManager"
import {OpfsAgent} from "@/service/agents"
import {AudioLoader, AudioLoaderState} from "studio-shared"
import {AudioMetaData} from "@/audio/AudioMetaData"
import {AudioStorage} from "@/audio/AudioStorage"
import {AudioPeaks} from "@/audio/AudioPeaks"
import {Promises} from "opendaw-runtime"
import JSZip from "jszip"

export class UIAudioLoader implements AudioLoader {
    readonly #manager: UIAudioManager

    readonly #uuid: UUID.Format
    readonly #notifier: Notifier<AudioLoaderState>

    #meta: Option<AudioMetaData> = Option.None
    #data: Option<AudioData> = Option.None
    #peaks: Option<Peaks> = Option.None
    #state: AudioLoaderState = {type: "progress", progress: 0.0}
    #version: int = 0

    constructor(manager: UIAudioManager, uuid: UUID.Format) {
        this.#manager = manager
        this.#uuid = uuid

        this.#notifier = new Notifier<AudioLoaderState>()
        this.#get()
    }

    invalidate(): void {
        this.#state = {type: "progress", progress: 0.0}
        this.#meta = Option.None
        this.#data = Option.None
        this.#peaks = Option.None
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
    get meta(): Option<AudioMetaData> {return this.#meta}
    get peaks(): Option<Peaks> {return this.#peaks}
    get state(): AudioLoaderState {return this.#state}

    async pipeFilesInto(zip: JSZip): Promise<void> {
        const exec: Exec = async () => {
            const path = `${AudioStorage.Folder}/${UUID.toString(this.#uuid)}`
            zip.file("audio.wav", await OpfsAgent.read(`${path}/audio.wav`), {binary: true})
            zip.file("peaks.bin", await OpfsAgent.read(`${path}/peaks.bin`), {binary: true})
            zip.file("meta.json", await OpfsAgent.read(`${path}/meta.json`))
        }
        if (this.#state.type === "loaded") {
            return exec()
        } else {
            return new Promise<void>((resolve, reject) => {
                const subscription = this.#notifier.subscribe((state) => {
                    if (state.type === "loaded") {
                        resolve()
                        subscription.terminate()
                    } else if (state.type === "error") {
                        reject(state.reason)
                        subscription.terminate()
                    }
                })
            }).then(() => exec())
        }
    }

    #setState(value: AudioLoaderState): void {
        this.#state = value
        this.#notifier.notify(this.#state)
    }

    #get(): void {
        let version = this.#version
        AudioStorage.load(this.#uuid, this.#manager.context)
            .then(
                ([data, peaks, meta]) => {
                    if (this.#version !== version) {
                        console.warn(`Ignore obsolete version: ${this.#version} / ${version}`)
                        return
                    }
                    this.#data = Option.wrap(data)
                    this.#meta = Option.wrap(meta)
                    this.#peaks = Option.wrap(peaks)
                    this.#setState({type: "loaded"})
                },
                (error: any) => {
                    if (error instanceof Error && error.message.startsWith("timeoout")) {
                        this.#setState({type: "error", reason: error.message})
                        return console.warn(`Sample ${UUID.toString(this.#uuid)} timed out.`)
                    } else {
                        return this.#fetch()
                    }
                })
    }

    async #fetch(): Promise<void> {
        let version: int = this.#version
        const split = Progress.split(progress => this.#setState({type: "progress", progress: 0.1 + 0.9 * progress}), 2)
        const fetchResult = await Promises.tryCatch(this.#manager.fetch(this.#uuid, split[0]))
        if (this.#version !== version) {return}
        if (fetchResult.status === "rejected") {
            console.warn(fetchResult.error)
            this.#setState({type: "error", reason: "Error: N/A"})
            return
        }
        const [audio, meta] = fetchResult.value
        const peaks = await AudioPeaks.generate(audio, split[1])
        const storeResult = await Promises.tryCatch(AudioStorage.store(this.#uuid, audio, peaks, meta))
        if (this.#version !== version) {return}
        if (storeResult.status === "resolved") {
            this.#data = Option.wrap(audio)
            this.#meta = Option.wrap(meta)
            this.#peaks = Option.wrap(Peaks.from(new ByteArrayInput(peaks)))
            this.#setState({type: "loaded"})
        } else {
            console.warn(storeResult.error)
            this.#setState({type: "error", reason: "N/A"})
        }
    }
}