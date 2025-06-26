import {PlayfieldDeviceBox} from "@core/data/boxes"
import {DeviceHost, Devices, InstrumentDeviceBoxAdapter} from "@/audio-engine-shared/adapters/devices.ts"
import {Address, BooleanField, FieldKeys, StringField} from "box"
import {ParameterAdapterSet} from "@/audio-engine-shared/adapters/ParameterAdapterSet.ts"
import {TrackType} from "@/audio-engine-shared/adapters/timeline/TrackType.ts"
import {AutomatableParameterFieldAdapter} from "@/audio-engine-shared/adapters/AutomatableParameterFieldAdapter.ts"
import {SortedBoxAdapterCollection} from "@/audio-engine-shared/adapters/SortedBoxAdapterCollection"
import {Pointers} from "@core/data/pointers"
import {UUID} from "std"
import {
    PlayfieldSampleBoxAdapter
} from "@/audio-engine-shared/adapters/devices/instruments/Playfield/PlayfieldSampleBoxAdapter"
import {AudioUnitBoxAdapter} from "@/audio-engine-shared/adapters/audio-unit/AudioUnitBoxAdapter"
import {BoxAdaptersContext} from "@/audio-engine-shared/BoxAdaptersContext"

export class PlayfieldDeviceBoxAdapter implements InstrumentDeviceBoxAdapter {
    readonly type = "instrument"
    readonly accepts = "midi"

    readonly #context: BoxAdaptersContext
    readonly #box: PlayfieldDeviceBox

    readonly #samples: SortedBoxAdapterCollection<PlayfieldSampleBoxAdapter, Pointers.Sample>
    readonly #parametric: ParameterAdapterSet

    constructor(context: BoxAdaptersContext, box: PlayfieldDeviceBox) {
        this.#context = context
        this.#box = box

        this.#samples = SortedBoxAdapterCollection.create(
            box.samples, box => context.boxAdapters.adapterFor(box, PlayfieldSampleBoxAdapter), Pointers.Sample)
        this.#parametric = new ParameterAdapterSet(this.#context)
    }

    reset(): void {this.#samples.adapters().forEach(adapter => adapter.box.delete())}

    get box(): PlayfieldDeviceBox {return this.#box}
    get uuid(): UUID.Format {return this.#box.address.uuid}
    get address(): Address {return this.#box.address}
    get notesAddress(): Address {return this.#box.address.append(1000)}
    get labelField(): StringField {return this.#box.label}
    get iconField(): StringField {return this.#box.icon}
    get defaultTrackType(): TrackType {return TrackType.Notes}
    get enabledField(): BooleanField {return this.#box.enabled}
    get minimizedField(): BooleanField {return this.#box.minimized}
    get acceptsMidiEvents(): boolean {return true}
    get samples(): SortedBoxAdapterCollection<PlayfieldSampleBoxAdapter, Pointers.Sample> {return this.#samples}
    get context(): BoxAdaptersContext {return this.#context}

    deviceHost(): DeviceHost {
        return this.#context.boxAdapters
            .adapterFor(this.#box.host.targetVertex.unwrap("no device-host").box, Devices.isHost)
    }

    audioUnitBoxAdapter(): AudioUnitBoxAdapter {return this.deviceHost().audioUnitBoxAdapter()}

    parameterAt(fieldIndices: FieldKeys): AutomatableParameterFieldAdapter {return this.#parametric.parameterAt(fieldIndices)}

    terminate(): void {this.#parametric.terminate()}
}