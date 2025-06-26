import {InstrumentDeviceBoxAdapter} from "@core/shared/devices.ts"
import {AudioBusBoxAdapter} from "@core/shared/adapters/audio-unit/AudioBusBoxAdapter.ts"

export type AudioUnitInputAdapter = InstrumentDeviceBoxAdapter | AudioBusBoxAdapter