import {ppqn} from "lib-dsp"
import {
    byte,
    DefaultObservableValue,
    int,
    MutableObservableValue,
    Nullable,
    ObservableValue,
    Observer,
    Subscription,
    unitValue,
    UUID
} from "lib-std"
import {ClipNotification} from "studio-adapters"

export interface Engine {
    position(): ObservableValue<ppqn>
    isPlaying(): MutableObservableValue<boolean>
    isRecording(): MutableObservableValue<boolean>
    metronomeEnabled(): MutableObservableValue<boolean>
    isReady(): Promise<void>
    queryLoadingComplete(): Promise<boolean>
    stop(): void
    panic(): void
    noteOn(uuid: UUID.Format, pitch: byte, velocity: unitValue): void
    noteOff(uuid: UUID.Format, pitch: byte): void
    scheduleClipPlay(...clipIds: ReadonlyArray<UUID.Format>): void
    scheduleClipStop(...trackIds: ReadonlyArray<UUID.Format>): void
    requestPosition(position: ppqn): void
    subscribeClipNotification(observer: Observer<ClipNotification>): Subscription
    markerState(): DefaultObservableValue<Nullable<[UUID.Format, int]>>
}