import {ExportStemConfiguration} from "studio-shared"

export type AudioUnitOptions = Omit<ExportStemConfiguration, "fileName">

export namespace AudioUnitOptions {
    export const Default: AudioUnitOptions = {includeAudioEffects: true, includeSends: true}
}