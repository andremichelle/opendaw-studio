import {AudioSample} from "@/audio/AudioSample"
import {Dialog} from "@/ui/components/Dialog"
import {IconSymbol} from "@core/IconSymbol.ts"
import {Surface} from "@/ui/surface/Surface"
import {createElement} from "jsx"
import {showInfoDialog} from "@/ui/components/dialogs"
import {isDefined, UUID} from "std"
import {StudioService} from "@/service/StudioService"
import {Promises} from "runtime"
import {Errors, Files} from "dom"

const SampleFileTypes: Array<FilePickerAcceptType> = [
    {description: "openDAW audio-files", accept: {"application/octet-stream": [".wav"]}}
]

export namespace SampleDialogs {
    export const nativeFileBrowser = async (multiple: boolean = true) =>
        Promises.tryCatch(Files.open({types: SampleFileTypes, multiple}))

    export const missingSampleDialog = async (service: StudioService, uuid: UUID.Format, name: string): Promise<AudioSample> => {
        const {resolve, reject, promise} = Promise.withResolvers<AudioSample>()
        const dialog: HTMLDialogElement = (
            <Dialog headline="Missing Sample"
                    icon={IconSymbol.Waveform}
                    cancelable={true}
                    buttons={[{
                        text: "Ignore",
                        primary: false,
                        onClick: handler => {
                            reject(Errors.AbortError)
                            handler.close()
                        }
                    }, {
                        text: "Browse",
                        primary: true,
                        onClick: async handler => {
                            const {error, status, value: files} = await SampleDialogs.nativeFileBrowser(false)
                            if (status === "rejected") {
                                if (!Errors.isAbort(error)) {
                                    throw error
                                }
                                return
                            }
                            const file = files?.at(0)
                            if (isDefined(file)) {
                                const {
                                    status,
                                    value: sample
                                } = await Promises.tryCatch(
                                    service.importSample({
                                        uuid,
                                        name: file.name,
                                        arrayBuffer: await file.arrayBuffer()
                                    }))
                                if (status === "resolved") {
                                    handler.close()
                                    resolve(sample)
                                }
                            }
                        }
                    }]}>
                <div
                    style={{
                        padding: "1em 0",
                        display: "grid",
                        gridTemplateColumns: "auto 1fr",
                        columnGap: "1em"
                    }}>{name}</div>
            </Dialog>
        )
        dialog.oncancel = () => reject(Errors.AbortError)
        Surface.get().flyout.appendChild(dialog)
        dialog.showModal()
        return promise
    }

    export const showEditSampleDialog = async (sample: AudioSample): Promise<AudioSample> => {
        if (sample.cloud) {
            return Promise.reject("Cannot change sample from the cloud")
        }
        const {resolve, reject, promise} = Promise.withResolvers<AudioSample>()
        const inputName: HTMLInputElement = <input className="default"
                                                   type="text"
                                                   value={sample.name}
                                                   placeholder="Enter a name"/>
        inputName.select()
        inputName.focus()
        const inputBpm: HTMLInputElement = <input className="default" type="number" value={String(sample.bpm)}/>
        const approve = () => {
            const name = inputName.value
            if (name.trim().length < 3) {
                showInfoDialog({headline: "Invalid Name", message: "Must be at least 3 letters long."})
                return false
            }
            const bpm = parseFloat(inputBpm.value)
            if (isNaN(bpm)) {
                showInfoDialog({headline: "Invalid Bpm", message: "Must be a number."})
                return false
            }
            sample.name = name
            sample.bpm = bpm
            resolve(sample)
            return true
        }
        const dialog: HTMLDialogElement = (
            <Dialog headline="Edit Sample"
                    icon={IconSymbol.Waveform}
                    cancelable={true}
                    buttons={[{
                        text: "Save",
                        primary: true,
                        onClick: handler => {
                            if (approve()) {
                                handler.close()
                            }
                        }
                    }]}>
                <div style={{padding: "1em 0", display: "grid", gridTemplateColumns: "auto 1fr", columnGap: "1em"}}>
                    <div>Name:</div>
                    {inputName}
                    <div>Bpm:</div>
                    {inputBpm}
                </div>
            </Dialog>
        )
        dialog.oncancel = () => reject(Errors.AbortError)
        dialog.onkeydown = event => {
            if (event.code === "Enter") {
                if (approve()) {
                    dialog.close()
                }
            }
        }
        Surface.get().flyout.appendChild(dialog)
        dialog.showModal()
        return promise
    }
}