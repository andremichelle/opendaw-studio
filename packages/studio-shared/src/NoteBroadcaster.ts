import {LiveStreamBroadcaster} from "lib-fusion"
import {Address} from "lib-box"
import {Bits, EmptyExec, int, Terminable, Terminator} from "lib-std"

export class NoteBroadcaster implements Terminable {
    readonly #terminator = new Terminator()
    readonly #broadcaster: LiveStreamBroadcaster
    readonly #address: Address

    readonly #bits: Bits

    constructor(broadcaster: LiveStreamBroadcaster, address: Address) {
        this.#broadcaster = broadcaster
        this.#address = address

        this.#bits = new Bits(128)
        this.#terminator.own(
            this.#broadcaster.broadcastIntegers(this.#address, new Int32Array(this.#bits.buffer), EmptyExec)
        )
    }

    noteOn(note: int): void {if (note >= 0 && note < 128) {this.#bits.setBit(note, true)}}
    noteOff(note: int): void {if (note >= 0 && note < 128) {this.#bits.setBit(note, false)}}

    reset(): void {}
    clear(): void {this.#bits.clear()}
    terminate(): void {this.#terminator.terminate()}

    toString(): string {return `{${this.constructor.name}}`}
}