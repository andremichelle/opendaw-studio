import {StudioService} from "@/service/StudioService.ts"
import {ProjectSession} from "./project/ProjectSession"
import {Promises} from "opendaw-runtime"
import {OpfsAgent} from "@/service/agents.ts"
import {Project} from "@/project/Project.ts"
import {Option, Provider, UUID} from "opendaw-std"
import {ProjectMeta} from "@/project/ProjectMeta.ts"

export class Recovery {
    static readonly #RESTORE_FILE_PATH = ".backup"

    readonly #service: StudioService

    constructor(service: StudioService) {this.#service = service}

    async restoreSession(): Promise<Option<ProjectSession>> {
        const backupResult = await Promises.tryCatch(OpfsAgent.list(Recovery.#RESTORE_FILE_PATH))
        if (backupResult.status === "rejected" || backupResult.value.length === 0) {return Option.None}
        const readResult = await Promises.tryCatch(Promise.all([
            OpfsAgent.read(`${Recovery.#RESTORE_FILE_PATH}/uuid`)
                .then(x => UUID.validate(x)),
            OpfsAgent.read(`${Recovery.#RESTORE_FILE_PATH}/project.od`)
                .then(x => Project.load(this.#service, x.buffer as ArrayBuffer)),
            OpfsAgent.read(`${Recovery.#RESTORE_FILE_PATH}/meta.json`)
                .then(x => JSON.parse(new TextDecoder().decode(x.buffer as ArrayBuffer)) as ProjectMeta),
            OpfsAgent.read(`${Recovery.#RESTORE_FILE_PATH}/saved`)
                .then(x => x.at(0) === 1)
        ]))
        const deleteResult = await Promises.tryCatch(OpfsAgent.delete(Recovery.#RESTORE_FILE_PATH))
        console.debug(`delete backup: "${deleteResult.status}"`)
        if (readResult.status === "rejected") {return Option.None}
        const [uuid, project, meta, saved] = readResult.value
        const session = new ProjectSession(uuid, project, meta, Option.None, saved)
        console.debug(`restore ${session}, saved: ${saved}`)
        return Option.wrap(session)
    }

    createBackupCommand(): Option<Provider<Promise<void>>> {
        return this.#service.sessionService.getValue().map((session: ProjectSession) => async () => {
            console.debug("temp storing project")
            const {project, meta, uuid} = session
            return Promises.tryCatch(Promise.all([
                OpfsAgent.write(`${Recovery.#RESTORE_FILE_PATH}/uuid`, uuid),
                OpfsAgent.write(`${Recovery.#RESTORE_FILE_PATH}/project.od`, new Uint8Array(project.toArrayBuffer())),
                OpfsAgent.write(`${Recovery.#RESTORE_FILE_PATH}/meta.json`, new TextEncoder().encode(JSON.stringify(meta))),
                OpfsAgent.write(`${Recovery.#RESTORE_FILE_PATH}/saved`, new Uint8Array([session.saved() ? 1 : 0]))
            ])).then(result => console.debug(`backup result: ${result.status}`))
        })
    }
}