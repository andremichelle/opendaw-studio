import css from "./TimeStateDisplay.sass?inline"
import {
    Attempt,
    Attempts,
    clamp,
    DefaultObservableValue,
    EmptyExec,
    float,
    int,
    Lifecycle,
    ObservableValue,
    Option,
    Terminator
} from "opendaw-std"
import {createElement, Frag, Inject} from "opendaw-jsx"
import {StudioService} from "@/service/StudioService.ts"
import {parseTimeSignature, PPQN} from "opendaw-dsp"
import {DblClckTextInput} from "@/ui/wrapper/DblClckTextInput.tsx"
import {ContextMenu} from "@/ui/ContextMenu.ts"
import {MenuItem} from "@/ui/model/menu-item.ts"
import {ProjectSession} from "@/project/ProjectSession"
import {Dragging, Html} from "opendaw-dom"
import {FlexSpacer} from "@/ui/components/FlexSpacer.tsx"
import {Propagation} from "opendaw-box"

const className = Html.adoptStyleSheet(css, "time-display")

type Construct = {
    lifecycle: Lifecycle
    service: StudioService
}

const minBpm = 30.0
const maxBpm = 1000.0

export const TimeStateDisplay = ({lifecycle, service}: Construct) => {
    const barDigits = Inject.value("001")
    const beatDigit = Inject.value("1")
    const semiquaverDigit = Inject.value("1")
    const ticksDigit = Inject.value("000")
    const shuffleDigit = Inject.value("60")
    const bpmDigit = Inject.value("120")
    const meterLabel = Inject.value("4/4")
    // Bar, Bar+Beats, Bar+Beats+SemiQuaver, Bar+Beats+SemiQuaver+Ticks
    const timeUnits = ["Bar", "Beats", "SemiQuaver", "Ticks"] // Bar+Beats
    const timeUnitIndex = new DefaultObservableValue(1)
    const sessionService = service.sessionService
    const projectActiveLifeTime = lifecycle.own(new Terminator())
    const sessionObserver = (owner: ObservableValue<Option<ProjectSession>>) => {
        projectActiveLifeTime.terminate()
        const optSession = owner.getValue()
        if (optSession.isEmpty()) {return}
        const {project} = optSession.unwrap()
        const {position, timelineBoxAdapter, rootBoxAdapter, boxGraph} = project
        projectActiveLifeTime.own(position.catchupAndSubscribe((owner: ObservableValue<number>) => {
            const {bars, beats, semiquavers, ticks} = PPQN.toParts(owner.getValue())
            barDigits.value = (bars + 1).toString().padStart(3, "0")
            beatDigit.value = (beats + 1).toString()
            semiquaverDigit.value = (semiquavers + 1).toString()
            ticksDigit.value = ticks.toString().padStart(3, "0")
        }))
        timelineBoxAdapter.box.bpm.catchupAndSubscribe((owner: ObservableValue<float>) =>
            bpmDigit.value = owner.getValue().toFixed(0).padStart(3, "0"))
        const updateMeterLabel = () => {
            const {nominator, denominator} = timelineBoxAdapter.box.signature
            meterLabel.value = `${nominator.getValue()}/${denominator.getValue()}`
        }
        boxGraph.subscribeVertexUpdates(Propagation.Children, timelineBoxAdapter.box.signature.address, updateMeterLabel)
        updateMeterLabel()
        rootBoxAdapter.groove.box.amount.catchupAndSubscribe((owner: ObservableValue<float>) =>
            shuffleDigit.value = String(Math.round(owner.getValue() * 100)))
    }
    lifecycle.own(sessionService.catchupAndSubscribe(sessionObserver))
    const bpmDisplay: HTMLElement = (
        <div className="number-display">
            <div>{bpmDigit}</div>
            <div>BPM</div>
        </div>
    )
    lifecycle.own(Dragging.attach(bpmDisplay, (event: PointerEvent) => sessionService.getValue().match({
        none: () => Option.None,
        some: ({project}) => {
            const {editing} = project
            const bpmField = project.timelineBox.bpm
            const pointer = event.clientY
            const oldValue = bpmField.getValue()
            return Option.wrap({
                update: (event: Dragging.Event) => editing.modify(() =>
                    bpmField.setValue(clamp(oldValue + (pointer - event.clientY) * 2.0, minBpm, maxBpm)), false),
                cancel: () => editing.modify(() => bpmField.setValue(oldValue), false),
                approve: () => editing.mark()
            })
        }
    })))
    const timeUnitElements: ReadonlyArray<HTMLElement> = (
        <Frag>
            <div className="number-display">
                <div>{barDigits}</div>
                <div>BAR</div>
            </div>
            <div className="number-display">
                <div>{beatDigit}</div>
                <div>BEAT</div>
            </div>
            <div className="number-display">
                <div>{semiquaverDigit}</div>
                <div>SEMI</div>
            </div>
            <div className="number-display">
                <div>{ticksDigit}</div>
                <div>TICKS</div>
            </div>
        </Frag>
    )
    lifecycle.own(timeUnitIndex.catchupAndSubscribe(owner =>
        timeUnitElements.forEach((element, index) => element.classList.toggle("hidden", index > owner.getValue()))))
    const element: HTMLElement = (
        <div className={className}>
            {timeUnitElements}
            <DblClckTextInput resolversFactory={() => {
                const resolvers = Promise.withResolvers<string>()
                resolvers.promise.then((value: string) => {
                    const bpm = parseFloat(value)
                    if (isNaN(bpm)) {return}
                    sessionService.getValue().ifSome(({project}) =>
                        project.editing.modify(() => project.timelineBox.bpm.setValue(clamp(bpm, minBpm, maxBpm))))
                }, EmptyExec)
                return resolvers
            }} provider={() => ({unit: "bpm", value: bpmDigit.value})}>
                {bpmDisplay}
            </DblClckTextInput>
            <FlexSpacer pixels={3}/>
            <DblClckTextInput resolversFactory={() => {
                const resolvers = Promise.withResolvers<string>()
                resolvers.promise.then((value: string) => {
                    const attempt: Attempt<[int, int]> = Attempts.tryGet(() => parseTimeSignature(value))
                    if (attempt.isSuccess()) {
                        const [nominator, denominator] = attempt.result()
                        sessionService.getValue()
                            .ifSome(({project: {editing, rootBoxAdapter: {timeline: {box: {signature}}}}}) =>
                                editing.modify(() => {
                                    signature.nominator.setValue(clamp(nominator, 1, 32))
                                    signature.denominator.setValue(clamp(denominator, 1, 32))
                                }))
                    }
                }, EmptyExec)
                return resolvers
            }} provider={() => ({unit: "", value: meterLabel.value})}>
                <div className="number-display">
                    <div>{meterLabel}</div>
                    <div>METER</div>
                </div>
            </DblClckTextInput>
            <DblClckTextInput resolversFactory={() => {
                const resolvers = Promise.withResolvers<string>()
                resolvers.promise.then((value: string) => {
                    const amount = parseFloat(value)
                    if (isNaN(amount)) {return}
                    sessionService.getValue().ifSome(({project}) =>
                        project.editing.modify(() => project.rootBoxAdapter.groove.box.amount
                            .setValue(clamp(amount / 100.0, 0.0, 1.0))))
                }, EmptyExec)
                return resolvers
            }} provider={() => ({unit: "shuffle", value: shuffleDigit.value})}>
                <div className="number-display hidden">
                    <div>{shuffleDigit}</div>
                    <div>SHUF</div>
                </div>
            </DblClckTextInput>
        </div>
    )
    lifecycle.ownAll(
        sessionService.catchupAndSubscribe(owner => element.classList.toggle("disabled", owner.getValue().isEmpty())),
        ContextMenu.subscribe(element, collector => collector.addItems(MenuItem.default({label: "Units"})
            .setRuntimeChildrenProcedure(parent => parent.addMenuItem(
                ...timeUnits.map((_, index) => MenuItem.default({
                    label: timeUnits.slice(0, index + 1).join(" > "),
                    checked: index === timeUnitIndex.getValue()
                }).setTriggerProcedure(() => timeUnitIndex.setValue(index)))
            ))))
    )
    return element
}