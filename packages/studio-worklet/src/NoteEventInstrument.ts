import {Block, Processor} from "./processing.ts"
import {Event} from "lib-dsp"
import {NoteEventSource, NoteLifecycleEvent} from "./NoteEventSource.ts"
import {assert, Option, Terminable, Terminator} from "lib-std"
import {NoteBroadcaster} from "studio-adapters"
import {Address} from "lib-box"
import {LiveStreamBroadcaster} from "lib-fusion"

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