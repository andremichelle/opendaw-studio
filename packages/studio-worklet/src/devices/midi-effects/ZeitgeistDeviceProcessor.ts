import {assert, clamp, identity, int, Objects, Option, Terminable, UUID} from "opendaw-std"
import {Event, Groove, NoteEvent, ppqn} from "opendaw-dsp"
import {MidiEffectProcessor} from "../../processors.ts"
import {AutomatableParameter} from "../../AutomatableParameter.ts"
import {NoteEventSource, NoteLifecycleEvent} from "../../NoteEventSource.ts"
import {GrooveAdapter, NoteBroadcaster, ZeitgeistDeviceBoxAdapter} from "studio-shared"
import {EventProcessor} from "../../EventProcessor.ts"
import {Block} from "../../processing.ts"
import {EngineContext} from "../../EngineContext.ts"

export class ZeitgeistDeviceProcessor extends EventProcessor implements MidiEffectProcessor {
    readonly #adapter: ZeitgeistDeviceBoxAdapter

    readonly #noteBroadcaster: NoteBroadcaster

    #groove: Option<GrooveAdapter> = Option.None
    #source: Option<NoteEventSource> = Option.None

    constructor(context: EngineContext, adapter: ZeitgeistDeviceBoxAdapter) {
        super(context)

        this.#adapter = adapter

        this.#noteBroadcaster = this.own(new NoteBroadcaster(context.broadcaster, adapter.address))

        this.ownAll(
            adapter.box.groove.catchupAndSubscribe(pointer => {
                this.#groove.ifSome(adapter => adapter.terminate())
                this.#groove = Option.wrap(pointer.targetVertex.isEmpty()
                    ? null
                    : context.boxAdapters.adapterFor(pointer.targetVertex.unwrap().box, GrooveAdapter.checkType))
            }),
            Terminable.create(() => {
                this.#groove.ifSome(adapter => adapter.terminate())
                this.#groove = Option.None
            }),
            context.registerProcessor(this)
        )
    }

    get uuid(): UUID.Format {return this.#adapter.uuid}

    index(): int {return this.#adapter.indexField.getValue()}
    adapter(): ZeitgeistDeviceBoxAdapter {return this.#adapter}

    setNoteEventSource(source: NoteEventSource): Terminable {
        assert(this.#source.isEmpty(), "NoteEventSource already set")
        this.#source = Option.wrap(source)
        return Terminable.create(() => this.#source = Option.None)
    }

    * processNotes(from: ppqn, to: ppqn, flags: int): Generator<NoteLifecycleEvent> {
        if (this.#source.isEmpty()) {return}
        const source = this.#source.unwrap()
        const groove: Groove = this.#groove.mapOr(identity, Groove.Identity)
        for (const event of source.processNotes(groove.unwarp(from), groove.unwarp(to), flags)) {
            if (NoteLifecycleEvent.isStart(event)) {
                this.#noteBroadcaster.noteOn(event.pitch)
            } else {
                this.#noteBroadcaster.noteOff(event.pitch)
            }
            yield Objects.overwrite(event, {position: clamp(groove.warp(event.position), from, to)})
        }
    }

    * iterateActiveNotesAt(position: ppqn, onlyExternal: boolean): Generator<NoteEvent> {
        if (this.#source.isEmpty()) {return}
        const source = this.#source.unwrap()
        const groove: Groove = this.#groove.mapOr(identity, Groove.Identity)
        for (const event of source.iterateActiveNotesAt(groove.unwarp(position), onlyExternal)) {
            yield Objects.overwrite(event, {position: groove.warp(event.position)})
        }
    }

    reset(): void {this.eventInput.clear()}

    parameterChanged(_parameter: AutomatableParameter): void {}

    handleEvent(_block: Readonly<Block>, _event: Event): void {}
    processEvents(_block: Readonly<Block>, _from: number, _to: number): void {}
}