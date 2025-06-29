import css from "./NanoDeviceEditor.sass?inline"
import {asInstanceOf, Lifecycle} from "lib-std"
import {createElement} from "lib-jsx"
import {DeviceEditor} from "@/ui/devices/DeviceEditor.tsx"
import {MenuItems} from "@/ui/devices/menu-items.ts"
import {Project} from "@/project/Project.ts"
import {IconSymbol} from "studio-shared"
import {NanoDeviceBoxAdapter} from "studio-shared"
import {ControlBuilder} from "@/ui/devices/ControlBuilder.tsx"
import {DevicePeakMeter} from "@/ui/devices/panel/DevicePeakMeter.tsx"
import {Html} from "lib-dom"
import {AudioFileBox} from "studio-boxes"
import {Icon} from "@/ui/components/Icon"
import {Instruments} from "@/service/Instruments"
import {SampleSelector, SampleSelectStrategy} from "@/ui/devices/SampleSelector"
import {DeviceHost} from "studio-shared"

const className = Html.adoptStyleSheet(css, "NanoDeviceEditor")

type Construct = {
    lifecycle: Lifecycle
    project: Project
    adapter: NanoDeviceBoxAdapter
    deviceHost: DeviceHost
}

export const NanoDeviceEditor = ({lifecycle, project, adapter, deviceHost}: Construct) => {
    const {volume, release} = adapter.namedParameter
    const {service, editing, midiDevices} = project
    const sampleDropZone: HTMLElement = (
        <div className="sample-drop">
            <Icon symbol={IconSymbol.Waveform}/>
        </div>
    )
    const sampleSelector = new SampleSelector(service, SampleSelectStrategy.forPointerField(adapter.box.file))
    lifecycle.ownAll(
        adapter.box.file.catchupAndSubscribe(pointer => pointer.targetVertex.match({
            none: () => sampleDropZone.removeAttribute("sample"),
            some: ({box}) => sampleDropZone.setAttribute("sample", asInstanceOf(box, AudioFileBox).fileName.getValue())
        })),
        sampleSelector.configureBrowseClick(sampleDropZone),
        sampleSelector.configureContextMenu(sampleDropZone),
        sampleSelector.configureDrop(sampleDropZone)
    )
    return (
        <DeviceEditor lifecycle={lifecycle}
                      project={project}
                      adapter={adapter}
                      populateMenu={parent => MenuItems.forAudioUnitInput(parent, project, deviceHost)}
                      populateControls={() => (
                          <div className={className}>
                              {ControlBuilder.createKnob({
                                  lifecycle,
                                  editing,
                                  midiDevices,
                                  adapter,
                                  parameter: volume
                              })}
                              {ControlBuilder.createKnob({
                                  lifecycle,
                                  editing,
                                  midiDevices,
                                  adapter,
                                  parameter: release
                              })}
                              {sampleDropZone}
                          </div>
                      )}
                      populateMeter={() => (
                          <DevicePeakMeter lifecycle={lifecycle}
                                           receiver={project.liveStreamReceiver}
                                           address={adapter.address}/>
                      )}
                      icon={Instruments.Nano.icon}/>
    )
}