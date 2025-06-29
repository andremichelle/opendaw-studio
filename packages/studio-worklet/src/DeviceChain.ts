import {Terminable} from "lib-std"

export interface DeviceChain extends Terminable {
    invalidateWiring(): void
}