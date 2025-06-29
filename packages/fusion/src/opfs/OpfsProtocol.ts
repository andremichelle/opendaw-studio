export type Kind = "file" | "directory"
export type Entry = { name: string, kind: Kind }

export interface OpfsProtocol {
    write(path: string, data: Uint8Array): Promise<void>
    read(path: string): Promise<Uint8Array>
    delete(path: string): Promise<void>
    list(path: string): Promise<ReadonlyArray<Entry>>
}