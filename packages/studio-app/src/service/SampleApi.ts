import {Arrays, asDefined, DefaultObservableValue, panic, Procedure, tryCatch, unitValue, UUID} from "opendaw-std"
import {AudioData} from "studio-shared"
import {showInfoDialog, showProcessDialog} from "@/ui/components/dialogs.tsx"
import {AudioMetaData} from "@/audio/AudioMetaData"
import {AudioSample} from "@/audio/AudioSample"
import {network, Promises} from "opendaw-runtime"

const username = "openDAW"
const password = "prototype"
const base64Credentials = btoa(`${username}:${password}`)
const headers: RequestInit = {
    method: "GET",
    headers: {"Authorization": `Basic ${base64Credentials}`},
    credentials: "include"
}

export namespace SampleApi {
    export const ApiRoot = "https://api.opendaw.studio/samples"
    export const FileRoot = "https://assets.opendaw.studio/samples"

    export const all = async (): Promise<ReadonlyArray<AudioSample>> => {
        return await Promises.retry(() => fetch(`${ApiRoot}/list.php`, headers).then(x => x.json(), () => []))
    }

    export const get = async (uuid: UUID.Format): Promise<AudioSample> => {
        const url = `${ApiRoot}/get.php?uuid=${UUID.toString(uuid)}`
        const sample: AudioSample = await Promises.retry(() => network.limitFetch(url, headers)
            .then(x => x.json()))
            .then(x => {if ("error" in x) {return panic(x.error)} else {return x}})
        return Object.freeze({...sample, cloud: true})
    }

    export const load = async (context: AudioContext,
                               uuid: UUID.Format,
                               progress: Procedure<unitValue>): Promise<[AudioData, AudioMetaData]> => {
        console.debug(`fetch ${UUID.toString(uuid)}`)
        return get(uuid)
            .then(({uuid, name, bpm}) => Promises.retry(() => network.limitFetch(`${FileRoot}/${uuid}`, headers))
                .then(response => {
                    const total = parseInt(response.headers.get("Content-Length") ?? "0")
                    let loaded = 0
                    return new Promise<ArrayBuffer>((resolve, reject) => {
                        const reader = asDefined(response.body, "No body in response").getReader()
                        const chunks: Array<Uint8Array> = []
                        const nextChunk = ({done, value}: ReadableStreamReadResult<Uint8Array>) => {
                            if (done) {
                                resolve(new Blob(chunks).arrayBuffer())
                            } else {
                                chunks.push(value)
                                loaded += value.length
                                progress(loaded / total)
                                reader.read().then(nextChunk, reject)
                            }
                        }
                        reader.read().then(nextChunk, reject)
                    })
                })
                .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
                .then(audioBuffer => ([fromAudioBuffer(audioBuffer), {
                    bpm,
                    name,
                    duration: audioBuffer.duration,
                    sample_rate: audioBuffer.sampleRate
                }])))
    }

    const fromAudioBuffer = (buffer: AudioBuffer): AudioData => ({
        frames: Arrays.create(channel => buffer.getChannelData(channel), buffer.numberOfChannels),
        sampleRate: buffer.sampleRate,
        numberOfFrames: buffer.length,
        numberOfChannels: buffer.numberOfChannels
    })

    export const upload = async (arrayBuffer: ArrayBuffer, metaData: AudioMetaData) => {
        const progress = new DefaultObservableValue(0.0)
        const dialogHandler = showProcessDialog("Uploading", progress)
        const formData = new FormData()
        Object.entries(metaData).forEach(([key, value]) => formData.set(key, String(value)))
        const params = new URLSearchParams(location.search)
        const accessKey = asDefined(params.get("access-key"), "Cannot upload without access-key.")
        formData.set("key", accessKey)
        formData.append("file", new Blob([arrayBuffer]))
        console.log("upload data", Array.from(formData.entries()), arrayBuffer.byteLength)
        const xhr = new XMLHttpRequest()
        xhr.upload.addEventListener("progress", (event: ProgressEvent) => {
            if (event.lengthComputable) {
                progress.setValue(event.loaded / event.total)
            }
        })
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                dialogHandler.close()
                if (xhr.status === 200) {
                    showInfoDialog({message: xhr.responseText})
                } else {
                    const {
                        status,
                        value
                    } = tryCatch(() => JSON.parse(xhr.responseText).message ?? "Unknown error message")
                    showInfoDialog({
                        headline: "Upload Failure",
                        message: status === "success" ? value : "Unknown error"
                    })
                }
            }
        }
        xhr.open("POST", `${ApiRoot}/upload.php`, true)
        xhr.setRequestHeader("Authorization", `Basic ${base64Credentials}`)
        xhr.send(formData)
    }
}