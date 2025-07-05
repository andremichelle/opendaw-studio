import css from "./PianoRoll.sass?inline"
import {Events, Html} from "dom"
import {createElement, Group} from "jsx"
import {PianoRollLayout} from "@/ui/piano-panel/PianoRollLayout.ts"
import {isDefined, isInstanceOf, Lifecycle, Notifier} from "std"
import {LoopableRegion, PPQN, ppqn} from "dsp"
import {NoteRegionBoxAdapter} from "@/audio-engine-shared/adapters/timeline/region/NoteRegionBoxAdapter.ts"
import {Project} from "@/project/Project.ts"

const className = Html.adoptStyleSheet(css, "PianoRoll")

type Construct = {
    lifecycle: Lifecycle
    project: Project
    updateNotifier: Notifier<void>
}

export const PianoRoll = ({lifecycle, project, updateNotifier}: Construct) => {
    const {WhiteKey, BlackKey} = PianoRollLayout
    const {service: {engine}, rootBoxAdapter: {pianoMode: {keyboard, transpose}}} = project
    const enginePosition = engine.position()
    const getPianoLayout = () => PianoRollLayout.Defaults()[keyboard.getValue()]
    const createSVG = (): SVGSVGElement => {
        const pianoLayout = getPianoLayout()
        return (
            <svg classList={className}
                 viewBox={`0.5 0 ${pianoLayout.whiteKeys.length * WhiteKey.width - 1} ${(WhiteKey.height)}`}
                 width="100%">
                {pianoLayout.whiteKeys.map(({key, x}) => (
                    <rect classList="white" data-key={key} x={x + 0.5} y={0}
                          width={WhiteKey.width - 1} height={WhiteKey.height}/>
                ))}
                {pianoLayout.blackKeys.map(({key, x}) => (
                    <rect classList="black" data-key={key} x={x} y={0}
                          width={BlackKey.width} height={BlackKey.height}/>
                ))}
            </svg>
        )
    }
    let svg: SVGSVGElement = createSVG()
    const update = (position: ppqn) => {
        svg.querySelectorAll<SVGRectElement>("rect.playing")
            .forEach(rect => {
                rect.style.removeProperty("fill")
                rect.classList.remove("playing")
            })
        const pianoLayout = getPianoLayout()
        project.rootBoxAdapter.audioUnits.adapters().forEach(audioUnitAdapter => {
            const trackBoxAdapters = audioUnitAdapter.tracks.values()
                .filter(adapter => !adapter.box.excludePianoMode.getValue())
            trackBoxAdapters
                .forEach(trackAdapter => {
                    const region = trackAdapter.regions.collection.lowerEqual(position)
                    if (region === null || !isInstanceOf(region, NoteRegionBoxAdapter) || position >= region.complete) {
                        return
                    }
                    const collection = region.optCollection.unwrap()
                    const events = collection.events
                    const loopIterator = LoopableRegion.locateLoops(region, position, position)
                    for (const {resultStart, resultEnd, rawStart} of loopIterator) {
                        const searchStart = Math.floor(resultStart - rawStart)
                        const searchEnd = Math.floor(resultEnd - rawStart)
                        for (const note of events.iterateRange(searchStart - collection.maxDuration, searchEnd)) {
                            if (note.position + rawStart <= position && position < note.complete + rawStart) {
                                const pitch = note.pitch + transpose.getValue()
                                if (pitch < pianoLayout.min || pitch > pianoLayout.max) {continue}
                                const rect = svg.querySelector<SVGRectElement>(`[data-key="${pitch}"]`)
                                if (isDefined(rect)) {
                                    rect.style.fill = pianoLayout.getFillStyle(region.hue, true)
                                    rect.classList.add("playing")
                                }
                            }
                        }
                    }
                })
        })
    }
    const placeholder: Element = <Group>{svg}</Group>
    lifecycle.ownAll(
        keyboard.subscribe(() => {
            svg.remove()
            svg = createSVG()
            placeholder.appendChild(svg)
        }),
        // TODO We need a way to subscribe to all surfaces (this will fail when popping out into a new window)
        Events.subscribe(self, "keydown", event => {
            if (Events.isTextInput(event.target)) {return}
            if (event.code === "ArrowUp") {
                const position = enginePosition.getValue() + PPQN.Quarter
                project.service.engine.requestPosition(Math.max(0, position))
            } else if (event.code === "ArrowDown") {
                const position = enginePosition.getValue() - PPQN.Quarter
                project.service.engine.requestPosition(Math.max(0, position))
            }
        }, {capture: true}),
        updateNotifier.subscribe(() => update(enginePosition.getValue()))
    )
    update(enginePosition.getValue())
    return placeholder
}