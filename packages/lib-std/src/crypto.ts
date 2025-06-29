// We do not want to include DOM as a library in ts-config
// For some strange reason, crypto is not included in WebWorker

export type Crypto = {
    subtle: {
        digest(algorithm: string, data: ArrayBufferView | ArrayBuffer): Promise<ArrayBuffer>
    }
    getRandomValues<T extends ArrayBufferView | null>(array: T): T
}