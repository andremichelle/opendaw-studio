import { EngineContext } from "@/worklet/EngineContext"
import { EventProcessor } from "@/worklet/EventProcessor"
import { Event, EventSpanRetainer, Fraction, NoteEvent, ppqn } from "dsp"
import { MidiEffectProcessor } from "@/worklet/processors"
import { EuclidDeviceBoxAdapter } from "@/audio-engine-shared/adapters/devices/midi-effects/EuclidDeviceBoxAdapter"
import { assert, Bits, Id, int, Option, Terminable, UUID } from "std"
import { Block, BlockFlag, Processor } from "@/worklet/processing"
import { AutomatableParameter } from "@/worklet/AutomatableParameter"
import { NoteEventSource, NoteEventTarget, NoteLifecycleEvent } from "@/worklet/NoteEventSource"
import { Fragmentor } from "@/worklet/Fragmentor"

export class EuclidDeviceProcessor extends EventProcessor implements MidiEffectProcessor {
    readonly #retainer: EventSpanRetainer<Id<NoteEvent>>
    readonly #adapter: EuclidDeviceBoxAdapter
    readonly #stepsParameter: AutomatableParameter<int>
    readonly #notesParameter: AutomatableParameter<int>
    readonly #gateParameter: AutomatableParameter<number>
    readonly #rotationParameter: AutomatableParameter<int>
    readonly #velocityParameter: AutomatableParameter<number>
    readonly #divisionParameter: AutomatableParameter<int>

    #source: Option<NoteEventSource> = Option.None
    #steps: int = 8
    #notes: int = 3
    #gate: number = 1.0
    #rotation: int = 0
    #velocity: number = 0.0
    #divisionIndex: int = 8

    constructor(context: EngineContext, adapter: EuclidDeviceBoxAdapter) {
        super(context)
        this.#adapter = adapter
        this.#retainer = new EventSpanRetainer<Id<NoteEvent>>()
        this.#stepsParameter = this.own(this.bindParameter(adapter.namedParameter.steps))
        this.#notesParameter = this.own(this.bindParameter(adapter.namedParameter.notes))
        this.#gateParameter = this.own(this.bindParameter(adapter.namedParameter.gate))
        this.#rotationParameter = this.own(this.bindParameter(adapter.namedParameter.rotation))
        this.#velocityParameter = this.own(this.bindParameter(adapter.namedParameter.velocity))
        this.#divisionParameter = this.own(this.bindParameter(adapter.namedParameter.division))

        this.ownAll(context.registerProcessor(this))
        this.readAllParameters()
    }

    get uuid(): UUID.Format { return this.#adapter.uuid }
    get incoming(): Processor { return this }
    get outgoing(): Processor { return this }
    get noteEventTarget(): Option<NoteEventTarget> { return Option.wrap(this) }

    setNoteEventSource(source: NoteEventSource): Terminable {
        assert(this.#source.isEmpty(), "NoteEventSource already set")
        this.#source = Option.wrap(source)
        return Terminable.create(() => this.#source = Option.None)
    }

    #generateEuclidianPattern(steps: number, notes: number, rotation: number): boolean[] {
        if (notes === 0) return new Array(steps).fill(false)
        if (notes >= steps) return new Array(steps).fill(true)

        const pattern = new Array(steps).fill(false)
        let error = 0
        const threshold = steps / 2

        for (let i = 0; i < steps; i++) {
            error += notes
            if (error >= threshold) {
                pattern[i] = true
                error -= steps
            }
        }

        if (rotation > 0) {
            const shift = rotation % steps
            return [...pattern.slice(shift), ...pattern.slice(0, shift)]
        }
        return pattern
    }

    * processNotes(from: ppqn, to: ppqn, flags: int): Generator<NoteLifecycleEvent> {
        if (this.#retainer.nonEmpty()) {
            const releaseAll = Bits.every(flags, BlockFlag.discontinuous)
            if (releaseAll) {
                for (const event of this.#retainer.releaseAll()) {
                    yield NoteLifecycleEvent.stop(event, from)
                }
            } else {
                for (const event of this.#retainer.releaseLinearCompleted(to)) {
                    yield NoteLifecycleEvent.stop(event, event.position + event.duration)
                }
            }
        }

        if (this.#source.nonEmpty()) {
            const source = this.#source.unwrap()
            for (const _ of source.processNotes(from, to, flags)) {} // advance source
            const onlyExternal = !Bits.every(flags, BlockFlag.transporting)

            const divisionFraction = EuclidDeviceBoxAdapter.DivisionFractions[this.#divisionIndex] || [1, 4]
               const stepDuration = Fraction.toPPQN(divisionFraction)
            const pattern = this.#generateEuclidianPattern(this.#steps, this.#notes, this.#rotation)
            const noteDuration = Math.max(1, Math.min(stepDuration, Math.floor(stepDuration * this.#gate)));

            for (const {position} of Fragmentor.iterateWithIndex(from, to, stepDuration)) {
                const activeNotes = Array.from(source.iterateActiveNotesAt(position, onlyExternal))

                for (const baseNote of activeNotes) {
                    const relativePosition = position - baseNote.position
                    const stepIndex = Math.floor(relativePosition / stepDuration) % this.#steps

                    if (stepIndex >= 0 && pattern[stepIndex] && position < baseNote.position + baseNote.duration) {
                        const modifiedVelocity = Math.min(1, Math.max(0, baseNote.velocity * (1 + this.#velocity)))
                        const event = NoteLifecycleEvent.startWith({
                            ...baseNote,
                            position,
                            duration: noteDuration,
                            velocity: modifiedVelocity
                        })
                        this.#retainer.addAndRetain(event)
                        yield event
                    }
                }
            }
        }
    }

    *iterateActiveNotesAt(position: ppqn, onlyExternal: boolean): Generator<NoteEvent> {
        if (this.#source.isEmpty() || onlyExternal) return
        yield* this.#retainer.overlapping(position, NoteEvent.Comparator)
    }

    reset(): void {
        this.#retainer.clear()
        this.eventInput.clear()
    }

    parameterChanged(parameter: AutomatableParameter): void {
        if (parameter === this.#stepsParameter) {
            this.#steps = this.#stepsParameter.getValue()
        } else if (parameter === this.#notesParameter) {
            this.#notes = Math.min(this.#notesParameter.getValue(), this.#steps)
        } else if (parameter === this.#rotationParameter) {
            this.#rotation = this.#rotationParameter.getValue()
        } else if (parameter === this.#gateParameter) {
            this.#gate = this.#gateParameter.getValue()
        } else if (parameter === this.#velocityParameter) {
            this.#velocity = this.#velocityParameter.getValue()
        } else if (parameter === this.#divisionParameter) {
            this.#divisionIndex = this.#divisionParameter.getValue()
        }
    }

    processEvents(_block: Block, _from: ppqn, _to: ppqn): void {}
    handleEvent(_block: Block, _event: Event): void {}

    index(): number { return this.#adapter.indexField.getValue() }
    adapter(): EuclidDeviceBoxAdapter { return this.#adapter }
}
