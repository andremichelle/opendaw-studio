import {AudioFileBox} from "studio-boxes"
import {Option, UUID} from "opendaw-std"
import {Peaks} from "opendaw-fusion"
import {AudioData} from "./AudioData"
import {Address} from "opendaw-box"
import {AudioLoader} from "./AudioLoader"
import {BoxAdaptersContext} from "./BoxAdaptersContext"
import {BoxAdapter} from "./BoxAdapter"

export class AudioFileBoxAdapter implements BoxAdapter {
    readonly #context: BoxAdaptersContext
    readonly #box: AudioFileBox

    constructor(context: BoxAdaptersContext, box: AudioFileBox) {
        this.#context = context
        this.#box = box
    }

    get box(): AudioFileBox {return this.#box}
    get uuid(): UUID.Format {return this.#box.address.uuid}
    get address(): Address {return this.#box.address}
    get startInSeconds(): number {return this.#box.startInSeconds.getValue()}
    get endInSeconds(): number {return this.#box.endInSeconds.getValue()}
    get data(): Option<AudioData> {return this.getOrCreateAudioLoader().data}
    get peaks(): Option<Peaks> {return this.getOrCreateAudioLoader().peaks}

    getOrCreateAudioLoader(): AudioLoader {
        return this.#context.audioManager.getOrCreateAudioLoader(this.#box.address.uuid)
    }

    terminate(): void {}
}