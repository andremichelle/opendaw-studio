import {JSONValue} from "opendaw-std"

export type ProjectMeta = {
    name: string
    description: string
    tags: Array<string>
    created: Readonly<string>
    modified: string
    notepad?: string
} & JSONValue

export namespace ProjectMeta {
    const created = new Date().toISOString()
    export const init = (name: string = "Untitled"): ProjectMeta => ({
        name,
        description: "",
        tags: [],
        created,
        modified: created
    })

    export const copy = (meta: ProjectMeta): ProjectMeta => Object.assign({}, meta)
}