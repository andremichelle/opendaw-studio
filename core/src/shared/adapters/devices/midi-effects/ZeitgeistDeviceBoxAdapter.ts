import {DeviceHost, Devices, MidiEffectDeviceAdapter} from "@core/shared/devices.ts"
import {Pointers} from "@core/data/pointers.ts"
import {Observer, Subscription, UUID} from "std"
import {Address, BooleanField, Int32Field, PointerField, StringField} from "box"
import {ZeitgeistDeviceBox} from "@core/data/boxes"
import {AudioUnitBoxAdapter} from "@core/shared/adapters/audio-unit/AudioUnitBoxAdapter.ts"
import {BoxAdaptersContext} from "@core/shared/BoxAdaptersContext.ts"
import {GrooveAdapter} from "@core/shared/adapters/grooves/GrooveBoxAdapter.ts"

export class ZeitgeistDeviceBoxAdapter implements MidiEffectDeviceAdapter {
    readonly type = "midi-effect"
    readonly accepts = "midi"

    readonly #context: BoxAdaptersContext
    readonly #box: ZeitgeistDeviceBox

    constructor(context: BoxAdaptersContext, box: ZeitgeistDeviceBox) {
        this.#context = context
        this.#box = box

        this.groove() // force creation of GrooveAdapter
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