import {ppqn} from "dsp"
import {byte, int, Nullable, Terminable, unitValue, UUID} from "std"
import {AudioData} from "@/audio-engine-shared/AudioData.ts"
import {ClipSequencingUpdates} from "@/audio-engine-shared/ClipNotifications.ts"

export interface EngineCommands extends Terminable {
    setPlaying(value: boolean): void
    setRecording(value: boolean): void
    setPosition(position: ppqn): void
    setMetronomeEnabled(enabled: boolean): void
    // full stop and clear all buffers
    stopAndReset(): void
    queryLoadingComplete(): Promise<boolean>
    // throws a test error while processing audio
    panic(): void
    // feeds a note request into an audio-unit identified by uuid
    noteOn(uuid: UUID.Format, pitch: byte, velocity: unitValue): void
    noteOff(uuid: UUID.Format, pitch: byte): void
    // timeline clip playback management
    scheduleClipPlay(clipIds: ReadonlyArray<UUID.Format>): void
    scheduleClipStop(trackIds: ReadonlyArray<UUID.Format>): void
}

export interface EngineToClient {
    log(message: string): void
    fetchAudio(uuid: UUID.Format): Promise<AudioData>
    notifyClipSequenceChanges(changes: ClipSequencingUpdates): void
    switchMarkerState(state: Nullable<[UUID.Format, int]>): void
    ready(): void
}