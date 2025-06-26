import {AudioUnitBox} from "@core/data/boxes"
import {int, Option, StringMapping, Terminator, UUID, ValueMapping} from "std"
import {ParameterAdapterSet} from "@core/shared/ParameterAdapterSet.ts"
import {Address, BooleanField, Field, Int32Field} from "box"
import {Pointers} from "@core/data/pointers.ts"
import {AudioEffectDeviceBoxAdapter, DeviceHost, Devices, MidiEffectDeviceAdapter} from "@core/shared/devices.ts"
import {AudioUnitTracks} from "@core/shared/adapters/audio-unit/AudioUnitTracks.ts"
import {AudioUnitInput} from "@core/shared/adapters/audio-unit/AudioUnitInput.ts"
import {AudioUnitOutput} from "@core/shared/adapters/audio-unit/AudioUnitOutput.ts"
import {AudioUnitType} from "@core/data/enums.ts"
import {SortedBoxAdapterCollection} from "@core/shared/SortedBoxAdapterCollection.ts"
import {AuxSendBoxAdapter} from "@core/shared/adapters/audio-unit/AuxSendBoxAdapter.ts"
import {TrackBoxAdapter} from "@core/shared/adapters/timeline/TrackBoxAdapter.ts"
import {AudioUnitInputAdapter} from "@core/shared/adapters/audio-unit/AudioUnitInputAdapter.ts"
import {BoxAdaptersContext} from "@core/shared/BoxAdaptersContext.ts"
import {BoxAdapter} from "@core/shared/BoxAdapter.ts"

export class AudioUnitBoxAdapter implements DeviceHost, BoxAdapter {
    readonly "class" = "device-host"

    readonly #terminator: Terminator = new Terminator()
    readonly #context: BoxAdaptersContext
    readonly #box: AudioUnitBox
    readonly #parametric: ParameterAdapterSet
    readonly #tracks: AudioUnitTracks
    readonly #input: AudioUnitInput
    readonly #midiEffects: SortedBoxAdapterCollection<MidiEffectDeviceAdapter, Pointers.MidiEffectHost>
    readonly #audioEffects: SortedBoxAdapterCollection<AudioEffectDeviceBoxAdapter, Pointers.AudioEffectHost>
    readonly #auxSends: SortedBoxAdapterCollection<AuxSendBoxAdapter, Pointers.AuxSend>
    readonly #output: AudioUnitOutput
    readonly namedParameter // let typescript infer the type

    constructor(context: BoxAdaptersContext, box: AudioUnitBox) {
        this.#context = context
        this.#box = box

        this.#parametric = this.#terminator.own(new ParameterAdapterSet(this.#context))
        this.#tracks = this.#terminator.own(new AudioUnitTracks(this, this.#context.boxAdapters))
        this.#input = this.#terminator.own(new AudioUnitInput(this.#box.input.pointerHub, this.#context.boxAdapters))
        this.#midiEffects = this.#terminator.own(SortedBoxAdapterCollection.create(this.#box.midiEffects,
            box => this.#context.boxAdapters.adapterFor(box, Devices.isMidiEffect), Pointers.MidiEffectHost))
        this.#audioEffects = this.#terminator.own(SortedBoxAdapterCollection.create(this.#box.audioEffects,
            box => this.#context.boxAdapters.adapterFor(box, Devices.isAudioEffect), Pointers.AudioEffectHost))
        this.#auxSends = this.#terminator.own(SortedBoxAdapterCollection.create(this.#box.auxSends,
            box => this.#context.boxAdapters.adapterFor(box, AuxSendBoxAdapter), Pointers.AuxSend))
        this.#output = this.#terminator.own(new AudioUnitOutput(this.#box.output, this.#context.boxAdapters))
        this.namedParameter = this.#wrapParameters(box)
    }

    get box(): AudioUnitBox {return this.#box}
    get uuid(): UUID.Format {return this.#box.address.uuid}
    get address(): Address {return this.#box.address}
    get indexField(): Int32Field {return this.#box.index}
    get type(): AudioUnitType {return this.#box.type.getValue() as AudioUnitType}
    get tracks(): AudioUnitTracks {return this.#tracks}
    get input(): AudioUnitInput {return this.#input}
    get midiEffects(): SortedBoxAdapterCollection<MidiEffectDeviceAdapter, Pointers.MidiEffectHost> {return this.#midiEffects}
    get audioEffects(): SortedBoxAdapterCollection<AudioEffectDeviceBoxAdapter, Pointers.AudioEffectHost> {return this.#audioEffects}
    get inputAdapter(): Option<AudioUnitInputAdapter> {return this.#input.getValue()}
    get auxSends(): SortedBoxAdapterCollection<AuxSendBoxAdapter, Pointers.AuxSend> {return this.#auxSends}
    get output(): AudioUnitOutput {return this.#output}
    get isBus(): boolean {return this.input.getValue().mapOr(adapter => adapter.type === "bus", false)}
    get isInstrument(): boolean {return this.input.getValue().mapOr(adapter => adapter.type === "instrument", false)}
    get isOutput(): boolean {
        return this.#box.output.targetVertex.mapOr(output =>
            output.box.address.equals(this.#context.rootBoxAdapter.address), false)
    }

    get midiEffectsField(): Field<Pointers.MidiEffectHost> {return this.#box.midiEffects}
    get inputField(): Field<Pointers.InstrumentHost | Pointers.AudioOutput> {return this.#box.input}
    get audioEffectsField(): Field<Pointers.AudioEffectHost> {return this.#box.audioEffects}
    get tracksField(): Field<Pointers.TrackCollection> {return this.#box.tracks}
    get minimizedField(): BooleanField {return this.#input.getValue().unwrap().minimizedField}
    get isAudioUnit(): boolean {return true}
    get label(): string {return this.#input.getValue().mapOr(input => input.labelField.getValue(), "")}

    audioUnitBoxAdapter(): AudioUnitBoxAdapter {return this}

    indicesLimit(): [int, int] {
        const adapters = this.#context.rootBoxAdapter.audioUnits.adapters()
        const startIndex = this.indexField.getValue()
        const unitType = this.type
        let min: int = startIndex
        let max: int = startIndex
        while (min > 0) {
            if (adapters[min - 1].type === unitType) {min--} else {break}
        }
        while (max < adapters.length - 1) {
            if (adapters[max + 1].type === unitType) {max++} else {break}
        }
        return [min, max + 1]
    }

    move(delta: int): void {this.#context.rootBoxAdapter.audioUnits.move(this, delta)}
    moveTrack(adapter: TrackBoxAdapter, delta: int): void {this.#tracks.collection.move(adapter, delta)}
    deleteTrack(adapter: TrackBoxAdapter): void {this.#tracks.delete(adapter)}
    toString(): string {return `{${this.constructor.name}}`}
    terminate(): void {this.#terminator.terminate()}

    #wrapParameters(box: AudioUnitBox) {
        return {
            volume: this.#parametric.createParameter(
                box.volume,
                ValueMapping.decibel(-96.0, -9.0, +6.0),
                StringMapping.decible, "volume"),
            panning: this.#parametric.createParameter(
                box.panning,
                ValueMapping.bipolar(),
                StringMapping.panning, "panning", 0.5),
            mute: this.#parametric.createParameter(
                box.mute,
                ValueMapping.bool,
                StringMapping.bool, "mute"),
            solo: this.#parametric.createParameter(
                box.solo,
                ValueMapping.bool,
                StringMapping.bool, "solo")
        } as const
    }
}