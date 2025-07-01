import css from "./ZeitgeistDeviceEditor.sass?inline"
import {
    ZeitgeistDeviceBoxAdapter
} from "studio-adapters"
import {Lifecycle} from "lib-std"
import {DeviceEditor} from "@/ui/devices/DeviceEditor.tsx"
import {MenuItems} from "@/ui/devices/menu-items.ts"
import {Project} from "@/project/Project.ts"
import {createElement} from "lib-jsx"
import {ControlBuilder} from "@/ui/devices/ControlBuilder.tsx"
import {DeviceMidiMeter} from "@/ui/devices/panel/DeviceMidiMeter.tsx"
import {Html} from "lib-dom"
import {Effects} from "@/service/Effects"
import {DeviceHost} from "studio-adapters"
import {GrooveShuffleBoxAdapter} from "studio-adapters"

const className = Html.adoptStyleSheet(css, "ZeitgeistDeviceEditor")

type Construct = {
    lifecycle: Lifecycle
    project: Project
    adapter: ZeitgeistDeviceBoxAdapter
    deviceHost: DeviceHost
}

export const ZeitgeistDeviceEditor = ({lifecycle, project, adapter, deviceHost}: Construct) => {
    const grooveAdapter = adapter.groove() as GrooveShuffleBoxAdapter
    const {amount, duration} = grooveAdapter.namedParameter
    const {editing, midiDevices} = project
    return (
        <DeviceEditor lifecycle={lifecycle}
                      project={project}
                      adapter={adapter}
                      populateMenu={parent => MenuItems.forEffectDevice(parent, project, deviceHost, adapter)}
                      populateControls={() => (
                          <div className={className}>
                              {ControlBuilder.createKnob({
                                  lifecycle,
                                  editing,
                                  midiDevices,
                                  adapter,
                                  parameter: amount
                              })}
                              {ControlBuilder.createKnob({
                                  lifecycle,
                                  editing,
                                  midiDevices,
                                  adapter,
                                  parameter: duration
                              })}
                          </div>
                      )}
                      populateMeter={() => (
                          <DeviceMidiMeter lifecycle={lifecycle}
                                           receiver={project.liveStreamReceiver}
                                           address={adapter.address}/>
                      )}
                      icon={Effects.MidiNamed.Zeitgeist.icon}/>
    )
}