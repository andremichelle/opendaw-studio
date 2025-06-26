import {
    AudioFileBox,
    NanoDeviceBox,
    PlayfieldDeviceBox,
    PlayfieldSampleBox,
    TapeDeviceBox,
    TrackBox,
    VaporisateurDeviceBox
} from "@core/data/boxes"
import {UUID} from "std"
import {Utils} from "@/utils"
import {BoxGraph} from "box"
import {TrackType} from "@/audio-engine-shared/adapters/timeline/TrackType.ts"
import {Project} from "@/project/Project.ts"
import {enumToName, IconSymbol} from "@/IconSymbol.ts"
import {Waveform} from "dsp"
import {Modifier} from "@/ui/Modifier.ts"
import {AudioUnitType} from "@core/data/enums.ts"
import {DeviceHost} from "@/audio-engine-shared/adapters/devices"
import {AudioUnitBoxAdapter} from "@/audio-engine-shared/adapters/audio-unit/AudioUnitBoxAdapter"

export namespace Instruments {
    export interface Factory {
        defaultName: string
        icon: IconSymbol
        description: string
        createDevice: (boxGraph: BoxGraph, deviceHost: DeviceHost, name: string, icon: IconSymbol) => DeviceBox
        createTrack: (boxGraph: BoxGraph, deviceHost: DeviceHost) => TrackBox
    }

    export type CreationOptions = { name?: string, icon?: IconSymbol }

    export type DeviceBox = TapeDeviceBox | VaporisateurDeviceBox | NanoDeviceBox | PlayfieldDeviceBox

    export type FactoryResult = {
        device: DeviceBox
        track: TrackBox
    }

    const useFile = (boxGraph: BoxGraph, fileUUID: UUID.Format, name: string) => boxGraph.findBox<AudioFileBox>(fileUUID)
        .unwrapOrElse(() => AudioFileBox.create(boxGraph, fileUUID, box => {
            box.fileName.setValue(name)
        }))

    export const Tape: Factory = {
        defaultName: "Tape",
        icon: IconSymbol.Tape,
        description: "Plays audio regions & clips",
        createDevice: (boxGraph: BoxGraph, deviceHost: DeviceHost, name: string, icon: IconSymbol): TapeDeviceBox =>
            TapeDeviceBox.create(boxGraph, UUID.generate(), box => {
                box.label.setValue(name)
                box.icon.setValue(enumToName(icon))
                box.flutter.setValue(0.2)
                box.wow.setValue(0.05)
                box.noise.setValue(0.02)
                box.saturation.setValue(0.5)
                box.host.refer(deviceHost.inputField)
            }),
        createTrack: (boxGraph: BoxGraph, deviceHost: DeviceHost) =>
            TrackBox.create(boxGraph, UUID.generate(), box => {
                box.index.setValue(0)
                box.type.setValue(TrackType.Audio)
                box.tracks.refer(deviceHost.tracksField)
                box.target.refer(deviceHost.audioUnitBoxAdapter().box)
            })
    }

    export const Nano: Factory = {
        defaultName: "Nano",
        icon: IconSymbol.NanoWave,
        description: "Simple Sampler",
        createDevice: (boxGraph: BoxGraph, deviceHost: DeviceHost, name: string, icon: IconSymbol): NanoDeviceBox => {
            const fileUUID = UUID.parse("c1678daa-4a47-4cba-b88f-4f4e384663c3")
            const audioFileBox: AudioFileBox = boxGraph.findBox<AudioFileBox>(fileUUID)
                .unwrapOrElse(() => AudioFileBox.create(boxGraph, fileUUID, box => {
                    box.fileName.setValue("Rhode")
                }))
            return NanoDeviceBox.create(boxGraph, UUID.generate(), box => {
                box.label.setValue(name)
                box.icon.setValue(enumToName(icon))
                box.file.refer(audioFileBox)
                box.host.refer(deviceHost.inputField)
            })
        },
        createTrack: (boxGraph: BoxGraph, deviceHost: DeviceHost) =>
            TrackBox.create(boxGraph, UUID.generate(), box => {
                box.index.setValue(0)
                box.type.setValue(TrackType.Notes)
                box.tracks.refer(deviceHost.tracksField)
                box.target.refer(deviceHost.audioUnitBoxAdapter().box)
            })
    }

    export const Playfield: Factory = {
        defaultName: "Playfield",
        icon: IconSymbol.Playfield,
        description: "Drumcomputer",
        createDevice: (boxGraph: BoxGraph, deviceHost: DeviceHost, name: string, icon: IconSymbol): PlayfieldDeviceBox => {
            const deviceBox = PlayfieldDeviceBox.create(boxGraph, UUID.generate(), box => {
                box.label.setValue(name)
                box.icon.setValue(enumToName(icon))
                box.host.refer(deviceHost.inputField)
            })
            const files = [
                useFile(boxGraph, UUID.parse("8bb2c6e8-9a6d-4d32-b7ec-1263594ef367"), "909 Bassdrum"),
                useFile(boxGraph, UUID.parse("0017fa18-a5eb-4d9d-b6f2-e2ddd30a3010"), "909 Snare"),
                useFile(boxGraph, UUID.parse("28d14cb9-1dc6-4193-9dd7-4e881f25f520"), "909 Low Tom"),
                useFile(boxGraph, UUID.parse("21f92306-d6e7-446c-a34b-b79620acfefc"), "909 Mid Tom"),
                useFile(boxGraph, UUID.parse("ad503883-8a72-46ab-a05b-a84149953e17"), "909 High Tom"),
                useFile(boxGraph, UUID.parse("cfee850b-7658-4d08-9e3b-79d196188504"), "909 Rimshot"),
                useFile(boxGraph, UUID.parse("32a6f36f-06eb-4b84-bb57-5f51103eb9e6"), "909 Clap"),
                useFile(boxGraph, UUID.parse("e0ac4b39-23fb-4a56-841d-c9e0ff440cab"), "909 Closed Hat"),
                useFile(boxGraph, UUID.parse("51c5eea4-391c-4743-896a-859692ec1105"), "909 Open Hat"),
                useFile(boxGraph, UUID.parse("42a56ff6-89b6-4f2e-8a66-5a41d316f4cb"), "909 Crash"),
                useFile(boxGraph, UUID.parse("87cde966-b799-4efc-a994-069e703478d3"), "909 Ride")
            ]
            const samples = files.map((file, index) => PlayfieldSampleBox.create(boxGraph, UUID.generate(), box => {
                box.device.refer(deviceBox.samples)
                box.file.refer(file)
                box.index.setValue(60 + index)
            }))
            samples[7].exclude.setValue(true)
            samples[8].exclude.setValue(true)
            return deviceBox
        },
        createTrack: (boxGraph: BoxGraph, deviceHost: DeviceHost) =>
            TrackBox.create(boxGraph, UUID.generate(), box => {
                box.index.setValue(0)
                box.type.setValue(TrackType.Notes)
                box.tracks.refer(deviceHost.tracksField)
                box.target.refer(deviceHost.audioUnitBoxAdapter().box)
            })
    }

    export const Vaporisateur: Factory = {
        defaultName: "Vaporisateur",
        icon: IconSymbol.Piano,
        description: "Classic subtractive synthesizer",
        createDevice: (boxGraph: BoxGraph, deviceHost: DeviceHost, name: string, icon: IconSymbol): VaporisateurDeviceBox =>
            VaporisateurDeviceBox.create(boxGraph, UUID.generate(), box => {
                box.label.setValue(name)
                box.icon.setValue(enumToName(icon))
                box.tune.setInitValue(0.0)
                box.cutoff.setInitValue(1000.0)
                box.resonance.setInitValue(0.1)
                box.attack.setInitValue(0.005)
                box.release.setInitValue(0.1)
                box.waveform.setInitValue(Waveform.sine)
                box.host.refer(deviceHost.inputField)
            }),
        createTrack: (boxGraph: BoxGraph, deviceHost: DeviceHost) =>
            TrackBox.create(boxGraph, UUID.generate(), box => {
                box.index.setValue(0)
                box.type.setValue(TrackType.Notes)
                box.tracks.refer(deviceHost.tracksField)
                box.target.refer(deviceHost.audioUnitBoxAdapter().box)
            })
    }

    export const create = (project: Project,
                           factory: Factory, {name, icon}: CreationOptions = {}): FactoryResult => {
        const {boxGraph, boxAdapters, rootBoxAdapter, userEditingManager} = project
        const existingNames = rootBoxAdapter.audioUnits.adapters()
            .map(adapter => adapter.input.getValue().match({
                none: () => "Untitled",
                some: adapter => adapter.labelField.getValue()
            }))
        const audioUnitBox = Modifier.createAudioUnit(project, AudioUnitType.Instrument)
        const audioUnitBoxAdapter = boxAdapters.adapterFor(audioUnitBox, AudioUnitBoxAdapter)
        const uniqueName = Utils.getUniqueName(existingNames, name ?? factory.defaultName)
        const iconSymbol = icon ?? factory.icon
        const device = factory.createDevice(boxGraph, audioUnitBoxAdapter, uniqueName, iconSymbol)
        const track = factory.createTrack(boxGraph, audioUnitBoxAdapter)
        userEditingManager.audioUnit.edit(audioUnitBox.editing)
        return {device, track}
    }

    export const Named = {Vaporisateur, Playfield, Nano, Tape}
    export type Keys = keyof typeof Named
}