import {DelayDeviceBox} from "@core/data/boxes"
import {StringMapping, UUID, ValueMapping} from "std"
import {ParameterAdapterSet} from "@core/shared/ParameterAdapterSet.ts"
import {AudioEffectDeviceBoxAdapter, DeviceHost, Devices} from "@core/shared/devices.ts"
import {Address, BooleanField, Int32Field, PointerField, StringField} from "box"
import {Pointers} from "@core/data/pointers.ts"
import {Fraction} from "dsp"
import {AudioUnitBoxAdapter} from "@core/shared/adapters/audio-unit/AudioUnitBoxAdapter.ts"
import {BoxAdaptersContext} from "@core/shared/BoxAdaptersContext.ts"

export class DelayDeviceBoxAdapter implements AudioEffectDeviceBoxAdapter {
    static OffsetFractions = Fraction.builder()
        .add([1, 1]).add([1, 2]).add([1, 3]).add([1, 4])
        .add([3, 16]).add([1, 6]).add([1, 8]).add([3, 32])
        .add([1, 12]).add([1, 16]).add([3, 64]).add([1, 24])
        .add([1, 32]).add([1, 48]).add([1, 64])
        .add([1, 96]).add([1, 128])
        .asDescendingArray()

    static OffsetStringMapping = StringMapping.indices("", this.OffsetFractions.map(([n, d]) => `${n}/${d}`))

    readonly type = "audio-effect"
    readonly accepts = "audio"

    readonly #context: BoxAdaptersContext
    readonly #box: DelayDeviceBox

    readonly #parametric: ParameterAdapterSet
    readonly namedParameter // let typescript infer the type

    constructor(context: BoxAdaptersContext, box: DelayDeviceBox) {
        this.#context = context
        this.#box = box
        this.#parametric = new ParameterAdapterSet(this.#context)
        this.namedParameter = this.#wrapParameters(box)
    }

    get box(): DelayDeviceBox {return this.#box}
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

    #wrapParameters(box: DelayDeviceBox) {
        return {
            delay: this.#parametric.createParameter(
                box.delay,
                ValueMapping.linearInteger(0, DelayDeviceBoxAdapter.OffsetFractions.length - 1),
                DelayDeviceBoxAdapter.OffsetStringMapping, "delay"),
            feedback: this.#parametric.createParameter(
                box.feedback,
                ValueMapping.unipolar(),
                StringMapping.numeric({unit: "%", fractionDigits: 0}), "feedback"),
            cross: this.#parametric.createParameter(
                box.cross,
                ValueMapping.unipolar(),
                StringMapping.numeric({unit: "%", fractionDigits: 0}), "cross"),
            filter: this.#parametric.createParameter(
                box.filter,
                ValueMapping.bipolar(),
                StringMapping.numeric({unit: "%", fractionDigits: 0}), "filter", 0.5),
            dry: this.#parametric.createParameter(
                box.dry,
                ValueMapping.DefaultDecibel,
                StringMapping.numeric({unit: "db", fractionDigits: 1}), "dry"),
            wet: this.#parametric.createParameter(
                box.wet,
                ValueMapping.DefaultDecibel,
                StringMapping.numeric({unit: "db", fractionDigits: 1}), "wet")
        } as const
    }
}