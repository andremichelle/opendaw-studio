import {Addressable, Box} from "box"
import {Terminable, UUID} from "std"

export interface BoxAdapter extends Addressable, Terminable {
    get box(): Box
    get uuid(): UUID.Format
}