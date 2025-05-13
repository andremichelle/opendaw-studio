import { byte, DefaultObservableValue, float, Lifecycle } from "std"
import { createElement } from "jsx"
import { DeviceEditor } from "@/ui/devices/DeviceEditor.tsx"
import { MenuItems } from "@/ui/devices/menu-items.ts"
import { Project } from "@/project/Project.ts"
import { DevicePeakMeter } from "@/ui/devices/panel/DevicePeakMeter.tsx"
import { Instruments } from "@/service/Instruments"
import { PlayfieldDeviceBoxAdapter } from "@/audio-engine-shared/adapters/devices/instruments/PlayfieldDeviceBoxAdapter"
import { MenuItem } from "@/ui/model/menu-item"
import { DeviceHost } from "@/audio-engine-shared/adapters/devices"
import { SlotGrid } from "@/ui/devices/instruments/PlayfieldDeviceEditor/SlotGrid"
import { NoteSender } from "@/audio-engine-shared/NoteSender"

type Construct = {
	lifecycle: Lifecycle
	project: Project
	adapter: PlayfieldDeviceBoxAdapter
	deviceHost: DeviceHost
}

const octave = new DefaultObservableValue(5) // TODO Make that bound to its PlayfieldDeviceBoxAdapter

export const PlayfieldDeviceEditor = ({ lifecycle, project, adapter, deviceHost }: Construct) => {
	const engine = project.service.engine
	const noteSender: NoteSender = {
		noteOn: (note: byte, velocity: float) => engine.noteOn(deviceHost.uuid, note, velocity),
		noteOff: (note: byte) => engine.noteOff(deviceHost.uuid, note)
	}
	return (
		<DeviceEditor lifecycle={lifecycle}
									project={project}
									adapter={adapter}
									populateMenu={parent => {
										parent.addMenuItem(MenuItem.default({ label: "Reset All" })
											.setTriggerProcedure(() => project.editing.modify(() => adapter.reset())))
										MenuItems.forAudioUnitInput(parent, project, deviceHost)
									}}
									populateControls={() => (
										<SlotGrid lifecycle={lifecycle}
															service={project.service}
															noteSender={noteSender}
															adapter={adapter}
															octave={octave} />
									)}
									populateMeter={() => (
										<DevicePeakMeter lifecycle={lifecycle}
																		 receiver={project.liveStreamReceiver}
																		 address={adapter.address} />
									)}
									icon={Instruments.Playfield.icon} />
	)
}