import {NanoDeviceBox} from "@core/data/boxes"
import {StringMapping, UUID, ValueMapping} from "std"
import {DeviceHost, Devices, InstrumentDeviceBoxAdapter} from "@/audio-engine-shared/adapters/devices.ts"
import {Address, BooleanField, FieldKeys, StringField} from "box"
import {ParameterAdapterSet} from "@/audio-engine-shared/adapters/ParameterAdapterSet.ts"
import {TrackType} from "@/audio-engine-shared/adapters/timeline/TrackType.ts"
import {AutomatableParameterFieldAdapter} from "@/audio-engine-shared/adapters/AutomatableParameterFieldAdapter.ts"
import {AudioUnitBoxAdapter} from "@/audio-engine-shared/adapters/audio-unit/AudioUnitBoxAdapter"
import {BoxAdaptersContext} from "@/audio-engine-shared/BoxAdaptersContext"

export class NanoDeviceBoxAdapter implements InstrumentDeviceBoxAdapter {
    readonly type = "instrument"
    readonly accepts = "midi"

    readonly #context: BoxAdaptersContext
    readonly #box: NanoDeviceBox

    readonly #parametric: ParameterAdapterSet
    readonly namedParameter // let typescript infer the type

    constructor(context: BoxAdaptersContext, box: NanoDeviceBox) {
        this.#context = context
        this.#box = box
        this.#parametric = new ParameterAdapterSet(this.#context)
        this.namedParameter = this.#wrapParameters(box)
    }

    get box(): NanoDeviceBox {return this.#box}
    get uuid(): UUID.Format {return this.#box.address.uuid}
    get address(): Address {return this.#box.address}
    get labelField(): StringField {return this.#box.label}
    get iconField(): StringField {return this.#box.icon}
    get defaultTrackType(): TrackType {return TrackType.Notes}
    get enabledField(): BooleanField {return this.#box.enabled}
    get minimizedField(): BooleanField {return this.#box.minimized}
    get acceptsMidiEvents(): boolean {return true}

    deviceHost(): DeviceHost {
        return this.#context.boxAdapters
            .adapterFor(this.#box.host.targetVertex.unwrap("no device-host").box, Devices.isHost)
    }

    audioUnitBoxAdapter(): AudioUnitBoxAdapter {return this.deviceHost().audioUnitBoxAdapter()}

    parameterAt(fieldIndices: FieldKeys): AutomatableParameterFieldAdapter {return this.#parametric.parameterAt(fieldIndices)}

    terminate(): void {this.#parametric.terminate()}

    #wrapParameters(box: NanoDeviceBox) {
        return {
            volume: this.#parametric.createParameter(
                box.volume,
                ValueMapping.DefaultDecibel,
                StringMapping.numeric({unit: "db", fractionDigits: 1}), "volume"),
            release: this.#parametric.createParameter(
                box.release,
                ValueMapping.exponential(0.001, 8.0),
                StringMapping.numeric({unit: "s", fractionDigits: 3}), "release")
        } as const
    }
}