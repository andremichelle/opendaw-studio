import css from "./DevicesBrowser.sass?inline"
import {Lifecycle, Objects, panic} from "lib-std"
import {StudioService} from "@/service/StudioService.ts"
import {createElement} from "lib-jsx"
import {Instruments} from "@/service/Instruments.ts"
import {DragAndDrop} from "@/ui/DragAndDrop"
import {DragDevice} from "@/ui/AnyDragData"
import {Effects} from "@/service/Effects"
import {TextTooltip} from "@/ui/surface/TextTooltip"
import {Icon} from "../components/Icon"
import {Project} from "@/project/Project"
import {Html} from "lib-dom"
import {DeviceHost, Devices} from "studio-adapters"

const className = Html.adoptStyleSheet(css, "DevicesBrowser")

type Construct = {
    lifecycle: Lifecycle
    service: StudioService
}

export const DevicesBrowser = ({lifecycle, service}: Construct) => {
    const {project} = service
    return (
        <div className={className}>
            <div className="resources">
                <section className="instrument">
                    <h1>Instruments</h1>
                    {createInstrumentList(lifecycle, project)}
                </section>
                <section className="audio">
                    <h1>Audio Effects</h1>
                    {createEffectList(lifecycle, project, Objects.exclude(Effects.AudioNamed, "Modular"), "audio-effect")}
                </section>
                <section className="midi">
                    <h1>Midi Effects</h1>
                    {createEffectList(lifecycle, project, Effects.MidiNamed, "midi-effect")}
                </section>
            </div>
            <div className="manual help-section">
                <section>
                    <h1>Creating an Instrument</h1>
                    <p>
                        To start making sound, click on an instrument from the list. This will create a new instance in
                        your
                        project.
                    </p>
                </section>
                <section>
                    <h1>Adding Effects</h1>
                    <p>
                        Once an instrument is created, you can add effects. To do this, simply drag an effect
                        from the list and drop it into the instrument’s device chain.
                    </p>
                </section>
            </div>
        </div>
    )
}

const createInstrumentList = (lifecycle: Lifecycle, project: Project) => (
    <ul>{
        Object.entries(Instruments.Named).map(([key, info]) => {
            const element = <li onclick={() => project.editing.modify(() => Instruments.create(project, info))}>
                <div className="icon">
                    <Icon symbol={info.icon}/>
                </div>
                {info.defaultName}
            </li>
            lifecycle.ownAll(
                DragAndDrop.installSource(element, () => ({
                    type: "instrument",
                    device: key as Instruments.Keys,
                    copy: true
                } satisfies DragDevice)),
                TextTooltip.simple(element, () => {
                    const {bottom, left} = element.getBoundingClientRect()
                    return {clientX: left, clientY: bottom + 12, text: info.description}
                })
            )
            return element
        })
    }</ul>
)

const createEffectList = <
    R extends Record<string, Effects.Entry>,
    T extends DragDevice["type"]>(lifecycle: Lifecycle, project: Project, records: R, type: T): HTMLUListElement => (
    <ul>{
        Object.entries(records).map(([key, entry]) => {
            const element = (
                <li onclick={() => {
                    const {boxAdapters, editing, userEditingManager} = project
                    userEditingManager.audioUnit.get().ifSome(vertex => {
                        const deviceHost: DeviceHost = boxAdapters.adapterFor(vertex.box, Devices.isHost)
                        if (type === "midi-effect" && deviceHost.inputAdapter.mapOr(input => input.accepts !== "midi", true)) {
                            return
                        }
                        const effectField =
                            type === "audio-effect" ? deviceHost.audioEffects.field()
                                : type === "midi-effect" ? deviceHost.midiEffects.field()
                                    : panic(`Unknown ${type}`)
                        editing.modify(() => entry.create(project, effectField, effectField.pointerHub.incoming().length))
                    })
                }}>
                    <div className="icon">
                        <Icon symbol={entry.icon}/>
                    </div>
                    {entry.name}
                </li>
            )
            lifecycle.ownAll(
                DragAndDrop.installSource(element, () => ({
                    type: type as any,
                    start_index: null,
                    device: key as keyof typeof Effects.MergedNamed
                } satisfies DragDevice)),
                TextTooltip.simple(element, () => {
                    const {bottom, left} = element.getBoundingClientRect()
                    return {clientX: left, clientY: bottom + 12, text: entry.description}
                })
            )
            return element
        })
    }</ul>
)