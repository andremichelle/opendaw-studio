import { DeviceClashBox } from "./clash"
import { DelayDeviceBox } from "./audio-effects/DelayDeviceBox"
import { DeviceInterfaceKnobBox, ModularDeviceBox } from "./modular"
import { RevampDeviceBox } from "./audio-effects/RevampDeviceBox"
import { ReverbDeviceBox } from "./audio-effects/ReverbDeviceBox"
import { TapeDeviceBox } from "./instruments/TapeDeviceBox"
import { VaporisateurDeviceBox } from "./instruments/VaporisateurDeviceBox"
import { ArpeggioDeviceBox } from "./midi-effects/ArpeggioDeviceBox"
import { PitchDeviceBox } from "./midi-effects/PitchDeviceBox"
import { NanoDeviceBox } from "./instruments/NanoDeviceBox"
import { PlayfieldDeviceBox, PlayfieldSampleBox } from "./instruments/PlayfieldDeviceBox"
import { StereoToolDeviceBox } from "./audio-effects/StereoToolDeviceBox"
import { ZeitgeistDeviceBox } from "./midi-effects/ZeitGeistDeviceBox"
import { EuclidDeviceBox } from "./midi-effects/EuclidDeviceBox"

export const DeviceDefinitions = [
	DeviceInterfaceKnobBox,
	ModularDeviceBox,
	DeviceClashBox,
	StereoToolDeviceBox,
	DelayDeviceBox,
	RevampDeviceBox,
	ReverbDeviceBox,
	VaporisateurDeviceBox,
	NanoDeviceBox,
	PlayfieldDeviceBox, PlayfieldSampleBox,
	TapeDeviceBox,
	ArpeggioDeviceBox,
	PitchDeviceBox,
	ZeitgeistDeviceBox,
	EuclidDeviceBox
]