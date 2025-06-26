import {BooleanField, Box, Field, Int32Field, PointerField, StringField} from "box"
import {Pointers} from "@core/data/pointers.ts"
import {Arrays, asDefined, assert, AssertType, int, Option, panic, UUID} from "std"
import {
    ArpeggioDeviceBox,
    BoxVisitor,
    DelayDeviceBox,
    ModularDeviceBox,
    PitchDeviceBox,
    RevampDeviceBox,
    ReverbDeviceBox,
    StereoToolDeviceBox,
    ZeitgeistDeviceBox
} from "@core/data/boxes"
import {TrackType} from "@/audio-engine-shared/adapters/timeline/TrackType.ts"
import {SortedBoxAdapterCollection} from "@/audio-engine-shared/adapters/SortedBoxAdapterCollection"
import {AudioUnitBoxAdapter} from "@/audio-engine-shared/adapters/audio-unit/AudioUnitBoxAdapter"
import {AudioUnitInputAdapter} from "@/audio-engine-shared/adapters/audio-unit/AudioUnitInputAdapter"
import {BoxAdapter} from "@/audio-engine-shared/BoxAdapter"

export type DeviceType = "midi-effect" | "bus" | "instrument" | "audio-effect"
export type DeviceAccepts = "midi" | "audio" | false

export namespace DeviceAccepts {
    export const toTrackType = (type: DeviceAccepts) => {
        switch (type) {
            case "midi":
                return TrackType.Notes
            case "audio":
                return TrackType.Audio
            default:
                return panic()
        }
    }
}

export interface MidiEffectDeviceAdapter extends EffectDeviceBoxAdapter<Pointers.MidiEffectHost> {
    readonly type: "midi-effect"
    readonly accepts: "midi"
}

export interface AudioEffectDeviceBoxAdapter extends EffectDeviceBoxAdapter<Pointers.AudioEffectHost> {
    readonly type: "audio-effect"
    readonly accepts: "audio"
}

export type EffectPointerType = Pointers.AudioEffectHost | Pointers.MidiEffectHost

export interface EffectDeviceBoxAdapter<P extends EffectPointerType = EffectPointerType> extends DeviceBoxAdapter {
    readonly type: "audio-effect" | "midi-effect"
    readonly accepts: "audio" | "midi"

    get indexField(): Int32Field
    get enabledField(): BooleanField
    get host(): PointerField<P>
}

export interface InstrumentDeviceBoxAdapter extends DeviceBoxAdapter {
    readonly type: "instrument"

    get iconField(): StringField
    get defaultTrackType(): TrackType
    get acceptsMidiEvents(): boolean
}

export interface DeviceHost extends BoxAdapter {
    readonly class: "device-host"

    get midiEffects(): SortedBoxAdapterCollection<MidiEffectDeviceAdapter, Pointers.MidiEffectHost>
    get inputAdapter(): Option<AudioUnitInputAdapter>
    get audioEffects(): SortedBoxAdapterCollection<AudioEffectDeviceBoxAdapter, Pointers.AudioEffectHost>
    get inputField(): Field<Pointers.InstrumentHost | Pointers.AudioOutput>
    get tracksField(): Field<Pointers.TrackCollection>
    get minimizedField(): BooleanField
    get isAudioUnit(): boolean
    get label(): string

    audioUnitBoxAdapter(): AudioUnitBoxAdapter
}

export interface DeviceBoxAdapter extends BoxAdapter {
    readonly type: DeviceType

    get box(): Box
    get labelField(): StringField
    get enabledField(): BooleanField
    get minimizedField(): BooleanField
    get accepts(): DeviceAccepts

    deviceHost(): DeviceHost
    audioUnitBoxAdapter(): AudioUnitBoxAdapter
}

export namespace Devices {
    export const isAny: AssertType<DeviceBoxAdapter> = (adapter: unknown): adapter is DeviceBoxAdapter =>
        adapter !== null && typeof adapter === "object" && "type" in adapter
        && (adapter.type === "midi-effect" || adapter.type === "bus"
            || adapter.type === "instrument" || adapter.type === "audio-effect")
    export const isEffect: AssertType<EffectDeviceBoxAdapter> = (adapter: unknown): adapter is EffectDeviceBoxAdapter =>
        adapter !== null && typeof adapter === "object" && "type" in adapter
        && (adapter.type === "midi-effect" || adapter.type === "audio-effect")
    export const isInstrument: AssertType<InstrumentDeviceBoxAdapter> = (adapter: unknown): adapter is InstrumentDeviceBoxAdapter =>
        adapter !== null && typeof adapter === "object" && "type" in adapter && adapter.type === "instrument"
    export const isMidiEffect: AssertType<MidiEffectDeviceAdapter> = (adapter: unknown): adapter is MidiEffectDeviceAdapter =>
        adapter !== null && typeof adapter === "object" && "type" in adapter && adapter.type === "midi-effect"
    export const isAudioEffect: AssertType<AudioEffectDeviceBoxAdapter> = (adapter: unknown): adapter is AudioEffectDeviceBoxAdapter =>
        adapter !== null && typeof adapter === "object" && "type" in adapter && adapter.type === "audio-effect"
    export const isHost: AssertType<DeviceHost> = (value: unknown): value is DeviceHost =>
        value !== null && typeof value === "object" && "class" in value && value.class === "device-host"

    export const fetchEffectIndex = (box: Box) => asDefined(box.accept<BoxVisitor<Int32Field<any>>>({
        visitArpeggioDeviceBox: (box: ArpeggioDeviceBox) => box.index,
        visitPitchDeviceBox: (box: PitchDeviceBox) => box.index,
        visitStereoToolDeviceBox: (box: StereoToolDeviceBox) => box.index,
        visitDelayDeviceBox: (box: DelayDeviceBox) => box.index,
        visitModularDeviceBox: (box: ModularDeviceBox) => box.index,
        visitRevampDeviceBox: (box: RevampDeviceBox) => box.index,
        visitReverbDeviceBox: (box: ReverbDeviceBox) => box.index,
        visitZeitgeistDeviceBox: (box: ZeitgeistDeviceBox) => box.index
    }), `No index-field found for ${box}`)

    export const deleteEffectDevices = (devices: ReadonlyArray<EffectDeviceBoxAdapter>): void => {
        if (devices.length === 0) {return}
        assert(Arrays.satisfy(devices, (a, b) => a.deviceHost().address.equals(b.deviceHost().address)),
            "Devices are not connected to the same host")
        const device: EffectDeviceBoxAdapter = devices[0]
        const targets = device.accepts === "audio"
            ? device.deviceHost().audioEffects.field().pointerHub.filter(Pointers.AudioEffectHost)
            : device.accepts === "midi"
                ? device.deviceHost().midiEffects.field().pointerHub.filter(Pointers.MidiEffectHost)
                : panic("unknown type")
        targets.map(({box}) => fetchEffectIndex(box))
            .filter(index => devices.some(device => UUID.Comparator(device.uuid, index.address.uuid) !== 0))
            .sort((a, b) => a.getValue() - b.getValue())
            .forEach((indexField, index: int) => indexField.setValue(index))
        devices.forEach(device => device.box.delete())
    }
}