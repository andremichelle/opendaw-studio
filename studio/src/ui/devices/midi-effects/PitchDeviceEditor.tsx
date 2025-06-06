import css from "./PitchDeviceEditor.sass?inline"
import {PitchDeviceBoxAdapter} from "@/audio-engine-shared/adapters/devices/midi-effects/PitchDeviceBoxAdapter.ts"
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

const className = Html.adoptStyleSheet(css, "PitchDeviceEditor")

type Construct = {
    lifecycle: Lifecycle
    project: Project
    adapter: PitchDeviceBoxAdapter
    deviceHost: DeviceHost
}

export const PitchDeviceEditor = ({lifecycle, project, adapter, deviceHost}: Construct) => {
    const {octaves, semiTones, cent} = adapter.namedParameter
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
                                  parameter: octaves
                              })}
                              {ControlBuilder.createKnob({
                                  lifecycle,
                                  editing,
                                  midiDevices,
                                  adapter,
                                  parameter: semiTones
                              })}
                              {ControlBuilder.createKnob({
                                  lifecycle,
                                  editing,
                                  midiDevices,
                                  adapter,
                                  parameter: cent
                              })}
                          </div>
                      )}
                      populateMeter={() => (
                          <DeviceMidiMeter lifecycle={lifecycle}
                                           receiver={project.liveStreamReceiver}
                                           address={adapter.address}/>
                      )}
                      icon={Effects.MidiNamed.pitch.icon}/>
    )
}