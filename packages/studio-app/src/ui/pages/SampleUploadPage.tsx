import css from "./SampleUploadPage.sass?inline"
import {createElement, PageContext, PageFactory} from "opendaw-jsx"
import {StudioService} from "@/service/StudioService.ts"
import {Files, Html} from "opendaw-dom"
import {showInfoDialog} from "@/ui/components/dialogs.tsx"
import {SampleApi} from "@/service/SampleApi.ts"
import {estimateBpm} from "opendaw-dsp"
import {encodeWavFloat} from "@/wav"
import {FilePickerAcceptTypes} from "@/ui/FilePickerAcceptTypes.ts"

const className = Html.adoptStyleSheet(css, "SampleUploadPage")

export const SampleUploadPage: PageFactory<StudioService> = ({service}: PageContext<StudioService>) => {
    return (
        <div className={className}>
            <h1>Upload Sample</h1>
            <div>
                <button onclick={async () => {
                    try {
                        const [file] = await Files.open(FilePickerAcceptTypes.WavFiles)
                        const arrayBuffer = await file.arrayBuffer()
                        if (arrayBuffer.byteLength === 0) {return}
                        const buffer = await service.context.decodeAudioData(arrayBuffer.slice())
                        if (arrayBuffer.byteLength === 0) {return}
                        const name = file.name.substring(0, file.name.lastIndexOf(".wav"))
                        const sample_rate = buffer.sampleRate
                        const duration = buffer.duration
                        const bpm = estimateBpm(duration)
                        const wav = encodeWavFloat(buffer)
                        console.debug("name", name)
                        console.debug("sampleRate", sample_rate)
                        console.debug("duration", duration)
                        console.debug("bpm", bpm)
                        await SampleApi.upload(wav, {name, bpm, sample_rate, duration})
                    } catch (error) {
                        if (error instanceof DOMException && error.name === "AbortError") {
                            console.debug("Caught an AbortError")
                        } else {
                            showInfoDialog({message: String(error)})
                        }
                    }
                }}>
                    Browse
                </button>
            </div>
        </div>
    )
}