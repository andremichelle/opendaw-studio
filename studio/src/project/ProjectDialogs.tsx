import {Dialog} from "@/ui/components/Dialog"
import {IconSymbol} from "@core/IconSymbol.ts"
import {Surface} from "@/ui/surface/Surface"
import {createElement} from "jsx"
import {isDefined, Objects, Terminator, UUID} from "std"
import {ProjectMeta} from "@/project/ProjectMeta"
import {StudioService} from "@/service/StudioService"
import {ProjectBrowser} from "@/project/ProjectBrowser"
import {ExportStemsConfiguration} from "@core/shared/EngineProcessorOptions"
import {EditableExportStemsConfiguration, ExportStemsConfigurator} from "@/service/ExportStemsConfigurator"
import {Project} from "./Project"
import {Errors} from "dom"

export namespace ProjectDialogs {

    export const showSaveDialog = async ({headline, meta}: {
        headline: string,
        meta?: ProjectMeta
    }): Promise<ProjectMeta> => {
        const {resolve, reject, promise} = Promise.withResolvers<ProjectMeta>()
        const inputField: HTMLInputElement = <input className="default" type="text" placeholder="Enter a name"/>
        if (isDefined(meta)) {
            inputField.value = meta.name
            inputField.select()
            inputField.focus()
        }
        const approve = () => {
            const date = new Date().toISOString()
            resolve({
                name: inputField.value,
                description: "",
                tags: [],
                created: date,
                modified: date
            })
        }
        const dialog: HTMLDialogElement = (
            <Dialog headline={headline}
                    icon={IconSymbol.FileList}
                    cancelable={true}
                    buttons={[{
                        text: "Save",
                        primary: true,
                        onClick: handler => {
                            handler.close()
                            approve()
                        }
                    }]}>
                <div style={{padding: "1em 0", display: "grid", gridTemplateColumns: "auto 1fr", columnGap: "1em"}}>
                    <div>Name:</div>
                    {inputField}
                </div>
            </Dialog>
        )
        dialog.oncancel = () => reject("cancel")
        dialog.onkeydown = event => {
            if (event.code === "Enter") {
                dialog.close()
                approve()
            }
        }
        Surface.get().flyout.appendChild(dialog)
        dialog.showModal()
        return promise
    }

    export const showBrowseDialog = async (service: StudioService): Promise<[UUID.Format, ProjectMeta]> => {
        const {resolve, reject, promise} = Promise.withResolvers<[UUID.Format, ProjectMeta]>()
        const dialog: HTMLDialogElement = (
            <Dialog headline={"Browse Projects"}
                    icon={IconSymbol.FileList}
                    buttons={[{text: "Ok", onClick: () => dialog.close()}]}
                    cancelable={true}>
                <div style={{height: "2em"}}/>
                <ProjectBrowser service={service} select={(result) => {
                    resolve(result)
                    dialog.close()
                }}/>
            </Dialog>
        )
        dialog.oncancel = () => reject("cancel")
        dialog.onkeydown = event => {if (event.code === "Enter") {dialog.close()}}
        Surface.get().flyout.appendChild(dialog)
        dialog.showModal()
        return promise
    }

    export const showExportStemsDialog = async (project: Project): Promise<ExportStemsConfiguration> => {
        const {resolve, reject, promise} = Promise.withResolvers<ExportStemsConfiguration>()
        const terminator = new Terminator()
        const configuration: EditableExportStemsConfiguration = Object
            .fromEntries(project.rootBoxAdapter.audioUnits.adapters()
                .map(unit => ([
                    UUID.toString(unit.uuid),
                    {
                        type: unit.type,
                        label: unit.input.label.unwrap(),
                        include: !unit.isOutput,
                        includeAudioEffects: true,
                        includeSends: true,
                        fileName: ExportStemsConfiguration.sanitizeFileName(unit.input.label.unwrap())
                    }
                ])))
        const dialog: HTMLDialogElement = (
            <Dialog headline={"Export Stems"}
                    icon={IconSymbol.FileList}
                    buttons={[
                        {
                            text: "Cancel",
                            onClick: () => {
                                dialog.close()
                                reject(Errors.AbortError)
                            }
                        },
                        {
                            text: "Export", onClick: () => {
                                resolve(Object.fromEntries(
                                    Object.entries(configuration)
                                        .filter(([_, value]) => value.include)
                                        .map(([key, value]) => [key,
                                            Objects.include(value, ...([
                                                "includeAudioEffects",
                                                "includeSends",
                                                "fileName"
                                            ] as const))])) as ExportStemsConfiguration)
                                dialog.close()
                            },
                            primary: true
                        }
                    ]}
                    cancelable={true}>
                <ExportStemsConfigurator lifecycle={terminator} configuration={configuration}/>
            </Dialog>
        )
        dialog.oncancel = () => reject(Errors.AbortError)
        dialog.onkeydown = event => {if (event.code === "Enter") {dialog.close()}}
        Surface.get().flyout.appendChild(dialog)
        dialog.showModal()
        return promise.finally(() => terminator.terminate())
    }
}