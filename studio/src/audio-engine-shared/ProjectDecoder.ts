import {AudioBusBox, AudioUnitBox, BoxIO, RootBox, TimelineBox, UserInterfaceBox} from "@core/data/boxes"
import {BoxGraph} from "box"
import {assert, ByteArrayInput, Option, UUID} from "std"
import {MandatoryBoxes} from "@/audio-engine-shared/ManadatoryBoxes.ts"

export namespace ProjectDecoder {
    export const MAGIC_HEADER_OPEN = 0x4F50454E
    export const FORMAT_VERSION = 2

    export type Skeleton = {
        boxGraph: BoxGraph<BoxIO.TypeMap>,
        mandatoryBoxes: MandatoryBoxes
    }

    export const decode = (arrayBuffer: ArrayBufferLike): Skeleton => {
        const input = new ByteArrayInput(arrayBuffer)
        assert(input.readInt() === ProjectDecoder.MAGIC_HEADER_OPEN, "Corrupt header. Probably not an openDAW project file.")
        assert(input.readInt() === ProjectDecoder.FORMAT_VERSION, "Deprecated Format")
        const boxGraphChunkLength = input.readInt()
        const boxGraphChunk = new Int8Array(boxGraphChunkLength)
        input.readBytes(boxGraphChunk)
        const boxGraph = new BoxGraph<BoxIO.TypeMap>(Option.wrap(BoxIO.create))
        boxGraph.fromArrayBuffer(boxGraphChunk.buffer)
        return {boxGraph, mandatoryBoxes: readMandatoryBoxes(boxGraph, input)}
    }

    const readMandatoryBoxes = (boxGraph: BoxGraph, input: ByteArrayInput): MandatoryBoxes => {
        const rootBox = boxGraph.findBox(UUID.fromDataInput(input)).unwrap("RootBox not found") as RootBox
        const userInterfaceBox = boxGraph.findBox(UUID.fromDataInput(input)).unwrap("UserInterfaceBox not found") as UserInterfaceBox
        const masterBusBox = boxGraph.findBox(UUID.fromDataInput(input)).unwrap("AudioBusBox not found") as AudioBusBox
        const masterAudioUnit = boxGraph.findBox(UUID.fromDataInput(input)).unwrap("AudioUnitBox not found") as AudioUnitBox
        const timelineBox = boxGraph.findBox(UUID.fromDataInput(input)).unwrap("TimelineBox not found") as TimelineBox
        return {rootBox, userInterfaceBox, masterBusBox, masterAudioUnit, timelineBox}
    }
}