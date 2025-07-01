import {AudioData} from "studio-adapters"
import {ProgressHandler, UUID} from "lib-std"
import {AudioMetaData} from "@/audio/AudioMetaData"

export interface AudioServerApi {
    fetch(uuid: UUID.Format, progress: ProgressHandler): Promise<[AudioData, AudioMetaData]>
}