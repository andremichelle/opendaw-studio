import {AudioData} from "@/audio-engine-shared/AudioData.ts"
import {AudioMetaData} from "@/audio/AudioMetaData"
import {OpfsAgent} from "@/service/agents"
import {ByteArrayInput, EmptyExec, UUID} from "std"
import {Peaks} from "fusion"
import {AudioSample} from "@/audio/AudioSample"
import {encodeWavFloat} from "@/wav"

export namespace AudioStorage {
    // CAUTION! Next time you would kill all locally imported files, so it is not that easy!
    export const clean = () => OpfsAgent.delete("samples/v1").catch(EmptyExec)

    export const Folder = "samples/v2"

    export const store = async (uuid: UUID.Format,
                                audio: AudioData,
                                peaks: ArrayBuffer,
                                meta: AudioMetaData): Promise<void> => {
        const path = `${Folder}/${UUID.toString(uuid)}`
        return Promise.all([
            OpfsAgent.write(`${path}/audio.wav`, new Uint8Array(encodeWavFloat({
                channels: audio.frames.slice(),
                numFrames: audio.numberOfFrames,
                sampleRate: audio.sampleRate
            }))),
            OpfsAgent.write(`${path}/peaks.bin`, new Uint8Array(peaks)),
            OpfsAgent.write(`${path}/meta.json`, new TextEncoder().encode(JSON.stringify(meta)))
        ]).then(EmptyExec)
    }

    export const updateMeta = async (uuid: UUID.Format, meta: AudioMetaData): Promise<void> => {
        const path = `${Folder}/${UUID.toString(uuid)}`
        return OpfsAgent.write(`${path}/meta.json`, new TextEncoder().encode(JSON.stringify(meta)))
    }

    export const load = async (uuid: UUID.Format, context: AudioContext): Promise<[AudioData, Peaks, AudioMetaData]> => {
        const path = `${Folder}/${UUID.toString(uuid)}`
        return Promise.all([
            OpfsAgent.read(`${path}/audio.wav`)
                .then(bytes => context.decodeAudioData(bytes.buffer as ArrayBuffer)),
            OpfsAgent.read(`${path}/peaks.bin`)
                .then(bytes => Peaks.from(new ByteArrayInput(bytes.buffer))),
            OpfsAgent.read(`${path}/meta.json`)
                .then(bytes => JSON.parse(new TextDecoder().decode(bytes)))
        ]).then(([buffer, peaks, meta]) => [AudioData.from(buffer), peaks, meta])
    }

    export const remove = async (uuid: UUID.Format): Promise<void> => {
        const path = `${Folder}/${UUID.toString(uuid)}`
        return OpfsAgent.delete(`${path}`)
    }

    export const list = async (): Promise<ReadonlyArray<AudioSample>> => {
        return OpfsAgent.list(Folder)
            .then(files => Promise.all(files.filter(file => file.kind === "directory")
                .map(async ({name}) => {
                    const array = await OpfsAgent.read(`${Folder}/${name}/meta.json`)
                    return ({uuid: name, ...(JSON.parse(new TextDecoder().decode(array)) as AudioMetaData)})
                })), () => [])
    }
}