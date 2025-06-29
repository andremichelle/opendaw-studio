import css from "./ReverbDeviceEditor.sass?inline"
import {ReverbDeviceBoxAdapter} from "studio-shared"
import {Lifecycle} from "opendaw-std"
import {createElement} from "opendaw-jsx"
import {DeviceEditor} from "@/ui/devices/DeviceEditor.tsx"
import {MenuItems} from "@/ui/devices/menu-items.ts"
import {Project} from "@/project/Project.ts"
import {ControlBuilder} from "@/ui/devices/ControlBuilder.tsx"
import {SnapCommonDecibel} from "@/ui/configs.ts"
import {DevicePeakMeter} from "@/ui/devices/panel/DevicePeakMeter.tsx"
import {Effects} from "@/service/Effects"
import {Html} from "opendaw-dom"
import {DeviceHost} from "studio-shared"

const className = Html.adoptStyleSheet(css, "ReverbDeviceEditor")

type Construct = {
    lifecycle: Lifecycle
    project: Project
    adapter: ReverbDeviceBoxAdapter
    deviceHost: DeviceHost
}

export const ReverbDeviceEditor = ({lifecycle, project, adapter, deviceHost}: Construct) => {
    const {editing, midiDevices} = project
    const {decay, preDelay, damp, dry, wet} = adapter.namedParameter
    return (
        <DeviceEditor lifecycle={lifecycle}
                      project={project}
                      adapter={adapter}
                      populateMenu={parent => MenuItems.forEffectDevice(parent, project, deviceHost, adapter)}
                      populateControls={() => (
                          <div className={className}>
                              {ControlBuilder.createKnob({
                                  lifecycle, editing, midiDevices, adapter, parameter: decay
                              })}
                              <div/>
                              {ControlBuilder.createKnob({
                                  lifecycle, editing, midiDevices, adapter, parameter: preDelay
                              })}
                              {ControlBuilder.createKnob({
                                  lifecycle, editing, midiDevices, adapter, parameter: damp
                              })}
                              {ControlBuilder.createKnob({
                                  lifecycle,
                                  editing,
                                  midiDevices,
                                  adapter,
                                  parameter: dry,
                                  options: SnapCommonDecibel
                              })}
                              {ControlBuilder.createKnob({
                                  lifecycle,
                                  editing,
                                  midiDevices,
                                  adapter,
                                  parameter: wet,
                                  options: SnapCommonDecibel
                              })}
                          </div>
                      )}
                      populateMeter={() => (
                          <DevicePeakMeter lifecycle={lifecycle}
                                           receiver={project.liveStreamReceiver}
                                           address={adapter.address}/>
                      )}
                      icon={Effects.AudioNamed.Reverb.icon}/>
    )
}