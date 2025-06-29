import {Entry, OpfsProtocol} from "./OpfsProtocol"
import {Arrays, asDefined} from "lib-std"
import {Communicator, Messenger, Promises} from "lib-runtime"

export namespace OpfsWorker {
    const DEBUG = false
    const readLimiter = new Promises.Limit<Uint8Array>(1)
    const writeLimiter = new Promises.Limit<void>(1)

    export const init = (messenger: Messenger) =>
        Communicator.executor(messenger.channel("opfs"), new class implements OpfsProtocol {
            async write(path: string, data: Uint8Array): Promise<void> {
                if (DEBUG) {console.debug(`write ${data.length}b to ${path}`)}
                return writeLimiter.add(() => this.#resolveFile(path, {create: true})
                    .then(handle => {
                        handle.truncate(data.length)
                        handle.write(data, {at: 0})
                        handle.flush()
                        handle.close()
                    }))
            }

            async read(path: string): Promise<Uint8Array> {
                if (DEBUG) {console.debug(`read ${path}`)}
                return readLimiter.add(() => this.#resolveFile(path)
                    .then(handle => {
                        const size = handle.getSize()
                        const buffer = new Uint8Array(size)
                        handle.read(buffer)
                        handle.close()
                        return buffer
                    }))
            }

            async delete(path: string): Promise<void> {
                const segments = pathToSegments(path)
                return this.#resolveFolder(segments.slice(0, -1))
                    .then(folder => folder.removeEntry(asDefined(segments.at(-1)), {recursive: true}))
            }

            async list(path: string): Promise<ReadonlyArray<Entry>> {
                const segments = pathToSegments(path)
                const {status, value: folder} = await Promises.tryCatch(this.#resolveFolder(segments))
                if (status === "rejected") {return Arrays.empty()}
                const result: Array<Entry> = []
                for await (const {name, kind} of folder.values()) {
                    result.push({name, kind})
                }
                return result
            }

            async #resolveFile(path: string, options?: FileSystemGetDirectoryOptions): Promise<FileSystemSyncAccessHandle> {
                const segments = pathToSegments(path)
                return this.#resolveFolder(segments.slice(0, -1), options)
                    .then((folder) => folder.getFileHandle(asDefined(segments.at(-1)), options)
                        .then(handle => handle.createSyncAccessHandle()))
            }

            async #resolveFolder(segments: ReadonlyArray<string>,
                                 options?: FileSystemGetDirectoryOptions): Promise<FileSystemDirectoryHandle> {
                let folder: FileSystemDirectoryHandle = await navigator.storage.getDirectory()
                for (const segment of segments) {folder = await folder.getDirectoryHandle(segment, options)}
                return folder
            }
        })

    const pathToSegments = (path: string): ReadonlyArray<string> => {
        const noSlashes = path.replace(/^\/+|\/+$/g, "")
        return noSlashes === "" ? [] : noSlashes.split("/")
    }
}