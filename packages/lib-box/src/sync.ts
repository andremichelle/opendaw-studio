import {Nullish, UUID} from "lib-std"
import {AddressLayout} from "./address"

export type UpdateTask<M> =
    | { type: "new", name: keyof M, uuid: UUID.Format, buffer: ArrayBufferLike }
    | { type: "update-primitive", address: AddressLayout, value: unknown }
    | { type: "update-pointer", address: AddressLayout, target: Nullish<AddressLayout> }
    | { type: "delete", uuid: UUID.Format }

export interface Synchronization<M> {
    sendUpdates(updates: ReadonlyArray<UpdateTask<M>>): void
    checksum(value: Int8Array): Promise<void>
}