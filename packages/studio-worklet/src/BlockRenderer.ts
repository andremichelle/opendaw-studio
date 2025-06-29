import {ppqn, PPQN} from "opendaw-dsp"
import {Block, BlockFlags, ProcessInfo} from "./processing.ts"
import {RenderQuantum} from "./constants.ts"
import {EngineContext} from "./EngineContext.ts"
import {Exec, int, isDefined, Iterables, Nullable, Procedure, SetMultimap, Terminable} from "opendaw-std"
import {MarkerBoxAdapter} from "studio-shared"

type Action = null
    | { type: "loop", target: ppqn }
    | { type: "marker", prev: MarkerBoxAdapter, next: MarkerBoxAdapter }
    | { type: "callback", position: ppqn, callbacks: ReadonlySet<Exec> }

export class BlockRenderer {
    readonly #context: EngineContext

    readonly #callbacks: SetMultimap<ppqn, Exec>

    #tempoChanged: boolean = false
    #currentMarker: Nullable<[MarkerBoxAdapter, int]> = null
    #someMarkersChanged: boolean = false
    #freeRunningPosition: ppqn = 0.0 // synced with timeInfo when transporting
    #playEvents: boolean = true // playing events

    constructor(context: EngineContext) {
        this.#context = context
        this.#context.timelineBoxAdapter.markerTrack.subscribe(() => this.#someMarkersChanged = true)
        this.#context.timelineBoxAdapter.box.bpm.subscribe(() => this.#tempoChanged = true)

        this.#callbacks = new SetMultimap()
    }

    get playEvents(): boolean {return this.#playEvents}
    set playEvents(value: boolean) {this.#playEvents = value}

    setCallback(position: ppqn, callback: Exec): Terminable {
        this.#callbacks.add(position, callback)
        return Terminable.create(() => this.#callbacks.remove(position, callback))
    }

    reset(): void {this.#currentMarker = null}

    process(procedure: Procedure<ProcessInfo>): void {
        let markerChanged = false

        const {timeInfo, timelineBoxAdapter: {box: timelineBox, markerTrack}} = this.#context
        const bpm = timelineBox.bpm.getValue()
        const transporting = timeInfo.transporting
        if (transporting) {
            const blocks: Array<Block> = []
            let p0 = timeInfo.position
            let s0: int = 0 | 0
            let index: int = 0 | 0
            let discontinuous = timeInfo.getLeapStateAndReset()
            while (s0 < RenderQuantum) {
                if (this.#someMarkersChanged || discontinuous) {
                    this.#someMarkersChanged = false
                    const marker = markerTrack.events.lowerEqual(p0)
                    if ((this.#currentMarker?.at(0) ?? null) !== marker) {
                        this.#currentMarker = isDefined(marker) ? [marker, 0] : null
                        markerChanged = true
                    }
                }
                const sn: int = RenderQuantum - s0
                const p1 = p0 + PPQN.samplesToPulses(sn, bpm, sampleRate)
                let action: Action = null
                let actionPosition: ppqn = Number.POSITIVE_INFINITY

                //
                // evaluate nearest global action
                //

                // --- MARKER ---
                if (markerTrack.enabled) {
                    const markers = Array.from(Iterables.take(markerTrack.events.iterateFrom(p0), 2))
                    if (markers.length > 0) {
                        const [prev, next] = markers
                        // This branch happens if all markers are in the future
                        if (this.#currentMarker === null) {
                            if (prev.position >= p0 && prev.position < p1) {
                                action = {type: "marker", prev, next}
                                actionPosition = prev.position
                            }
                        } else if (
                            isDefined(next)
                            && next !== this.#currentMarker[0] // must be different from the current
                            && prev.position < p0 // must be in the past
                            && next.position < p1 // must be inside the block
                        ) {
                            action = {type: "marker", prev, next}
                            actionPosition = next.position
                        }
                    }
                }
                // --- LOOP SECTION ---
                const {from, to, enabled} = timelineBox.loopArea
                const loopEnabled = enabled.getValue()
                if (loopEnabled) {
                    const loopTo = to.getValue()
                    if (p0 < loopTo && p1 > loopTo && loopTo < actionPosition) {
                        action = {type: "loop", target: from.getValue()}
                        actionPosition = loopTo
                    }
                }
                // --- ARM PLAYING ---
                if (this.#callbacks.keyCount() > 0) {
                    for (const position of this.#callbacks.keys()) {
                        if (p0 < position && p1 > position && position < actionPosition) {
                            action = {type: "callback", position, callbacks: this.#callbacks.get(position)}
                            actionPosition = position
                        }
                    }
                }
                //
                // handle action (if any)
                //
                if (action === null) {
                    const s1 = s0 + sn
                    blocks.push({
                        index: index++, p0, p1, s0, s1, bpm,
                        flags: BlockFlags.create(transporting, discontinuous, this.#playEvents, this.#tempoChanged)
                    })
                    discontinuous = false
                    p0 = p1
                    s0 = s1
                } else {
                    const advanceToEvent = () => {
                        if (actionPosition > p0) {
                            const s1 = s0 + PPQN.pulsesToSamples(actionPosition - p0, bpm, sampleRate) | 0
                            blocks.push({
                                index: index++, p0, p1: actionPosition, s0, s1, bpm,
                                flags: BlockFlags.create(transporting, discontinuous, this.#playEvents, this.#tempoChanged)
                            })
                            discontinuous = false
                            p0 = actionPosition
                            s0 = s1
                        }
                    }
                    switch (action.type) {
                        case "loop": {
                            advanceToEvent()
                            p0 = action.target
                            discontinuous = true
                            break
                        }
                        case "marker": {
                            const {prev, next} = action
                            if (!isDefined(this.#currentMarker) || this.#currentMarker[0] !== prev) {
                                this.#currentMarker = [prev, 0]
                            } else {
                                if (++this.#currentMarker[1] < prev.plays || prev.plays === 0) {
                                    advanceToEvent()
                                    p0 = prev.position
                                    discontinuous = true
                                } else {
                                    this.#currentMarker = [next, 0]
                                }
                            }
                            markerChanged = true
                            break
                        }
                        case "callback": {
                            advanceToEvent()
                            action.callbacks.forEach(callback => callback())
                            break
                        }
                    }
                }
                this.#tempoChanged = false
            }
            procedure({blocks})
            timeInfo.advanceTo(p0)
            this.#freeRunningPosition = p0
        } else {
            if (this.#someMarkersChanged || timeInfo.getLeapStateAndReset()) {
                this.#someMarkersChanged = false
                const marker = markerTrack.events.lowerEqual(timeInfo.position)
                if (marker !== null) {
                    if (this.#currentMarker?.at(0) !== marker) {
                        this.#currentMarker = [marker, 0]
                        markerChanged = true
                    }
                }
            }
            const p0 = this.#freeRunningPosition
            const p1 = p0 + PPQN.samplesToPulses(RenderQuantum, bpm, sampleRate)
            const processInfo: ProcessInfo = {
                blocks: [{
                    index: 0, p0, p1, s0: 0, s1: RenderQuantum, bpm,
                    flags: BlockFlags.create(false, false, false, false)
                }]
            }
            procedure(processInfo)
            this.#freeRunningPosition = p1
        }
        if (markerChanged) {
            this.#context.engineToClient.switchMarkerState(isDefined(this.#currentMarker)
                ? [this.#currentMarker[0].uuid, this.#currentMarker[1]] : null)
        }
    }
}