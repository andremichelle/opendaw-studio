import {EngineWorklet} from "@/audio-engine/EngineWorklet"
import {RecordingWorklet} from "@/audio-engine/RecordingWorklet"
import {PeakMeterWorket} from "@/audio-engine/PeakMeterWorket"
import {WorkletFactory} from "@/audio-engine/WorkletFactory"

export interface AudioWorklets {
    engine: WorkletFactory<EngineWorklet>
    peakMeter: WorkletFactory<PeakMeterWorket>
    recording: WorkletFactory<RecordingWorklet>
}

export namespace AudioWorklets {
    export const install = async (context: AudioContext): Promise<AudioWorklets> => {
        return Promise.all([
            EngineWorklet.bootFactory(context),
            PeakMeterWorket.bootFactory(context),
            RecordingWorklet.bootFactory(context)
        ]).then(([engine, peakMeter, recording]) => ({engine, peakMeter, recording}))
    }
}