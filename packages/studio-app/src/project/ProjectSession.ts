import {ProjectMeta} from "@/project/ProjectMeta"
import {Project} from "./Project"
import {Notifier, Observer, Option, Subscription, UUID} from "lib-std"
import {Projects} from "@/project/Projects"
import {showApproveDialog} from "@/ui/components/dialogs"
import {Promises} from "lib-runtime"
import {MidiDeviceAccess} from "@/midi/devices/MidiDeviceAccess"

export class ProjectSession {
    readonly #uuid: UUID.Format
    readonly #project: Project
    readonly #meta: ProjectMeta

    #cover: Option<ArrayBuffer>

    readonly #metaUpdated: Notifier<ProjectMeta>

    #saved: boolean
    #hasChanges: boolean = false

    constructor(uuid: UUID.Format,
                project: Project,
                meta: ProjectMeta,
                cover: Option<ArrayBuffer>,
                hasBeenSaved: boolean = false) {
        this.#uuid = uuid
        this.#project = project
        this.#meta = meta
        this.#cover = cover

        this.#saved = hasBeenSaved
        this.#metaUpdated = new Notifier<ProjectMeta>()
    }

    get uuid(): UUID.Format {return this.#uuid}
    get project(): Project {return this.#project}
    get meta(): ProjectMeta {return this.#meta}
    get cover(): Option<ArrayBuffer> {return this.#cover}

    async save(): Promise<void> {
        this.updateModifyDate()
        this.saveMidiConfiguration()
        return this.#saved
            ? Projects.saveProject(this).then(() => {this.#hasChanges = false})
            : Promise.reject("Project has not been saved")
    }

    async saveAs(meta: ProjectMeta): Promise<Option<ProjectSession>> {
        Object.assign(this.meta, meta)
        this.updateModifyDate()
        if (this.#saved) {
            // Copy project
            const uuid = UUID.generate()
            const midiConnections = this.project.midiDevices.toJSON()
            const project = this.project.copy()
            const meta = ProjectMeta.copy(this.meta)
            const session = new ProjectSession(uuid, project, meta, Option.None, true)
            project.midiDevices.fromJSON(midiConnections)
            session.saveMidiConfiguration()
            await Projects.saveProject(session)
            return Option.wrap(session)
        } else {
            // Save project
            return Projects.saveProject(this).then(() => {
                this.#saved = true
                this.#hasChanges = false
                this.#metaUpdated.notify(this.meta)
                return Option.None
            })
        }
    }

    saved(): boolean {return this.#saved}
    hasChanges(): boolean {return this.#hasChanges}

    subscribeMetaData(observer: Observer<ProjectMeta>): Subscription {
        return this.#metaUpdated.subscribe(observer)
    }

    catchSubscribeMetaData(observer: Observer<ProjectMeta>): Subscription {
        observer(this.meta)
        return this.subscribeMetaData(observer)
    }

    updateCover(cover: Option<ArrayBuffer>): void {
        this.#cover = cover
        this.#hasChanges = true
    }

    updateMetaData<KEY extends keyof ProjectMeta>(key: KEY, value: ProjectMeta[KEY]): void {
        if (this.meta[key] === value) {return}
        this.meta[key] = value
        this.#hasChanges = true
        this.#metaUpdated.notify(this.meta)
    }

    updateModifyDate(): void {this.meta.modified = new Date().toISOString()}

    saveMidiConfiguration(): void {
        const key = UUID.toString(this.#uuid)
        console.debug(`saveMidiConfiguration(${key})`)
        this.#project.midiDevices.saveToLocalStorage(key)
    }

    async loadMidiConfiguration(): Promise<void> {
        const key = UUID.toString(this.#uuid)
        const hasMidi = this.#project.midiDevices.loadFromLocalStorage(key)
        console.debug(`loadMidiConfiguration(${key}) - hasMidi: ${hasMidi}`)
        if (!MidiDeviceAccess.available().getValue() && hasMidi) {
            const {status} = await Promises.tryCatch(showApproveDialog({
                headline: "Midi Configuration Found",
                approveText: "Connect",
                message: "Connect your midi-device and click 'connect'.",
                reverse: true
            }))
            if (status === "resolved") {
                MidiDeviceAccess.available().setValue(true)
            }
        }
    }

    toString(): string {
        return `{uuid: ${UUID.toString(this.uuid)}, meta: ${JSON.stringify(this.meta)}}`
    }
}