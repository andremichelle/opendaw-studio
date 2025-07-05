import {ProjectSession} from "@/project/ProjectSession"
import {DefaultObservableValue, MutableObservableValue, ObservableValue, Observer, Option, Terminable, UUID} from "std"
import {ProjectDialogs} from "@/project/ProjectDialogs"
import {Projects} from "@/project/Projects"
import {Project} from "@/project/Project"
import {ProjectMeta} from "@/project/ProjectMeta"
import {showApproveDialog, showInfoDialog, showProcessDialog, showProcessMonolog} from "@/ui/components/dialogs"
import {StudioService} from "./StudioService"
import {Promises} from "runtime"
import {FilePickerAcceptTypes} from "@/ui/FilePickerAcceptTypes.ts"
import {Errors, Files} from "dom"

export class SessionService implements MutableObservableValue<Option<ProjectSession>> {
    readonly #service: StudioService
    readonly #session: DefaultObservableValue<Option<ProjectSession>>

    constructor(service: StudioService) {
        this.#service = service
        this.#session = new DefaultObservableValue<Option<ProjectSession>>(Option.None)
    }

    getValue(): Option<ProjectSession> {return this.#session.getValue()}
    setValue(value: Option<ProjectSession>): void {this.#session.setValue(value)}
    subscribe(observer: Observer<ObservableValue<Option<ProjectSession>>>): Terminable {
        return this.#session.subscribe(observer)
    }
    catchupAndSubscribe(observer: Observer<ObservableValue<Option<ProjectSession>>>): Terminable {
        observer(this)
        return this.#session.subscribe(observer)
    }

    async save(): Promise<void> {
        return this.#session.getValue()
            .ifSome(session => session.saved() ? session.save() : this.saveAs())
    }

    async saveAs(): Promise<void> {
        return this.#session.getValue().ifSome(async session => {
            const {status, value: meta} = await Promises.tryCatch(ProjectDialogs.showSaveDialog({
                headline: "Save Project",
                meta: session.meta
            }))
            if (status === "rejected") {return}
            const optSession = await session.saveAs(meta)
            optSession.ifSome(session => this.#session.setValue(Option.wrap(session)))
        })
    }

    async browse(): Promise<void> {
        const {status, value} = await Promises.tryCatch(ProjectDialogs.showBrowseDialog(this.#service))
        if (status === "resolved") {
            const [uuid, meta] = value
            await this.loadExisting(uuid, meta)
        }
    }

    async loadExisting(uuid: UUID.Format, meta: ProjectMeta) {
        console.debug(UUID.toString(uuid))
        const project = await Projects.loadProject(this.#service, uuid)
        const cover = await Projects.loadCover(uuid)
        this.#setSession(uuid, project, meta, cover, true)
    }

    async loadTemplate(name: string): Promise<unknown> {
        console.debug(`load '${name}'`)
        const handler = showProcessMonolog("Loading Template...")
        return fetch(`templates/${name}.od`)
            .then(res => res.arrayBuffer())
            .then(arrayBuffer => {
                const uuid = UUID.generate()
                const project = Project.load(this.#service, arrayBuffer)
                const meta = ProjectMeta.init(name)
                this.#setSession(uuid, project, meta, Option.None)
            })
            .catch(reason => {
                console.warn("Could not load template", reason)
                showInfoDialog({headline: "Could not load template", message: "Please try again."})
            })
            .finally(() => handler.close())
    }

    async exportZip() {
        return this.#session.getValue().ifSome(async session => {
            const progress = new DefaultObservableValue(0.0)
            const processDialog = showProcessDialog("Bundling Project...", progress)
            const arrayBuffer = await Projects.exportBundle(session, progress)
            processDialog.close()
            const {status} = await Promises.tryCatch(showApproveDialog({
                headline: "Save Project Bundle",
                message: "",
                approveText: "Save"
            }))
            if (status === "rejected") {return}
            try {
                await Files.save(arrayBuffer, {
                    suggestedName: `${session.meta.name}.odb`,
                    types: [FilePickerAcceptTypes.ProjectBundleFileType],
                    startIn: "desktop"
                })
            } catch (error) {
                if (!Errors.isAbort(error)) {
                    showInfoDialog({headline: "Could not export project", message: String(error)})
                }
            }
        })
    }

    async importZip() {
        try {
            const [file] = await Files.open({types: [FilePickerAcceptTypes.ProjectBundleFileType]})
            const session = await Projects.importBundle(this.#service, await file.arrayBuffer())
            this.#session.setValue(Option.wrap(session))
        } catch (error) {
            if (!Errors.isAbort(error)) {
                showInfoDialog({headline: "Could not load project", message: String(error)})
            }
        }
    }

    async saveFile() {
        this.#session.getValue().ifSome(async session => {
            const arrayBuffer = session.project.toArrayBuffer() as ArrayBuffer
            try {
                const fileName = await Files.save(arrayBuffer, {
                    suggestedName: "project.od",
                    types: [FilePickerAcceptTypes.ProjectFileType]
                })
                showInfoDialog({message: `Project '${fileName}' saved successfully!`})
            } catch (error) {
                if (!Errors.isAbort(error)) {
                    showInfoDialog({message: `Error saving project: ${error}`})
                }
            }
        })
    }

    async loadFile() {
        try {
            const [file] = await Files.open({types: [FilePickerAcceptTypes.ProjectFileType]})
            const project = Project.load(this.#service, await file.arrayBuffer())
            this.#setSession(UUID.generate(), project, ProjectMeta.init(file.name), Option.None)
        } catch (error) {
            if (!Errors.isAbort(error)) {
                showInfoDialog({headline: "Could not load project", message: String(error)}).then()
            }
        }
    }

    fromProject(project: Project, name: string): void {
        this.#setSession(UUID.generate(), project, ProjectMeta.init(name), Option.None)
    }

    #setSession(...args: ConstructorParameters<typeof ProjectSession>): void {
        this.#session.setValue(Option.wrap(this.#createSession(...args)))
    }

    #createSession(...args: ConstructorParameters<typeof ProjectSession>): ProjectSession {
        return new ProjectSession(...args)
    }
}