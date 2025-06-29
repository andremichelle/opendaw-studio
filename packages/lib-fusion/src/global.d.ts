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
    values(): AsyncIterableIterator<FileSystemHandle>
}