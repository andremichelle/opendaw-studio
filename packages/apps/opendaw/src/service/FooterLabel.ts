import {Terminable} from "lib-std"

export interface FooterLabel extends Terminable {
    setTitle(value: string): void
    setValue(value: string): void
}