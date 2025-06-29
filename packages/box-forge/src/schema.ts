import {float, Func, int, Objects} from "opendaw-std"
import {FieldKey, PointerRules, PointerTypes} from "opendaw-box"

export interface PrimitiveTypes {
    int32: int,
    float32: float
    boolean: boolean
    string: string
    bytes: Int8Array
}

export const reserved = Object.freeze({type: "reserved", name: ""} as const)

type ReservedType = typeof reserved

export const reserveMany = <Keys extends int[]>(..._keys: Keys): Record<Keys[int], ReservedType> =>
    ({} as Record<Keys[int], ReservedType>)

export type FieldName = {
    name: string
}
export type Referencable<E extends PointerTypes> = {
    pointerRules?: PointerRules<E>
}
export type Schema<E extends PointerTypes> = {
    path: string // the path to the folder to output the TypeScript files
    pointers: {
        from: string // the path to the pointer-type enum
        enum: string // the name of the exported pointer-type enum
        print: Func<E, string> // a function that turns the enum value into source code (Ptr.A > "Ptr.A")
    }
    boxes: ReadonlyArray<BoxSchema<E>>
}
export type FieldRecord<E extends PointerTypes> = Record<FieldKey, AnyField<E> & FieldName>
export type ClassSchema<E extends PointerTypes> = {
    name: string
    fields: FieldRecord<E>
}
export type BoxSchema<E extends PointerTypes> = Referencable<E> & {
    type: "box"
    class: ClassSchema<E>
}
export type ObjectSchema<E extends PointerTypes> = {
    type: "object"
    class: ClassSchema<E>
}
export type ArrayFieldSchema<E extends PointerTypes> = {
    type: "array",
    element: AnyField<E>
    length: int
}
export type PointerFieldSchema<E extends PointerTypes> = {
    type: "pointer"
    pointerType: E
    mandatory: boolean
}

export type PrimitiveFieldSchema<E extends PointerTypes> = Referencable<E> & {
    [K in keyof PrimitiveTypes]: { type: K, value?: PrimitiveTypes[K] }
}[keyof PrimitiveTypes]

export type FieldSchema<E extends PointerTypes> = Required<Referencable<E>> & {
    type: "field"
}
export type AnyField<E extends PointerTypes> =
    | FieldSchema<E>
    | PointerFieldSchema<E>
    | PrimitiveFieldSchema<E>
    | ArrayFieldSchema<E>
    | ObjectSchema<E>
    | typeof reserved

// utility methods to build schema
//
export const mergeFields = <
    E extends PointerTypes,
    U extends FieldRecord<E>,
    V extends FieldRecord<E>>(u: U, v: Objects.Disjoint<U, V>): U & V => Objects.mergeNoOverlap(u, v)