import {DeviceHost, Devices, MidiEffectDeviceAdapter} from "@/audio-engine-shared/adapters/devices.ts"
import {Pointers} from "@/data/pointers.ts"
import {Observer, Subscription, UUID} from "std"
import {Address, BooleanField, Int32Field, PointerField, StringField} from "box"
import {ZeitgeistDeviceBox} from "@/data/boxes"
import {AudioUnitBoxAdapter} from "@/audio-engine-shared/adapters/audio-unit/AudioUnitBoxAdapter"
import {BoxAdaptersContext} from "@/audio-engine-shared/BoxAdaptersContext"
import {GrooveAdapter} from "@/audio-engine-shared/adapters/grooves/GrooveBoxAdapter"

export class ZeitgeistDeviceBoxAdapter implements MidiEffectDeviceAdapter {
    readonly type = "midi-effect"
    readonly accepts = "midi"

    readonly #context: BoxAdaptersContext
    readonly #box: ZeitgeistDeviceBox

    constructor(context: BoxAdaptersContext, box: ZeitgeistDeviceBox) {
        this.#context = context
        this.#box = box
    }

    get box(): ZeitgeistDeviceBox {return this.#box}
    get uuid(): UUID.Format {return this.#box.address.uuid}
    get address(): Address {return this.#box.address}
    get indexField(): Int32Field {return this.#box.index}
    get labelField(): StringField {return this.#box.label}
    get enabledField(): BooleanField {return this.#box.enabled}
    get minimizedField(): BooleanField {return this.#box.minimized}
    get host(): PointerField<Pointers.MidiEffectHost> {return this.#box.host}

    deviceHost(): DeviceHost {
        return this.#context.boxAdapters
            .adapterFor(this.#box.host.targetVertex.unwrap("no device-host").box, Devices.isHost)
    }

    groove(): GrooveAdapter {
        return this.#context.boxAdapters
            .adapterFor(this.#box.groove.targetVertex.unwrap("no groove").box, GrooveAdapter.checkType)
    }

    catchupAndSubscribeGroove(observer: Observer<GrooveAdapter>): Subscription {
        return this.#box.groove.catchupAndSubscribe(pointer => observer(this.#context.boxAdapters
            .adapterFor(pointer.targetVertex.unwrap("No groove found").box, GrooveAdapter.checkType)))
    }

    audioUnitBoxAdapter(): AudioUnitBoxAdapter {return this.deviceHost().audioUnitBoxAdapter()}

    terminate(): void {}
}