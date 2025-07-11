import css from "./EuclidDeviceEditor.sass?inline"
import {Lifecycle} from "std"
import {DeviceEditor} from "@/ui/devices/DeviceEditor.tsx"
import {MenuItems} from "@/ui/devices/menu-items.ts"
import {Project} from "@/project/Project.ts"
import {createElement} from "jsx"
import {ControlBuilder} from "@/ui/devices/ControlBuilder.tsx"
import {DeviceMidiMeter} from "@/ui/devices/panel/DeviceMidiMeter.tsx"
import {Html} from "dom"
import {Effects} from "@/service/Effects"
import {DeviceHost} from "@/audio-engine-shared/adapters/devices"
import { EuclidDeviceBoxAdapter } from "@/audio-engine-shared/adapters/devices/midi-effects/EuclidDeviceBoxAdapter"

const className = Html.adoptStyleSheet(css, "EuclidDeviceEditor")

type Construct = {
    lifecycle: Lifecycle
    project: Project
    adapter: EuclidDeviceBoxAdapter
    deviceHost: DeviceHost
}

export const EuclidDeviceEditor = ({lifecycle, project, adapter, deviceHost}: Construct) => {
    const {steps, notes, gate, rotation, velocity, division, accent} = adapter.namedParameter
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
                                  parameter: steps
                              })}
                              {ControlBuilder.createKnob({
                                  lifecycle,
                                  editing,
                                  midiDevices,
                                  adapter,
                                  parameter: notes
                              })}
                              {ControlBuilder.createKnob({
                                  lifecycle,
                                  editing,
                                  midiDevices,
                                  adapter,
                                  parameter: division,
                              })}
                              {ControlBuilder.createKnob({
                                  lifecycle,
                                  editing,
                                  midiDevices,
                                  adapter,
                                  parameter: rotation,
                                })}
                              {ControlBuilder.createKnob({
                                  lifecycle,
                                  editing,
                                  midiDevices,
                                  adapter,
                                  parameter: accent,
                                })}
                              {ControlBuilder.createKnob({
                                  lifecycle,
                                  editing,
                                  midiDevices,
                                  adapter,
                                  parameter: gate
                              })}
                              {ControlBuilder.createKnob({
                                  lifecycle,
                                  editing,
                                  midiDevices,
                                  adapter,
                                  parameter: velocity
                              })}
                          </div>
                      )}
                      populateMeter={() => (
                          <DeviceMidiMeter lifecycle={lifecycle}
                                           receiver={project.liveStreamReceiver}
                                           address={adapter.address}/>
                      )}
                      icon={Effects.MidiNamed.euclid.icon}/>
    )
}