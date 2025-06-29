export namespace Compression {
    export const encode = async (buffer: ArrayBuffer, format: CompressionFormat = "gzip"): Promise<ArrayBuffer> => {
        const stream = new CompressionStream(format)
        const writer = stream.writable.getWriter()
        writer.write(new Uint8Array(buffer))
        writer.close()
        return new Response(stream.readable).arrayBuffer()
    }

    export const decode = async (buffer: ArrayBuffer, format: CompressionFormat = "gzip"): Promise<ArrayBuffer> => {
        const stream = new DecompressionStream(format)
        const writer = stream.writable.getWriter()
        writer.write(new Uint8Array(buffer))
        writer.close()
        return new Response(stream.readable).arrayBuffer()
    }
}