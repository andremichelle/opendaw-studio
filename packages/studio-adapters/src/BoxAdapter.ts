import {Addressable, Box} from "lib-box"
import {Terminable, UUID} from "lib-std"

export interface BoxAdapter extends Addressable, Terminable {
    get box(): Box
    get uuid(): UUID.Format
}