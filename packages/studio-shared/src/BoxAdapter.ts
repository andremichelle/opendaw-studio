import {Addressable, Box} from "opendaw-box"
import {Terminable, UUID} from "opendaw-std"

export interface BoxAdapter extends Addressable, Terminable {
    get box(): Box
    get uuid(): UUID.Format
}