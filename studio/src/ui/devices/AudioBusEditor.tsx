import css from "./AudioBusEditor.sass?inline"
import {Lifecycle} from "std"
import {createElement} from "jsx"
import {DeviceEditor} from "@/ui/devices/DeviceEditor.tsx"
import {Project} from "@/project/Project.ts"
import {AudioBusBoxAdapter} from "@core/shared/adapters/audio-unit/AudioBusBoxAdapter.ts"
import {MenuItems} from "@/ui/devices/menu-items.ts"
import {IconSymbol} from "@core/IconSymbol.ts"
import {DevicePeakMeter} from "@/ui/devices/panel/DevicePeakMeter.tsx"
import {Html} from "dom"

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