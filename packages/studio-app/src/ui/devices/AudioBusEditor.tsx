import css from "./AudioBusEditor.sass?inline"
import {Lifecycle} from "opendaw-std"
import {createElement} from "opendaw-jsx"
import {DeviceEditor} from "@/ui/devices/DeviceEditor.tsx"
import {Project} from "@/project/Project.ts"
import {AudioBusBoxAdapter} from "studio-shared"
import {MenuItems} from "@/ui/devices/menu-items.ts"
import {IconSymbol} from "studio-shared"
import {DevicePeakMeter} from "@/ui/devices/panel/DevicePeakMeter.tsx"
import {Html} from "opendaw-dom"

const className = Html.adoptStyleSheet(css, "Editor")

type Construct = {
    lifecycle: Lifecycle
    project: Project
    adapter: AudioBusBoxAdapter
}

export const AudioBusEditor = ({lifecycle, project, adapter}: Construct) => (
    <DeviceEditor lifecycle={lifecycle}
                  project={project}
                  adapter={adapter}
                  populateMenu={parent => MenuItems.forAudioUnitInput(parent, project, adapter.deviceHost())}
                  populateControls={() => false}
                  populateMeter={() => (
                      <DevicePeakMeter lifecycle={lifecycle}
                                       receiver={project.liveStreamReceiver}
                                       address={adapter.address}/>
                  )}
                  icon={IconSymbol.Merge}>
        <div className={className}>
            <span>audio-bus</span>
        </div>
    </DeviceEditor>
)