import {Exec, Procedure} from "lib-std"

export interface Result<T> {
    success: Procedure<T>
    failure?: Exec
}

export interface Validator<T> {
    validate: (value: T, match: Result<T>, origin?: Element) => void
}