import {byte, Option, SortedSet, Terminable, Terminator, UUID} from "opendaw-std"
import {PlayfieldDeviceBoxAdapter, PlayfieldSampleBoxAdapter} from "studio-shared"
import {EngineContext} from "../../EngineContext.ts"
import {DeviceProcessor} from "../../processors.ts"
import {AudioBuffer} from "../../AudioBuffer.ts"
import {Processor} from "../../processing.ts"
import {AutomatableParameter} from "../../AutomatableParameter.ts"
import {NoteEventSource, NoteEventTarget} from "../../NoteEventSource.ts"
import {PlayfieldSequencer} from "./Playfield/PlayfieldSequencer.ts"
import {MixProcessor} from "./Playfield/MixProcessor.ts"
import {SampleProcessor} from "./Playfield/SampleProcessor.ts"

export class PlayfieldDeviceProcessor implements DeviceProcessor, NoteEventTarget {
    readonly #terminator = new Terminator()
    readonly #adapter: PlayfieldDeviceBoxAdapter

    readonly #sequencer: PlayfieldSequencer
    readonly #mixProcessor: MixProcessor
    readonly #sampleSet: SortedSet<UUID.Format, {
        uuid: UUID.Format,
        processor: SampleProcessor,
        terminable: Terminable
    }>

    constructor(context: EngineContext, adapter: PlayfieldDeviceBoxAdapter) {
        this.#adapter = adapter

        this.#sequencer = this.#terminator.own(new PlayfieldSequencer(context, this))
        this.#mixProcessor = this.#terminator.own(new MixProcessor(context, this))
        this.#sampleSet = UUID.newSet(entry => entry.uuid)

        this.#terminator.ownAll(
            adapter.samples.catchupAndSubscribe({
                onAdd: (adapter: PlayfieldSampleBoxAdapter) => {
                    const processor = new SampleProcessor(context, this, adapter, this.#mixProcessor)
                    this.#sampleSet.add({
                        uuid: adapter.uuid,
                        processor,
                        terminable: context.registerEdge(this.#sequencer, processor)
                    })
                    context.audioManager.getOrCreateAudioLoader(adapter.fileUUID()) // preloading files
                },
                onRemove: (adapter: PlayfieldSampleBoxAdapter) => {
                    const {terminable, processor} = this.#sampleSet.removeByKey(adapter.uuid)
                    terminable.terminate()
                    processor.terminate()
                },
                onReorder: (_adapter: PlayfieldSampleBoxAdapter) => {}
            }),
            {
                terminate: () => {
                    this.#sampleSet.forEach(({terminable, processor}) => {
                        terminable.terminate()
                        processor.terminate()
                    })
                    this.#sampleSet.clear()
                }
            }
        )
    }

    setNoteEventSource(source: NoteEventSource): Terminable {return this.#sequencer.setNoteEventSource(source)}

    get noteEventTarget(): Option<NoteEventTarget & DeviceProcessor> {return Option.wrap(this)}

    get incoming(): Processor {return this.#sequencer}
    get outgoing(): Processor {return this.#mixProcessor}

    optSampleProcessor(note: byte): Option<SampleProcessor> {
        return this.#adapter.samples.getAdapterByIndex(note)
            .flatMap(adapter => this.#sampleSet.opt(adapter.uuid))
            .map(entry => entry.processor)
    }

    hasSolo(): boolean {
        return this.#adapter.samples.adapters().some(adapter => adapter.namedParameter.solo.getValue())
    }

    stopExcludeOthers(exclude: PlayfieldSampleBoxAdapter): void {
        for (const adapter of this.#adapter.samples.adapters()) {
            if (adapter.exclude && adapter !== exclude) {
                this.#sampleSet.opt(adapter.uuid).ifSome(({processor}) => processor.forceStop())
            }
        }
    }

    get uuid(): UUID.Format {return this.#adapter.uuid}
    get adapter(): PlayfieldDeviceBoxAdapter {return this.#adapter}
    get audioOutput(): AudioBuffer {return this.#mixProcessor.audioOutput}

    parameterChanged(_parameter: AutomatableParameter): void {}

    terminate(): void {this.#terminator.terminate()}

    toString(): string {return "{PlayfieldDeviceProcessor}"}
}