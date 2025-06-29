import {FieldKey, Fields} from "./field"
import {assert, ByteArrayInput, ByteArrayOutput, DataInput, DataOutput} from "lib-std"

export namespace Serializer {
    const MAGIC_HEADER = 0x464c4453
    export const writeFields = <FIELDS extends Fields>(output: DataOutput, fields: FIELDS) => {
        const entries = Object.entries(fields)
        output.writeInt(MAGIC_HEADER)
        output.writeShort(entries.length)
        entries.forEach(([key, field]) => {
            const bytes = ByteArrayOutput.create()
            field.write(bytes)
            const buffer = new Int8Array(bytes.toArrayBuffer())
            output.writeShort(Number(key))
            output.writeInt(buffer.length)
            output.writeBytes(buffer)
        })
    }

    export const readFields = <FIELDS extends Fields>(input: DataInput, fields: FIELDS) => {
        assert(input.readInt() === MAGIC_HEADER, "Serializer header is corrupt")
        const numFields = input.readShort()
        for (let fieldIndex = 0; fieldIndex < numFields; fieldIndex++) {
            const key: FieldKey = input.readShort()
            const byteLength = input.readInt()
            const bytes = new Int8Array(byteLength)
            input.readBytes(bytes)
            fields[key]?.read(new ByteArrayInput(bytes.buffer))
        }
    }
}