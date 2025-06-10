import { DeviceHost, Devices, MidiEffectDeviceAdapter } from "@/audio-engine-shared/adapters/devices"
import { ParameterAdapterSet } from "@/audio-engine-shared/adapters/ParameterAdapterSet"
import { EuclidDeviceBox } from "@/data/boxes"
import { Pointers } from "@/data/pointers"
import { Address, BooleanField, FieldKeys, Int32Field, PointerField, StringField } from "box"
import { StringMapping, UUID, ValueMapping } from "std"
import { AutomatableParameterFieldAdapter } from "@/audio-engine-shared/adapters/AutomatableParameterFieldAdapter"
import { AudioUnitBoxAdapter } from "@/audio-engine-shared/adapters/audio-unit/AudioUnitBoxAdapter"
import { BoxAdaptersContext } from "@/audio-engine-shared/BoxAdaptersContext"

export class EuclidDeviceBoxAdapter implements MidiEffectDeviceAdapter {
    readonly type = "midi-effect"
    readonly accepts = "midi"

    readonly #context: BoxAdaptersContext
    readonly #box: EuclidDeviceBox
    readonly #parametric: ParameterAdapterSet
    readonly namedParameter

    constructor(context: BoxAdaptersContext, box: EuclidDeviceBox) {
        this.#context = context
        this.#box = box
        this.#parametric = new ParameterAdapterSet(this.#context)
        this.namedParameter = this.#wrapParameters(box)
    }

    get box(): EuclidDeviceBox { return this.#box }
    get uuid(): UUID.Format { return this.#box.address.uuid }
    get address(): Address { return this.#box.address }
    get indexField(): Int32Field { return this.#box.index }
    get labelField(): StringField { return this.#box.label }
    get enabledField(): BooleanField { return this.#box.enabled }
    get minimizedField(): BooleanField { return this.#box.minimized }
    get host(): PointerField<Pointers.MidiEffectHost> { return this.#box.host }

    deviceHost(): DeviceHost {
        return this.#context.boxAdapters.adapterFor(
            this.#box.host.targetVertex.unwrap("no device-host").box,
            Devices.isHost
        )
    }

    audioUnitBoxAdapter(): AudioUnitBoxAdapter { return this.deviceHost().audioUnitBoxAdapter() }

    parameterAt(fieldIndices: FieldKeys): AutomatableParameterFieldAdapter {
        return this.#parametric.parameterAt(fieldIndices)
    }

    terminate(): void { this.#parametric.terminate() }

    #wrapParameters(box: EuclidDeviceBox) {
        return {
            steps: this.#parametric.createParameter(
                box.steps,
                ValueMapping.linearInteger(2, 32),
                StringMapping.numeric({ fractionDigits: 0 }), "steps"
            ),
            notes: this.#parametric.createParameter(
                box.notes,
                ValueMapping.linearInteger(1, 32),
                StringMapping.numeric({ fractionDigits: 0 }), "notes"
            ),
              rotation: this.#parametric.createParameter(
                box.rotation,
                ValueMapping.linearInteger(0, 32),
                StringMapping.numeric({ fractionDigits: 0 }), "rotation"
            ),
            gate: this.#parametric.createParameter(
                box.gate,
                ValueMapping.linear(0.0, 2.0),
                StringMapping.percent({ fractionDigits: 0 }), "gate"
            ),
            velocity: this.#parametric.createParameter(
                box.velocity,
                ValueMapping.bipolar(),
                StringMapping.percent({ fractionDigits: 0, bipolar: false }), "velocity"
            ),
            division: this.#parametric.createParameter(
                box.division,
                ValueMapping.linearInteger(1, 10),
                StringMapping.indices("", ["1/4", "1/4", "1/8", "1/4t", "1/16", "1/8t", "1/32", "1/16t", "1/64", "1/32t"]), "division"),
        } as const
    }
}