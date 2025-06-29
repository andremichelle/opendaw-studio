import css from "./DevicePanel.sass?inline"
import {asDefined, Lifecycle, ObservableValue, Option, Terminable, Terminator, UUID} from "opendaw-std"
import {appendChildren, createElement} from "opendaw-jsx"
import {Session, StudioService} from "@/service/StudioService"
import {AudioUnitBox, BoxVisitor, PlayfieldSampleBox} from "studio-boxes"
import {
    AudioEffectDeviceBoxAdapter,
    DeviceHost,
    Devices,
    MidiEffectDeviceAdapter
} from "studio-shared"
import {ScrollModel} from "@/ui/components/ScrollModel.ts"
import {Orientation, Scroller} from "@/ui/components/Scroller"
import {DeviceMidiMeter} from "@/ui/devices/panel/DeviceMidiMeter.tsx"
import {ChannelStrip} from "@/ui/mixer/ChannelStrip"
import {installAutoScroll} from "@/ui/AutoScroll"
import {deferNextFrame, Events, Html} from "opendaw-dom"
import {DevicePanelDragAndDrop} from "@/ui/devices/DevicePanelDragAndDrop"
import {SortedBoxAdapterCollection} from "studio-shared"
import {NoAudioUnitSelectedPlaceholder} from "@/ui/devices/panel/NoAudioUnitSelectedPlaceholder"
import {NoEffectPlaceholder} from "@/ui/devices/panel/NoEffectPlaceholder"
import {DeviceMount} from "@/ui/devices/panel/DeviceMount"
import {Box} from "opendaw-box"
import {Project} from "@/project/Project"
import {
    PlayfieldSampleBoxAdapter
} from "studio-shared"
import {AudioUnitInputAdapter} from "studio-shared"
import {Pointers} from "studio-enums"

const className = Html.adoptStyleSheet(css, "DevicePanel")

type Construct = {
    lifecycle: Lifecycle
    service: StudioService
}

type Context = { deviceHost: DeviceHost, instrument: ObservableValue<Option<AudioUnitInputAdapter>> }

export const DevicePanel = ({lifecycle, service}: Construct) => {
    const midiEffectsContainer: HTMLElement = <div className="midi-container"/>
    const instrumentContainer: HTMLElement = <div className="source-container"/>
    const audioEffectsContainer: HTMLElement = <div className="audio-container"/>
    const channelStripContainer: HTMLElement = <div className="channel-strip-container"/>
    const noAudioUnitSelectedPlaceholder: HTMLElement = (
        <NoAudioUnitSelectedPlaceholder lifecycle={lifecycle} service={service}/>
    )
    const noEffectPlaceholder: HTMLElement = (
        <NoEffectPlaceholder service={service}/>
    )
    const containers: HTMLElement = (
        <div className="containers">
            {midiEffectsContainer}
            {instrumentContainer}
            {audioEffectsContainer}
        </div>
    )
    const devices: HTMLElement = (
        <div className="editors">
            {containers}
            {noAudioUnitSelectedPlaceholder}
            {noEffectPlaceholder}
        </div>
    )
    const scrollModel = new ScrollModel()
    const updateScroller = (): void => {
        scrollModel.visibleSize = devices.clientWidth
        scrollModel.contentSize = containers.clientWidth
    }

    const getContext = (project: Project, box: Box): Context => {
        const deviceHost = project.boxAdapters.adapterFor(box, Devices.isHost)
        return asDefined(box.accept<BoxVisitor<Context>>({
            visitAudioUnitBox: (_box: AudioUnitBox): Context => ({
                deviceHost,
                instrument: deviceHost.audioUnitBoxAdapter().input
            }),
            visitPlayfieldSampleBox: (box: PlayfieldSampleBox): Context => ({
                deviceHost,
                instrument: ObservableValue.make(Option.wrap(project.boxAdapters.adapterFor(box, PlayfieldSampleBoxAdapter)))
            })
        }))
    }

    const chainLifecycle = lifecycle.own(new Terminator())
    const mounts = UUID.newSet<DeviceMount>(({uuid}) => uuid)
    const updateDom = lifecycle.own(deferNextFrame(() => {
        Html.empty(midiEffectsContainer)
        Html.empty(instrumentContainer)
        Html.empty(audioEffectsContainer)
        Html.empty(channelStripContainer)
        chainLifecycle.terminate()
        const session = service.sessionService.getValue()
        if (session.isEmpty()) {return}
        const {project} = session.unwrap()
        const optEditing = project.userInterfaceBox.editingDeviceChain.targetVertex
        noAudioUnitSelectedPlaceholder.classList.toggle("hidden", optEditing.nonEmpty())
        noEffectPlaceholder.classList.toggle("hidden", optEditing.isEmpty())
        if (optEditing.isEmpty()) {return}
        const {deviceHost, instrument} = getContext(project, optEditing.unwrap().box)
        if (instrument.getValue().nonEmpty()) {
            const input = instrument.getValue().unwrap()
            if (input.accepts === "midi") {
                appendChildren(midiEffectsContainer, (
                    <div style={{margin: "1.125rem 0 0 0"}}>
                        <DeviceMidiMeter lifecycle={chainLifecycle}
                                         receiver={project.liveStreamReceiver}
                                         address={deviceHost.audioUnitBoxAdapter().address}/>
                    </div>
                ))
            }
        }
        const midiEffects = deviceHost.midiEffects
        appendChildren(midiEffectsContainer, midiEffects.adapters().map((adapter) => mounts.get(adapter.uuid).editor()))
        appendChildren(instrumentContainer, instrument.getValue().match({
            none: () => <div/>,
            some: (type: AudioUnitInputAdapter) => mounts.get(type.uuid).editor()
        }))
        const audioEffects = deviceHost.audioEffects
        appendChildren(audioEffectsContainer, audioEffects.adapters().map((adapter) => mounts.get(adapter.uuid).editor()))
        const hidden = !optEditing.nonEmpty() || !(audioEffects.isEmpty() && midiEffects.isEmpty())
        noEffectPlaceholder.classList.toggle("hidden", hidden)
        appendChildren(channelStripContainer, (
            <ChannelStrip lifecycle={chainLifecycle}
                          service={service}
                          adapter={deviceHost.audioUnitBoxAdapter()}
                          compact={true}/>
        ))
        updateScroller()
    }))

    const subscribeChain = ({midiEffects, instrument, audioEffects, host}: {
        midiEffects: SortedBoxAdapterCollection<MidiEffectDeviceAdapter, Pointers.MidiEffectHost>,
        instrument: ObservableValue<Option<AudioUnitInputAdapter>>,
        audioEffects: SortedBoxAdapterCollection<AudioEffectDeviceBoxAdapter, Pointers.AudioEffectHost>,
        host: DeviceHost
    }): Terminable => {
        const terminator = new Terminator()
        const instrumentLifecycle = new Terminator()
        terminator.ownAll(
            midiEffects.catchupAndSubscribe({
                onAdd: (adapter: MidiEffectDeviceAdapter) => {
                    mounts.add(DeviceMount.forMidiEffect(service.project, adapter, host, updateDom.request))
                    updateDom.request()
                },
                onRemove: (adapter: MidiEffectDeviceAdapter) => {
                    mounts.removeByKey(adapter.uuid).terminate()
                    updateDom.request()
                },
                onReorder: (_adapter: MidiEffectDeviceAdapter) => updateDom.request()
            }),
            instrument.catchupAndSubscribe(owner => {
                instrumentLifecycle.terminate()
                owner.getValue().ifSome(adapter => {
                    mounts.add(DeviceMount.forInstrument(service.project, adapter, host, updateDom.request))
                    instrumentLifecycle.own({
                        terminate: () => {
                            mounts.removeByKey(adapter.uuid).terminate()
                            updateDom.request()
                        }
                    })
                })
                updateDom.request()
            }),
            audioEffects.catchupAndSubscribe({
                onAdd: (adapter: AudioEffectDeviceBoxAdapter) => {
                    mounts.add(DeviceMount.forAudioEffect(service.project, adapter, host, updateDom.request))
                    updateDom.request()
                },
                onRemove: (adapter: AudioEffectDeviceBoxAdapter) => {
                    mounts.removeByKey(adapter.uuid).terminate()
                    updateDom.request()
                },
                onReorder: (_adapter: AudioEffectDeviceBoxAdapter) => updateDom.request()
            }),
            {
                terminate: () => {
                    mounts.forEach(mount => mount.terminate())
                    mounts.clear()
                    updateDom.request()
                }
            }
        )
        updateDom.request()
        return terminator
    }

    const chainLifeTime = lifecycle.own(new Terminator())
    lifecycle.own(service.sessionService.catchupAndSubscribe((owner: ObservableValue<Option<Session>>) => {
        chainLifeTime.terminate()
        owner.getValue().ifSome(({project: {userInterfaceBox}}) =>
            userInterfaceBox?.editingDeviceChain.catchupAndSubscribe((pointer) => {
                chainLifeTime.terminate()
                if (pointer.isEmpty()) {return}
                const {project: {userInterfaceBox}} = service
                const editingBox = userInterfaceBox.editingDeviceChain.targetVertex.unwrap().box
                const {deviceHost, instrument} = getContext(service.project, editingBox)
                chainLifeTime.own(subscribeChain({
                    midiEffects: deviceHost.midiEffects,
                    instrument,
                    audioEffects: deviceHost.audioEffects,
                    host: deviceHost
                }))
            }))
    }))
    const element: HTMLElement = (
        <div className={className}>
            <div className="devices">
                {devices}
                <Scroller lifecycle={lifecycle} model={scrollModel} floating={true}
                          orientation={Orientation.horizontal}/>
            </div>
            {channelStripContainer}
        </div>
    )
    updateDom.request()
    lifecycle.ownAll(
        Html.watchResize(element, updateScroller),
        scrollModel.subscribe(() => devices.scrollLeft = scrollModel.position),
        Events.subscribe(element, "wheel", (event: WheelEvent) => scrollModel.moveBy(event.deltaX), {passive: true}),
        installAutoScroll(devices, (deltaX, _deltaY) => scrollModel.position += deltaX, {padding: [0, 32, 0, 0]}),
        DevicePanelDragAndDrop.install(service.project, devices, midiEffectsContainer, instrumentContainer, audioEffectsContainer)
    )
    return element
}