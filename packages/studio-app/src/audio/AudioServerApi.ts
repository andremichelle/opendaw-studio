import {AudioData} from "studio-shared"
import {ProgressHandler, UUID} from "opendaw-std"
import {AudioMetaData} from "@/audio/AudioMetaData"

export interface AudioServerApi {
    fetch(uuid: UUID.Format, progress: ProgressHandler): Promise<[AudioData, AudioMetaData]>
}