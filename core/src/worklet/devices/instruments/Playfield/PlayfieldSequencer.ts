import {Block} from "@core/worklet/processing.ts"
import {EngineContext} from "@core/worklet/EngineContext.ts"
import {EventProcessor} from "@core/worklet/EventProcessor.ts"
import {PlayfieldDeviceProcessor} from "@core/worklet/devices/instruments/PlayfieldDeviceProcessor.ts"
import {Event} from "../../../../../../lib/dsp"
import {NoteEventSource, NoteEventTarget, NoteLifecycleEvent} from "@core/worklet/NoteEventSource.ts"
import {NoteEventInstrument} from "@core/worklet/NoteEventInstrument.ts"
import {Terminable} from "../../../../../../lib/std"

export class PlayfieldSequencer extends EventProcessor implements NoteEventTarget {
    readonly #device: PlayfieldDeviceProcessor

    readonly #noteEventInstrument: NoteEventInstrument

    constructor(context: EngineContext, device: PlayfieldDeviceProcessor) {
        super(context)

        this.#device = device

        this.#noteEventInstrument = new NoteEventInstrument(this, context.broadcaster, device.adapter.address)

        this.own(context.registerProcessor(this))
        this.readAllParameters()
    }

    introduceBlock(block: Block): void {this.#noteEventInstrument.introduceBlock(block)}
    setNoteEventSource(source: NoteEventSource): Terminable {return this.#noteEventInstrument.setNoteEventSource(source)}

    reset(): void {
        this.eventInput.clear()
        this.#noteEventInstrument.clear()
    }

    processEvents(_block: Readonly<Block>, _from: number, _to: number): void {}

    handleEvent({index}: Readonly<Block>, event: Event): void {
        if (NoteLifecycleEvent.isStart(event)) {
            this.#device.optSampleProcessor(event.pitch).ifSome(({eventInput}) => eventInput.add(index, event))
        } else if (NoteLifecycleEvent.isStop(event)) {
            this.#device.optSampleProcessor(event.pitch).ifSome(({eventInput}) => eventInput.add(index, event))
        }
    }

    toString(): string {return "{PlayfieldSequencer}"}
}