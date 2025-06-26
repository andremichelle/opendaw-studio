import {EngineContext} from "@core/worklet/EngineContext.ts"
import {Event, NoteEvent, ppqn} from "../../../../../lib/dsp"
import {MidiEffectProcessor} from "@core/worklet/processors.ts"
import {asDefined, assert, clamp, int, Nullable, Objects, Option, Terminable, UUID} from "../../../../../lib/std"
import {AutomatableParameter} from "@core/worklet/AutomatableParameter.ts"
import {NoteEventSource, NoteLifecycleEvent} from "@core/worklet/NoteEventSource.ts"
import {ZeitgeistDeviceBoxAdapter} from "@core/shared/adapters/devices/midi-effects/ZeitgeistDeviceBoxAdapter.ts"
import {EventProcessor} from "@core/worklet/EventProcessor.ts"
import {Block} from "@core/worklet/processing.ts"
import {GrooveEngineAdapter} from "@core/shared/Grooves.ts"
import {NoteBroadcaster} from "@core/shared/NoteBroadcaster.ts"

export class ZeitgeistDeviceProcessor extends EventProcessor implements MidiEffectProcessor {
    readonly #adapter: ZeitgeistDeviceBoxAdapter

    readonly #noteBroadcaster: NoteBroadcaster

    #engineAdapter: Nullable<GrooveEngineAdapter> = null

    #source: Option<NoteEventSource> = Option.None

    constructor(context: EngineContext, adapter: ZeitgeistDeviceBoxAdapter) {
        super(context)

        this.#adapter = adapter

        this.#noteBroadcaster = this.own(new NoteBroadcaster(context.broadcaster, adapter.address))

        this.ownAll(
            adapter.box.groove.catchupAndSubscribe(pointer => {
                this.#engineAdapter?.terminate()
                this.#engineAdapter = pointer.targetVertex.isEmpty()
                    ? null
                    : GrooveEngineAdapter.create(context.boxAdapters, this, pointer.targetVertex.unwrap().box)
            }),
            Terminable.create(() => this.#engineAdapter?.terminate()),
            context.registerProcessor(this)
        )
        this.readAllParameters()
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
        const groove = asDefined(this.#engineAdapter).groove()
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
        const groove = asDefined(this.#engineAdapter).groove()
        for (const event of source.iterateActiveNotesAt(groove.unwarp(position), onlyExternal)) {
            yield Objects.overwrite(event, {position: groove.warp(event.position)})
        }
    }

    reset(): void {this.eventInput.clear()}

    parameterChanged(parameter: AutomatableParameter): void {
        asDefined(this.#engineAdapter).parameterChanged(parameter)
    }

    handleEvent(_block: Readonly<Block>, _event: Event): void {}
    processEvents(_block: Readonly<Block>, _from: number, _to: number): void {}
}