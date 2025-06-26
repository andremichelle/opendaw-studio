import {StringMapping, UUID, ValueMapping} from "std"
import {ParameterAdapterSet} from "@core/shared/ParameterAdapterSet.ts"
import {AudioEffectDeviceBoxAdapter, DeviceHost, Devices} from "@core/shared/devices.ts"
import {Address, BooleanField, Int32Field, PointerField, StringField} from "box"
import {Pointers} from "@core/data/pointers.ts"
import {StereoToolDeviceBox} from "@core/data/boxes"
import {AudioUnitBoxAdapter} from "@core/shared/adapters/audio-unit/AudioUnitBoxAdapter.ts"
import {BoxAdaptersContext} from "@core/shared/BoxAdaptersContext.ts"

export class StereoToolDeviceBoxAdapter implements AudioEffectDeviceBoxAdapter {
    readonly type = "audio-effect"
    readonly accepts = "audio"

    readonly #context: BoxAdaptersContext
    readonly #box: StereoToolDeviceBox

    readonly #parametric: ParameterAdapterSet
    readonly namedParameter // let typescript infer the type

    constructor(context: BoxAdaptersContext, box: StereoToolDeviceBox) {
        this.#context = context
        this.#box = box
        this.#parametric = new ParameterAdapterSet(this.#context)
        this.namedParameter = this.#wrapParameters(box)
    }

    get box(): StereoToolDeviceBox {return this.#box}
    get uuid(): UUID.Format {return this.#box.address.uuid}
    get address(): Address {return this.#box.address}
    get indexField(): Int32Field {return this.#box.index}
    get labelField(): StringField {return this.#box.label}
    get enabledField(): BooleanField {return this.#box.enabled}
    get minimizedField(): BooleanField {return this.#box.minimized}
    get host(): PointerField<Pointers.AudioEffectHost> {return this.#box.host}

    deviceHost(): DeviceHost {
        return this.#context.boxAdapters
            .adapterFor(this.#box.host.targetVertex.unwrap("no device-host").box, Devices.isHost)
    }

    audioUnitBoxAdapter(): AudioUnitBoxAdapter {return this.deviceHost().audioUnitBoxAdapter()}

    terminate(): void {this.#parametric.terminate()}

    #wrapParameters(box: StereoToolDeviceBox) {
        return {
            volume: this.#parametric.createParameter(
                box.volume,
                ValueMapping.decibel(-72.0, 0.0, 12.0),
                StringMapping.numeric({unit: "db", fractionDigits: 1}), "Volume"),
            panning: this.#parametric.createParameter(
                box.panning, ValueMapping.bipolar(), StringMapping.panning, "Panning", 0.5),
            stereo: this.#parametric.createParameter(
                box.stereo,
                ValueMapping.bipolar(),
                StringMapping.numeric({unit: "%", fractionDigits: 0}), "stereo", 0.5),
            invertL: this.#parametric.createParameter(box.invertL, ValueMapping.bool, StringMapping.bool, "Invert Left"),
            invertR: this.#parametric.createParameter(box.invertR, ValueMapping.bool, StringMapping.bool, "Invert Right"),
            swap: this.#parametric.createParameter(box.swap, ValueMapping.bool, StringMapping.bool, "Swap")
        } as const
    }
}