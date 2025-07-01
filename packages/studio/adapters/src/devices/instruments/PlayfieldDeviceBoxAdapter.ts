import {PlayfieldDeviceBox} from "studio-boxes"
import {Address, BooleanField, FieldKeys, StringField} from "lib-box"
import {Pointers} from "studio-enums"
import {UUID} from "lib-std"
import {DeviceHost, Devices, InstrumentDeviceBoxAdapter} from "../../devices"
import {BoxAdaptersContext} from "../../BoxAdaptersContext"
import {SortedBoxAdapterCollection} from "../../SortedBoxAdapterCollection"
import {PlayfieldSampleBoxAdapter} from "./Playfield/PlayfieldSampleBoxAdapter"
import {ParameterAdapterSet} from "../../ParameterAdapterSet"
import {TrackType} from "../../timeline/TrackType"
import {AudioUnitBoxAdapter} from "../../audio-unit/AudioUnitBoxAdapter"
import {AutomatableParameterFieldAdapter} from "../../AutomatableParameterFieldAdapter"

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