import {Terminable} from "std"

export interface DeviceChain extends Terminable {
    invalidateWiring(): void
}