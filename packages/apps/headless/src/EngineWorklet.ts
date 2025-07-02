import WorkletUrl from "studio-worklet/EngineProcessor.ts?worker&url"
import {
    Arrays,
    byte,
    DefaultObservableValue,
    int,
    MutableObservableValue,
    Notifier,
    Nullable,
    Observer,
    Option,
    Subscription,
    SyncStream,
    Terminator,
    unitValue,
    UUID
} from "lib-std"
import {ppqn} from "lib-dsp"
import {
    AudioData,
    ClipNotification,
    ClipSequencingUpdates,
    EngineCommands,
    EngineProcessorOptions,
    EngineState,
    EngineStateSchema,
    EngineToClient,
    ExportStemsConfiguration
} from "studio-adapters"
import {SyncSource} from "lib-box"
import {AnimationFrame} from "lib-dom"
import {Communicator, Messenger} from "lib-runtime"
import {BoxIO} from "studio-boxes"
import {Project} from "@/Project"
import {WorkletFactory} from "@/WorkletFactory"

export class EngineWorklet extends AudioWorkletNode {
    static bootFactory(context: BaseAudioContext): Promise<WorkletFactory<EngineWorklet>> {
        return WorkletFactory.boot(context, WorkletUrl)
    }

    static ID: int = 0 | 0

    readonly id = EngineWorklet.ID++

    readonly #terminator: Terminator = new Terminator()
    readonly #playbackTimestamp: DefaultObservableValue<ppqn> = new DefaultObservableValue(0.0)
    readonly #position: DefaultObservableValue<ppqn> = new DefaultObservableValue(0.0)
    readonly #isPlaying: DefaultObservableValue<boolean> = new DefaultObservableValue(false)
    readonly #isRecording: DefaultObservableValue<boolean> = new DefaultObservableValue(false)
    readonly #metronomeEnabled: DefaultObservableValue<boolean> = new DefaultObservableValue(false)
    readonly #markerState: DefaultObservableValue<Nullable<[UUID.Format, int]>> = new DefaultObservableValue(null)
    readonly #notifyClipNotification: Notifier<ClipNotification>
    readonly #playingClips: Array<UUID.Format>
    readonly #commands: EngineCommands
    readonly #isReady: Promise<void>

    #ignoreUpdates: boolean = false

    constructor(context: BaseAudioContext,
                project: Readonly<Project>,
                exportConfiguration?: ExportStemsConfiguration) {
        const numberOfChannels = ExportStemsConfiguration.countStems(Option.wrap(exportConfiguration)) * 2
        const reader = SyncStream.reader<EngineState>(EngineStateSchema(), state => {
            this.#ignoreUpdates = true
            this.#position.setValue(state.position)
            this.#ignoreUpdates = false
        })

        super(context, "engine-processor", {
                numberOfInputs: 0,
                numberOfOutputs: 1,
                outputChannelCount: [numberOfChannels],
                processorOptions: {
                    sab: reader.buffer,
                    project: project.toArrayBuffer(),
                    exportConfiguration
                } satisfies EngineProcessorOptions
            }
        )

        const {resolve, promise} = Promise.withResolvers<void>()
        const messenger = Messenger.for(this.port)
        this.#isReady = promise
        this.#notifyClipNotification = this.#terminator.own(new Notifier<ClipNotification>())
        this.#playingClips = []
        this.#commands = this.#terminator.own(
            Communicator.sender<EngineCommands>(messenger.channel("engine-commands"),
                dispatcher => new class implements EngineCommands {
                    setPlaying(value: boolean) {dispatcher.dispatchAndForget(this.setPlaying, value)}
                    setRecording(value: boolean) {dispatcher.dispatchAndForget(this.setRecording, value)}
                    setPosition(position: number): void {dispatcher.dispatchAndForget(this.setPosition, position)}
                    setMetronomeEnabled(enabled: boolean): void {dispatcher.dispatchAndForget(this.setMetronomeEnabled, enabled)}
                    stopAndReset(): void {dispatcher.dispatchAndForget(this.stopAndReset)}
                    queryLoadingComplete(): Promise<boolean> {
                        return dispatcher.dispatchAndReturn(this.queryLoadingComplete)
                    }
                    panic(): void {dispatcher.dispatchAndForget(this.panic)}
                    noteOn(uuid: UUID.Format, pitch: byte, velocity: unitValue): void {
                        dispatcher.dispatchAndForget(this.noteOn, uuid, pitch, velocity)
                    }
                    noteOff(uuid: UUID.Format, pitch: byte): void {
                        dispatcher.dispatchAndForget(this.noteOff, uuid, pitch)
                    }
                    scheduleClipPlay(clipIds: ReadonlyArray<UUID.Format>): void {
                        dispatcher.dispatchAndForget(this.scheduleClipPlay, clipIds)
                    }
                    scheduleClipStop(trackIds: ReadonlyArray<UUID.Format>): void {
                        dispatcher.dispatchAndForget(this.scheduleClipStop, trackIds)
                    }
                    terminate(): void {dispatcher.dispatchAndForget(this.terminate)}
                }))
        Communicator.executor<EngineToClient>(messenger.channel("engine-to-client"), {
                log: (message: string): void => console.log("WORKLET", message),
                ready: (): void => resolve(),
                fetchAudio: (uuid: UUID.Format): Promise<AudioData> => {
                    return new Promise((resolve, reject) => {
                        const handler = project.audioManager.getOrCreateAudioLoader(uuid)
                        handler.subscribe(state => {
                            if (state.type === "error") {
                                reject(state.reason)
                            } else if (state.type === "loaded") {
                                resolve(handler.data.unwrap())
                            }
                        })
                    })
                },
                notifyClipSequenceChanges: (changes: ClipSequencingUpdates): void => {
                    changes.stopped.forEach(uuid => {
                        for (let i = 0; i < this.#playingClips.length; i++) {
                            if (UUID.equals(this.#playingClips[i], uuid)) {
                                this.#playingClips.splice(i, 1)
                                break
                            }
                        }
                    })
                    changes.started.forEach(uuid => this.#playingClips.push(uuid))
                    this.#notifyClipNotification.notify({type: "sequencing", changes})
                },
                switchMarkerState: (state: Nullable<[UUID.Format, int]>): void => this.#markerState.setValue(state)
            } satisfies EngineToClient
        )
        this.#terminator.ownAll(
            AnimationFrame.add(() => reader.tryRead()),
            project.liveStreamReceiver.connect(messenger.channel("engine-live-data")),
            new SyncSource<BoxIO.TypeMap>(project.boxGraph, messenger.channel("engine-sync"), false),
            this.#isPlaying.catchupAndSubscribe(owner => {
                const isPlaying = owner.getValue()
                if (isPlaying) {
                    this.#commands.setPosition(this.#playbackTimestamp.getValue())
                } else if (this.#isRecording.getValue()) {
                    this.#isRecording.setValue(false)
                }
                this.#commands.setPlaying(isPlaying)
            }),
            this.#isRecording.subscribe(owner => {
                const willRecord = owner.getValue()
                this.#commands.setPlaying(willRecord)
                this.#commands.setRecording(willRecord)
            }),
            this.#metronomeEnabled.catchupAndSubscribe(owner => this.#commands.setMetronomeEnabled(owner.getValue())),
            this.#position.catchupAndSubscribe(owner => {
                if (!this.#ignoreUpdates) {this.#commands.setPosition(owner.getValue())}
            })
        )
    }

    stop(): void {
        if (!this.#isPlaying.getValue() && this.#position.getValue() === 0.0) {
            this.#commands.stopAndReset()
        } else {
            this.#isRecording.setValue(false)
            this.#isPlaying.setValue(false)
            this.requestPosition(0.0)
        }
    }
    panic(): void {this.#commands.panic()}
    isPlaying(): MutableObservableValue<boolean> {return this.#isPlaying}
    isRecording(): MutableObservableValue<boolean> {return this.#isRecording}
    playbackTimestamp(): DefaultObservableValue<number> {return this.#playbackTimestamp}
    position(): MutableObservableValue<ppqn> {return this.#position}
    metronomeEnabled(): DefaultObservableValue<boolean> {return this.#metronomeEnabled}
    isReady(): Promise<void> {return this.#isReady}
    queryLoadingComplete(): Promise<boolean> {return this.#commands.queryLoadingComplete()}
    noteOn(uuid: UUID.Format, pitch: byte, velocity: unitValue): void {this.#commands.noteOn(uuid, pitch, velocity)}
    noteOff(uuid: UUID.Format, pitch: byte): void {this.#commands.noteOff(uuid, pitch)}
    scheduleClipPlay(...clipIds: ReadonlyArray<UUID.Format>): void {
        this.#notifyClipNotification.notify({type: "waiting", clips: clipIds})
        this.#commands.scheduleClipPlay(clipIds)
        this.#isPlaying.setValue(true) // must be second, since they might be executed in different blocks
    }
    scheduleClipStop(...trackIds: ReadonlyArray<UUID.Format>): void {
        this.#commands.scheduleClipStop(trackIds)
    }
    requestPosition(position: ppqn): void {
        this.#playbackTimestamp.setValue(position)
        this.#commands.setPosition(position)
    }
    subscribeClipNotification(observer: Observer<ClipNotification>): Subscription {
        observer({
            type: "sequencing",
            changes: {started: this.#playingClips, stopped: Arrays.empty(), obsolete: Arrays.empty()}
        })
        return this.#notifyClipNotification.subscribe(observer)
    }

    markerState(): DefaultObservableValue<Nullable<[UUID.Format, int]>> {
        return this.#markerState
    }

    terminate(): void {
        console.debug(`terminate EngineClient id: ${this.id}`)
        this.#terminator.terminate()
        this.disconnect()
    }
}