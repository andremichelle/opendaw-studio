interface FileSystemFileHandle {
    createSyncAccessHandle(): Promise<FileSystemSyncAccessHandle>
}

interface FileSystemSyncAccessHandle {
    write(buffer: BufferSource, options?: { at?: number }): number
    read(buffer: BufferSource, options?: { at?: number }): number
    getSize(): number
    truncate(newSize: number): void
    flush(): void
    close(): void
}

interface FileSystemDirectoryHandle {
    entries(): AsyncIterableIterator<[string, FileSystemHandle]>
}

type AudioSinkInfo = string | { type: "none" }

interface AudioContext {
    setSinkId(id: AudioSinkInfo): Promise<void>
    get sinkId(): AudioSinkInfo
}