import {AudioData} from "@/audio-engine-shared/AudioData.ts"
import {ProgressHandler, UUID} from "std"
import {AudioMetaData} from "@/audio/AudioMetaData"

export interface AudioServerApi {
    fetch(uuid: UUID.Format, progress: ProgressHandler): Promise<[AudioData, AudioMetaData]>
}