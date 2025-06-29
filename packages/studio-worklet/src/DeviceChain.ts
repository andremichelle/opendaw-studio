import {Terminable} from "opendaw-std"

export interface DeviceChain extends Terminable {
    invalidateWiring(): void
}