import css from "./DelayDeviceEditor.sass?inline"
import {DelayDeviceBoxAdapter} from "@core/shared/adapters/devices/audio-effects/DelayDeviceBoxAdapter.ts"
import {Lifecycle} from "std"
import {createElement} from "jsx"
import {DeviceEditor} from "@/ui/devices/DeviceEditor.tsx"
import {MenuItems} from "@/ui/devices/menu-items.ts"
import {Project} from "@/project/Project.ts"
import {ControlBuilder} from "@/ui/devices/ControlBuilder.tsx"
import {SnapCommonDecibel} from "@/ui/configs.ts"
import {DevicePeakMeter} from "@/ui/devices/panel/DevicePeakMeter.tsx"
import {Html} from "dom"
import {Effects} from "@/service/Effects"
import {DeviceHost} from "@core/shared/devices.ts"

const className = Html.adoptStyleSheet(css, "DelayDeviceEditor")

type Construct = {
    lifecycle: Lifecycle
    project: Project
    adapter: DelayDeviceBoxAdapter
    deviceHost: DeviceHost
}

export const DelayDeviceEditor = ({lifecycle, project, adapter, deviceHost}: Construct) => {
    const {delay, feedback, cross, filter, dry, wet} = adapter.namedParameter
    const {editing, midiDevices} = project
    return (
        <DeviceEditor lifecycle={lifecycle}
                      project={project}
                      adapter={adapter}
                      populateMenu={parent => MenuItems.forEffectDevice(parent, project, deviceHost, adapter)}
                      populateControls={() => (
                          <div className={className}>
                              {ControlBuilder.createKnob({lifecycle, editing, midiDevices, adapter, parameter: delay})}
                              {ControlBuilder.createKnob({
                                  lifecycle,
                                  editing,
                                  midiDevices,
                                  adapter,
                                  parameter: feedback
                              })}
                              {ControlBuilder.createKnob({
                                  lifecycle,
                                  editing,
                                  midiDevices,
                                  adapter,
                                  parameter: cross,
                                  anchor: 0.5
                              })}
                              {ControlBuilder.createKnob({
                                  lifecycle,
                                  editing,
                                  midiDevices,
                                  adapter,
                                  parameter: filter,
                                  anchor: 0.5
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
                          </div>)}
                      populateMeter={() => (
                          <DevicePeakMeter lifecycle={lifecycle}
                                           receiver={project.liveStreamReceiver}
                                           address={adapter.address}/>
                      )}
                      icon={Effects.AudioNamed.Delay.icon}/>
    )
}