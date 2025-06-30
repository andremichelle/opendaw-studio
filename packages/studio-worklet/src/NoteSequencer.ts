import {EngineContext} from "./EngineContext.ts"
import {TrackType} from "studio-adapters"
import {EventSpanRetainer, LoopableRegion, NoteEvent, ppqn} from "lib-dsp"
import {
    Bits,
    byte,
    clamp,
    Id,
    int,
    isInstanceOf,
    Option,
    quantizeFloor,
    Random,
    Terminable,
    Terminator,
    unitValue,
    UUID
} from "lib-std"
import {NoteClipBoxAdapter} from "studio-adapters"
import {
    NoteEventCollectionBoxAdapter
} from "studio-adapters"
import {NoteRegionBoxAdapter} from "studio-adapters"
import {AudioUnitBoxAdapter} from "studio-adapters"
import {TrackBoxAdapter} from "studio-adapters"
import {NoteCompleteEvent, NoteEventSource, NoteLifecycleEvent} from "./NoteEventSource.ts"
import {BlockFlag, ProcessPhase} from "./processing.ts"
import {NoteBroadcaster} from "studio-adapters"

type ExternalNote = {
    readonly pitch: byte
    readonly velocity: unitValue

    gate: boolean
    running: Option<Id<NoteEvent>>
}

export class NoteSequencer implements NoteEventSource, Terminable {
    readonly #terminator = new Terminator()
    readonly #context: EngineContext
    readonly #adapter: AudioUnitBoxAdapter

    readonly #noteBroadcaster: NoteBroadcaster
    readonly #random: Random
    readonly #externalNotes: Set<ExternalNote>
    readonly #retainer: EventSpanRetainer<Id<NoteEvent>>

    constructor(context: EngineContext, adapter: AudioUnitBoxAdapter) {
        this.#context = context
        this.#adapter = adapter

        this.#noteBroadcaster = this.#terminator.own(new NoteBroadcaster(context.broadcaster, adapter.address))
        this.#random = Random.create(0xFFFF123)
        this.#externalNotes = new Set<ExternalNote>()
        this.#retainer = new EventSpanRetainer<Id<NoteEvent>>()

        this.#terminator.ownAll(
            this.#context.subscribeProcessPhase((phase: ProcessPhase) => {
                if (phase === ProcessPhase.After) {
                    for (const note of this.#externalNotes) {
                        if (!note.gate) {this.#externalNotes.delete(note)}
                    }
                }
            })
        )
    }

    get uuid(): UUID.Format {return this.#adapter.uuid}

    terminate(): void {this.#terminator.terminate()}

    pushRawNoteOn(pitch: byte, velocity: unitValue): void {
        this.#externalNotes.add({pitch, velocity, gate: true, running: Option.None})
    }

    pushRawNoteOff(pitch: byte): void {
        for (const entry of this.#externalNotes) {
            if (entry.running.isEmpty()) {
                // never started
                this.#externalNotes.delete(entry)
            } else if (entry.pitch === pitch) {
                entry.gate = false
                return
            }
        }
    }

    * processNotes(from: ppqn, to: ppqn, flags: int): Generator<NoteLifecycleEvent> {
        const read = Bits.every(flags, BlockFlag.transporting | BlockFlag.playing)
        if (this.#retainer.nonEmpty()) {
            const releaseAll = !read || Bits.every(flags, BlockFlag.discontinuous)
            if (releaseAll) {
                yield* this.#releaseAll(from)
            } else {
                yield* this.#releasecompleted(from, to)
            }
        }
        if (this.#externalNotes.size > 0) {
            for (const note of this.#externalNotes) {
                if (note.running.isEmpty()) {
                    const {pitch, velocity} = note
                    const duration = Number.POSITIVE_INFINITY
                    const event = NoteLifecycleEvent.start(from, duration, pitch, velocity)
                    note.running = Option.wrap(event)
                    yield event
                }
                if (!note.gate) {
                    this.#externalNotes.delete(note)
                    yield NoteLifecycleEvent.stop(note.running.unwrap("raw note never started"), from)
                }
            }
        }
        if (read) {
            const tracks = this.#adapter.tracks.collection.adapters()
                .filter(adapter => adapter.type === TrackType.Notes && adapter.enabled.getValue())
            for (const track of tracks) {
                for (const {
                    optClip,
                    sectionFrom,
                    sectionTo
                } of this.#context.clipSequencing.iterate(track.uuid, from, to)) {
                    if (optClip.isEmpty()) {
                        yield* this.#processRegions(track, sectionFrom, sectionTo)
                    } else {
                        yield* this.#processClip(optClip.unwrap() as NoteClipBoxAdapter, sectionFrom, sectionTo)
                    }
                }
            }
            yield* this.#releasecompleted(from, to) // in case they complete in the same block
        }
    }

    * iterateActiveNotesAt(position: ppqn, onlyEnternal: boolean): Generator<NoteEvent> {
        if (this.#externalNotes.size > 0) {
            for (const {pitch, velocity} of this.#externalNotes) {
                yield {
                    type: "note-event",
                    position,
                    duration: Number.POSITIVE_INFINITY,
                    pitch,
                    velocity,
                    cent: 0.0
                }
            }
        }
        if (onlyEnternal) {return}
        yield* this.#retainer.overlapping(position, NoteEvent.Comparator)
    }

    reset(): void {
        this.#retainer.clear()
        this.#externalNotes.clear()
    }

    toString(): string {return `{${this.constructor.name}}`}

    * #processClip(clip: NoteClipBoxAdapter, p0: ppqn, p1: ppqn): Generator<Id<NoteEvent>> {
        if (clip.optCollection.isEmpty()) {return}
        const collection = clip.optCollection.unwrap()
        const clipDuration = clip.duration
        const clipStart = quantizeFloor(p0, clipDuration)
        const clipEnd = clipStart + clipDuration
        if (p1 > clipEnd) {
            yield* this.#processCollection(collection, p0, clipEnd, clipStart)
            yield* this.#processCollection(collection, clipEnd, p1, clipEnd)
        } else {
            yield* this.#processCollection(collection, p0, p1, clipStart)
        }
    }

    * #processRegions(trackBoxAdapter: TrackBoxAdapter, p0: ppqn, p1: ppqn): Generator<Id<NoteEvent>> {
        for (const region of trackBoxAdapter.regions.collection.iterateRange(p0, p1)) {
            if (region.mute || !isInstanceOf(region, NoteRegionBoxAdapter)) {continue}
            const optCollection = region.optCollection
            if (optCollection.isEmpty()) {continue}
            const collection = optCollection.unwrap()
            for (const {resultStart, resultEnd, rawStart} of LoopableRegion.locateLoops(region, p0, p1)) {
                yield* this.#processCollection(collection, resultStart, resultEnd, rawStart)
            }
        }
    }

    * #processCollection(collection: NoteEventCollectionBoxAdapter, start: ppqn, end: ppqn, delta: ppqn): Generator<Id<NoteEvent>> {
        const localStart = start - delta
        const localEnd = end - delta
        for (const source of collection.events.iterateRange(localStart - collection.maxDuration, localEnd)) {
            if (!NoteEvent.isOfType(source)) {continue}
            const {position, duration, chance, playCount, playCurve} = source
            if (chance < 100.0 && this.#random.nextDouble(0.0, 100.0) > chance) {continue}
            if (playCount > 1) {
                const searchStart = NoteEvent.inverseCurveFunc((localStart - position) / duration, playCurve)
                const searchLimit = NoteEvent.inverseCurveFunc((localEnd - position) / duration, playCurve)
                let searchIndex = Math.floor(searchStart * playCount)
                let searchPosition = searchIndex / playCount
                while (searchPosition < searchLimit) {
                    if (searchPosition >= searchStart) {
                        const a = NoteEvent.curveFunc(searchPosition, playCurve) * duration
                        if (a >= duration) {break}
                        const b = NoteEvent.curveFunc((searchPosition + 1.0 / playCount), playCurve) * duration
                        const event: Id<NoteEvent> = NoteLifecycleEvent.startWith(source, position + a + delta, b - a)
                        this.#retainer.addAndRetain({...event})
                        this.#noteBroadcaster.noteOn(event.pitch)
                        yield event
                    }
                    searchPosition = ++searchIndex / playCount
                }
            } else {
                if (localStart <= position && position < localEnd) {
                    const event: Id<NoteEvent> = NoteLifecycleEvent.startWith(source, position + delta)
                    this.#retainer.addAndRetain({...event})
                    this.#noteBroadcaster.noteOn(event.pitch)
                    yield event
                }
            }
        }
    }

    * #releaseAll(from: ppqn): Generator<NoteCompleteEvent> {
        for (const event of this.#retainer.releaseAll()) {
            this.#noteBroadcaster.noteOff(event.pitch)
            yield NoteLifecycleEvent.stop(event, from)
        }
    }

    * #releasecompleted(from: ppqn, to: ppqn): Generator<NoteCompleteEvent> {
        for (const event of this.#retainer.releaseLinearCompleted(to)) {
            this.#noteBroadcaster.noteOff(event.pitch)
            // We need to clamp the value in case the time-domain has been changed between note-start and note-complete
            const position = clamp(event.position + event.duration, from, to)
            yield NoteLifecycleEvent.stop(event, position)
        }
    }
}