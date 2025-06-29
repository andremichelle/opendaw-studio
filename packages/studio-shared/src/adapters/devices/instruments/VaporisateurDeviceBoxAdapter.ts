import {StringMapping, UUID, ValueMapping} from "lib-std"
import {VaporisateurDeviceBox} from "studio-boxes"
import {Address, BooleanField, FieldKeys, StringField} from "lib-box"
import {DeviceHost, Devices, InstrumentDeviceBoxAdapter} from "../../../devices"
import {BoxAdaptersContext} from "../../../BoxAdaptersContext"
import {ParameterAdapterSet} from "../../../ParameterAdapterSet"
import {TrackType} from "../../timeline/TrackType"
import {AutomatableParameterFieldAdapter} from "../../../AutomatableParameterFieldAdapter"
import {AudioUnitBoxAdapter} from "../../audio-unit/AudioUnitBoxAdapter"

export class VaporisateurDeviceBoxAdapter implements InstrumentDeviceBoxAdapter {
    readonly type = "instrument"
    readonly accepts = "midi"

    readonly #context: BoxAdaptersContext
    readonly #box: VaporisateurDeviceBox

    readonly #parametric: ParameterAdapterSet
    readonly namedParameter // let typescript infer the type

    constructor(context: BoxAdaptersContext, box: VaporisateurDeviceBox) {
        this.#context = context
        this.#box = box
        this.#parametric = new ParameterAdapterSet(this.#context)
        this.namedParameter = this.#wrapParameters(box)
    }

    get box(): VaporisateurDeviceBox {return this.#box}
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

    #wrapParameters(box: VaporisateurDeviceBox) {
        return {
            volume: this.#parametric.createParameter(
                box.volume,
                ValueMapping.DefaultDecibel,
                StringMapping.numeric({unit: "db", fractionDigits: 1}), "volume"),
            octave: this.#parametric.createParameter(
                box.octave,
                ValueMapping.linearInteger(-3, 3),
                StringMapping.numeric(), "octave", 0.5),
            tune: this.#parametric.createParameter(
                box.tune,
                ValueMapping.linear(-1200.0, +1200.0),
                StringMapping.numeric({unit: "cent", fractionDigits: 0}), "tune", 0.5),
            waveform: this.#parametric.createParameter(
                box.waveform,
                ValueMapping.linearInteger(0, 3),
                StringMapping.indices("", ["sine", "triangle", "sawtooth", "square"]), "waveform"),
            cutoff: this.#parametric.createParameter(
                box.cutoff,
                ValueMapping.exponential(20.0, 18_000.0),
                StringMapping.numeric({unit: "Hz"}), "cutoff"),
            resonance: this.#parametric.createParameter(
                box.resonance,
                ValueMapping.exponential(0.1, 20.0),
                StringMapping.numeric({unit: "q", fractionDigits: 1}), "resonance"),
            attack: this.#parametric.createParameter(
                box.attack,
                ValueMapping.exponential(0.001, 1.0),
                StringMapping.numeric({unit: "s", fractionDigits: 3}), "attack"),
            release: this.#parametric.createParameter(
                box.release,
                ValueMapping.exponential(0.001, 1.0),
                StringMapping.numeric({unit: "s", fractionDigits: 3}), "release"),
            filterEnvelope: this.#parametric.createParameter(
                box.filterEnvelope,
                ValueMapping.linear(-0.1, 0.1),
                StringMapping.percent(), "filter env", 0.5)
        } as const
    }
}