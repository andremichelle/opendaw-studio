import css from "./TapeDeviceEditor.sass?inline"
import {Lifecycle} from "lib-std"
import {createElement} from "lib-jsx"
import {DeviceEditor} from "@/ui/devices/DeviceEditor.tsx"
import {Tape} from "@/ui/devices/instruments/TapeDeviceEditor/Tape.tsx"
import {Project} from "@/project/Project.ts"
import {Timeline} from "@/ui/devices/instruments/TapeDeviceEditor/Timeline.tsx"
import {AudioUnitTracks} from "studio-adapters"
import {MenuItems} from "@/ui/devices/menu-items.ts"
import {TapeDeviceBoxAdapter} from "studio-adapters"
import {DevicePeakMeter} from "@/ui/devices/panel/DevicePeakMeter.tsx"
import {Html} from "lib-dom"
import {Instruments} from "@/service/Instruments"
import {DeviceHost} from "studio-adapters"

const className = Html.adoptStyleSheet(css, "TapeDeviceEditor")

type Construct = {
    lifecycle: Lifecycle
    project: Project
    adapter: TapeDeviceBoxAdapter
    deviceHost: DeviceHost
}

export const TapeDeviceEditor = ({lifecycle, project, adapter, deviceHost}: Construct) => {
    const tracks: AudioUnitTracks = deviceHost.audioUnitBoxAdapter().tracks
    return (
        <DeviceEditor lifecycle={lifecycle}
                      project={project}
                      adapter={adapter}
                      populateMenu={parent => MenuItems.forAudioUnitInput(parent, project, deviceHost)}
                      populateControls={() => (
                          <div className={className}>
                              <div className="controls"/>
                              <div className="content">
                                  <Tape lifecycle={lifecycle} project={project} tracks={tracks}/>
                                  <Timeline lifecycle={lifecycle} project={project} tracks={tracks}/>
                              </div>
                          </div>
                      )}
                      populateMeter={() => (
                          <DevicePeakMeter lifecycle={lifecycle}
                                           receiver={project.liveStreamReceiver}
                                           address={adapter.address}/>
                      )}
                      icon={Instruments.Tape.icon}/>
    )
}