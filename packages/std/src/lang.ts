// Warning, those number types do not truncate decimal places and handle overflows.
export type byte = number
export type short = number
export type int = number
export type float = number
export type double = number
export type long = bigint
export type unitValue = number // 0...1
export type NumberArray =
    ReadonlyArray<number>
    | Float32Array
    | Float64Array
    | Uint8Array
    | Int8Array
    | Uint16Array
    | Int16Array
    | Uint32Array
    | Int32Array
export type FloatArray = Float32Array | Float64Array | number[]
export type Primitive = boolean | byte | short | int | long | float | double | string | Readonly<Int8Array>
export type StructuredCloneable =
    | string
    | number
    | boolean
    | null
    | undefined
    | StructuredCloneable[]
    | { [key: string]: StructuredCloneable }
    | ArrayBuffer
    | DataView
    | Date
    | Map<StructuredCloneable, StructuredCloneable>
    | Set<StructuredCloneable>
    | RegExp
export type JSONValue = string | number | boolean | null | JSONArray | JSONObject
export type JSONArray = Array<JSONValue>
export type JSONObject = { [key: string]: JSONValue }
export type Id<T extends unknown> = T & { id: int }
export type Sign = -1 | 0 | 1
export type Nullish<T> = T | undefined | null
export type Class<T = object> = Function & { prototype: T }
export type Exec = () => void
export type Provider<T> = () => T
export type ValueOrProvider<T> = T | Provider<T>
export type Procedure<T> = (value: T) => void
export type Predicate<T> = (value: T) => boolean
export type Func<U, T> = (value: U) => T
export type Comparator<T> = (a: T, b: T) => number
export type Comparable<T> = { compareTo: (other: T) => number }
export type Equality<T> = { equals: (other: T) => boolean }
export type Nullable<T> = T | null
export type AnyFunc = (...args: any[]) => any
export type Stringifiable = { toString(): string }
export type Mutable<T> = { -readonly [P in keyof T]: T[P] }
export type AssertType<T> = (value: unknown) => value is T
export const identity = <T>(value: T): T => value
export const isDefined = <T>(value: Nullish<T>): value is T => value !== undefined && value !== null
export const ifDefined = <T>(value: Nullish<T>, procedure: Procedure<T>): void => {if (value !== undefined && value !== null) {procedure(value)}}
export const asDefined = <T>(value: Nullish<T>, fail: string = "asDefined failed"): T => value === null || value === undefined ? panic(fail) : value
export const isInstanceOf = <T>(obj: unknown, clazz: Class<T>): obj is T => obj instanceof clazz
export const asInstanceOf = <T>(obj: unknown, clazz: Class<T>): T => obj instanceof clazz ? obj as T : panic(`${obj} is not instance of ${clazz}`)
export const assertInstanceOf = <T>(obj: unknown, clazz: Class<T>): asserts obj is T => {if (!(obj instanceof clazz)) {panic(`${obj} is not instance of ${clazz}`)}}
export const tryProvide = <T>(provider: Provider<T>): T => {try {return provider()} catch (reason) {return panic(String(reason))}}
export const getOrProvide = <T>(value: ValueOrProvider<T>): T => value instanceof Function ? value() : value
export const safeWrite = (object: any, property: string, value: any): void => property in object ? object[property] = value : undefined
export const safeExecute = <F extends AnyFunc>(func: Nullish<F>, ...args: Parameters<F>): Nullish<ReturnType<F>> => func?.apply(null, args)
export const Unhandled = <R>(empty: never): R => {throw new Error(`Unhandled ${empty}`)}
export const panic = (issue?: string | Error): never => {throw issue instanceof Error ? issue : new Error(issue)}
export const assert = (condition: boolean, fail: ValueOrProvider<string>): void => condition ? undefined : panic(getOrProvide(fail))
export const checkIndex = (index: int, array: { length: int }): int =>
    index >= 0 && index < array.length ? index : panic(`Index ${index} is out of bounds`)
export const InaccessibleProperty = <T>(failMessage: string): T => new Proxy({}, {get() { return panic(failMessage) }}) as T
export const canWrite = <T>(obj: T, key: keyof any): obj is T & Record<typeof key, unknown> => {
    while (isDefined(obj)) {
        const descriptor = Object.getOwnPropertyDescriptor(obj, key)
        if (isDefined(descriptor)) {return typeof descriptor.set === "function"}
        obj = Object.getPrototypeOf(obj)
    }
    return false
}
export const tryCatch = <T>(statement: Provider<T>)
    : { status: "success", error: null, value: T } | { status: "failure", error: unknown, value: null } => {
    try {
        return {error: null, value: statement(), status: "success"}
    } catch (error) {
        return {error, value: null, status: "failure"}
    }
}
export const isValidIdentifier = (identifier: string): boolean => /^[A-Za-z_$][A-Za-z0-9_]*$/.test(identifier)
export const asValidIdentifier = (identifier: string): string =>
    isValidIdentifier(identifier) ? identifier : panic(`'${identifier}' is not a valid identifier`)
export const EmptyExec: Exec = (): void => {}
export const EmptyProvider: Provider<any> = (): any => {}
export const EmptyProcedure: Procedure<any> = (_: any): void => {}
export const flipComparator = <T>(comparator: Comparator<T>) => (a: T, b: T) => -comparator(a, b)