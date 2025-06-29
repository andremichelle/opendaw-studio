import {TapeDeviceBox} from "studio-boxes"
import {StringMapping, UUID, ValueMapping} from "opendaw-std"
import {Address, BooleanField, FieldKeys, StringField} from "opendaw-box"
import {DeviceHost, Devices, InstrumentDeviceBoxAdapter} from "../../../devices"
import {BoxAdaptersContext} from "../../../BoxAdaptersContext"
import {ParameterAdapterSet} from "../../../ParameterAdapterSet"
import { TrackType } from "src/adapters/timeline/TrackType"
import {AudioUnitBoxAdapter} from "../../audio-unit/AudioUnitBoxAdapter"
import {AutomatableParameterFieldAdapter} from "../../../AutomatableParameterFieldAdapter"

export class TapeDeviceBoxAdapter implements InstrumentDeviceBoxAdapter {
    readonly type = "instrument"
    readonly accepts = "audio"

    readonly #context: BoxAdaptersContext
    readonly #box: TapeDeviceBox

    readonly #parametric: ParameterAdapterSet
    readonly namedParameter // let typescript infer the type

    constructor(context: BoxAdaptersContext, box: TapeDeviceBox) {
        this.#context = context
        this.#box = box
        this.#parametric = new ParameterAdapterSet(this.#context)
        this.namedParameter = this.#wrapParameters(box)
    }

    get box(): TapeDeviceBox {return this.#box}
    get uuid(): UUID.Format {return this.#box.address.uuid}
    get address(): Address {return this.#box.address}
    get labelField(): StringField {return this.#box.label}
    get iconField(): StringField {return this.#box.icon}
    get defaultTrackType(): TrackType {return TrackType.Audio}
    get enabledField(): BooleanField {return this.#box.enabled}
    get minimizedField(): BooleanField {return this.#box.minimized}
    get acceptsMidiEvents(): boolean {return false}

    deviceHost(): DeviceHost {
        return this.#context.boxAdapters
            .adapterFor(this.#box.host.targetVertex.unwrap("no device-host").box, Devices.isHost)
    }

    audioUnitBoxAdapter(): AudioUnitBoxAdapter {return this.deviceHost().audioUnitBoxAdapter()}

    parameterAt(fieldIndices: FieldKeys): AutomatableParameterFieldAdapter {return this.#parametric.parameterAt(fieldIndices)}

    terminate(): void {this.#parametric.terminate()}

    #wrapParameters(box: TapeDeviceBox) {
        return {
            flutter: this.#parametric.createParameter(
                box.flutter,
                ValueMapping.unipolar(),
                StringMapping.percent(), "flutter"),
            wow: this.#parametric.createParameter(
                box.wow,
                ValueMapping.unipolar(),
                StringMapping.percent(), "wow"),
            noise: this.#parametric.createParameter(
                box.noise,
                ValueMapping.unipolar(),
                StringMapping.percent(), "noise"),
            saturation: this.#parametric.createParameter(
                box.saturation,
                ValueMapping.unipolar(),
                StringMapping.percent(), "saturation")
        } as const
    }
}