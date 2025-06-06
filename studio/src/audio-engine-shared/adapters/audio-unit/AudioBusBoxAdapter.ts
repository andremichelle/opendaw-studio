import {Address, BooleanField, Propagation, StringField} from "box"
import {Observer, Subscription, UUID} from "std"
import {AudioBusBox} from "@/data/boxes"
import {AudioUnitBoxAdapter} from "@/audio-engine-shared/adapters/audio-unit/AudioUnitBoxAdapter.ts"
import {IconSymbol, nameToEnum} from "@/IconSymbol.ts"
import {DeviceBoxAdapter, DeviceHost, Devices} from "@/audio-engine-shared/adapters/devices.ts"
import {BoxAdaptersContext} from "@/audio-engine-shared/BoxAdaptersContext"

export class AudioBusBoxAdapter implements DeviceBoxAdapter {
    readonly type = "bus"
    readonly accepts = "audio"

    readonly #context: BoxAdaptersContext
    readonly #box: AudioBusBox

    constructor(context: BoxAdaptersContext, box: AudioBusBox) {
        this.#context = context
        this.#box = box
    }

    catchupAndSubscribe(observer: Observer<this>): Subscription {
        observer(this)
        return this.#box.subscribe(Propagation.Children, () => observer(this))
    }

    get uuid(): UUID.Format {return this.#box.address.uuid}
    get address(): Address {return this.#box.address}
    get box(): AudioBusBox {return this.#box}
    get enabledField(): BooleanField {return this.#box.enabled}
    get minimizedField(): BooleanField {return this.#box.minimized}
    get iconField(): StringField {return this.#box.icon}
    get labelField(): StringField {return this.#box.label}
    get colorField(): StringField {return this.#box.color}
    get iconSymbol(): IconSymbol {return nameToEnum(this.#box.icon.getValue())}

    deviceHost(): DeviceHost {
        return this.#context.boxAdapters
            .adapterFor(this.#box.output.targetVertex.unwrap("No AudioUnitBox found").box, Devices.isHost)
    }

    audioUnitBoxAdapter(): AudioUnitBoxAdapter {return this.deviceHost().audioUnitBoxAdapter()}

    terminate(): void {}

    toString(): string {return `{${this.constructor.name}}`}
}