import {Block, Processor} from "@/worklet/processing"
import {Event} from "dsp"
import {NoteEventSource, NoteLifecycleEvent} from "@/worklet/NoteEventSource"
import {assert, Option, Terminable, Terminator} from "std"
import {NoteBroadcaster} from "@core/shared/NoteBroadcaster"
import {Address} from "box"
import {LiveStreamBroadcaster} from "fusion"

export class NoteEventInstrument implements Terminable {
    readonly #terminator = new Terminator()
    readonly #receiver: Processor
    readonly #broadcaster: NoteBroadcaster

    #source: Option<NoteEventSource> = Option.None

    constructor(receiver: Processor, broadcaster: LiveStreamBroadcaster, address: Address) {
        this.#receiver = receiver

        this.#broadcaster = this.#terminator.own(new NoteBroadcaster(broadcaster, address))
    }

    setNoteEventSource(source: NoteEventSource): Terminable {
        assert(this.#source.isEmpty(), "NoteEventSource already set")
        this.#source = Option.wrap(source)
        this.#receiver.reset() // TODO Hope we find a less intrusive solution later
        return Terminable.create(() => {
            this.#source = Option.None
            this.#receiver.reset()
        })
    }

    introduceBlock({index, p0, p1, flags}: Block): void {
        if (this.#source.isEmpty()) {return}
        for (const event of this.#source.unwrap().processNotes(p0, p1, flags)) {
            if (event.pitch >= 0 && event.pitch <= 127) {
                this.#receiver.eventInput.add(index, event)
                this.#showEvent(event)
            }
        }
    }

    clear(): void {}

    terminate(): void {this.#terminator.terminate()}

    #showEvent(event: Event): void {
        if (NoteLifecycleEvent.isStart(event)) {
            this.#broadcaster.noteOn(event.pitch)
        } else if (NoteLifecycleEvent.isStop(event)) {
            this.#broadcaster.noteOff(event.pitch)
        }
    }
}