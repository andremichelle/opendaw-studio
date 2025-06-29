import {ModuleConnectionBox} from "studio-boxes"
import {Address, Vertex} from "opendaw-box"
import {BoxAdapter} from "../../BoxAdapter"
import {BoxAdaptersContext} from "../../BoxAdaptersContext"

export class ModuleConnectionAdapter implements BoxAdapter {
    readonly #context: BoxAdaptersContext
    readonly #box: ModuleConnectionBox

    constructor(context: BoxAdaptersContext, box: ModuleConnectionBox) {
        this.#context = context
        this.#box = box
    }

    get box(): ModuleConnectionBox {return this.#box}
    get uuid(): Readonly<Uint8Array> {return this.#box.address.uuid}
    get address(): Address {return this.#box.address}
    get source(): Vertex {return this.#box.source.targetVertex.unwrap("Insufficient Vertex")}
    get target(): Vertex {return this.#box.target.targetVertex.unwrap("Insufficient Vertex")}

    terminate(): void {}
}