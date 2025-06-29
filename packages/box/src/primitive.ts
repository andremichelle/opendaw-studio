import {Field, FieldConstruct} from "./field"
import {PointerTypes, UnreferenceableType} from "./pointer"
import {
    assert,
    ByteArrayInput,
    ByteArrayOutput,
    DataInput,
    DataOutput,
    Float,
    float,
    int,
    Integer,
    MutableObservableValue,
    Nullish,
    ObservableValue,
    Observer,
    safeExecute,
    Subscription
} from "opendaw-std"
import {Propagation} from "./dispatchers"
import {VertexVisitor} from "./vertex"

export type PrimitiveValues = float | int | string | boolean | Readonly<Int8Array>

export enum PrimitiveType {
    Boolean = "boolean", Float32 = "float32", Int32 = "int32", String = "string", Bytes = "bytes"
}

export interface ValueSerialization<V extends PrimitiveValues = PrimitiveValues> {
    get type(): PrimitiveType
    encode(output: DataOutput, value: V): void
    decode(input: DataInput): V
}

export const ValueSerialization = {
    [PrimitiveType.Boolean]: {
        type: PrimitiveType.Boolean,
        encode: (output: DataOutput, value: boolean): void => output.writeBoolean(value),
        decode: (input: DataInput): boolean => input.readBoolean()
    },
    [PrimitiveType.Float32]: {
        type: PrimitiveType.Float32,
        encode: (output: DataOutput, value: float): void => output.writeFloat(value),
        decode: (input: DataInput): float => input.readFloat()
    },
    [PrimitiveType.Int32]: {
        type: PrimitiveType.Int32,
        encode: (output: DataOutput, value: int): void => output.writeInt(value),
        decode: (input: DataInput): int => input.readInt()
    },
    [PrimitiveType.String]: {
        type: PrimitiveType.String,
        encode: (output: DataOutput, value: string): void => output.writeString(value),
        decode: (input: DataInput): string => input.readString()
    },
    [PrimitiveType.Bytes]: {
        type: PrimitiveType.Bytes,
        encode: (output: DataOutput, value: Readonly<Int8Array>): void => {
            output.writeInt(value.length)
            output.writeBytes(value)
        },
        decode: (input: DataInput): Readonly<Int8Array> => {
            const array = new Int8Array(input.readInt())
            input.readBytes(array)
            return array
        }
    }
} as const satisfies Record<PrimitiveType, ValueSerialization>

export abstract class PrimitiveField<
    V extends PrimitiveValues = PrimitiveValues,
    P extends PointerTypes = UnreferenceableType
> extends Field<P, never> implements MutableObservableValue<V> {
    readonly #type: PrimitiveType

    #initValue: V
    #value: V

    protected constructor(field: FieldConstruct<P>, type: PrimitiveType, value: V) {
        super(field)

        this.#type = type
        this.#initValue = this.clamp(value)
        this.#value = this.#initValue
    }

    accept<RETURN>(visitor: VertexVisitor<RETURN>): Nullish<RETURN> {
        return safeExecute(visitor.visitPrimitiveField, this as PrimitiveField)
    }

    subscribe(observer: Observer<ObservableValue<V>>): Subscription {
        return this.graph.subscribeVertexUpdates(Propagation.This, this.address, () => observer(this))
    }

    catchupAndSubscribe(observer: Observer<ObservableValue<V>>): Subscription {
        observer(this)
        return this.subscribe(observer)
    }

    abstract serialization(): ValueSerialization<V>
    abstract equals(value: V): boolean
    abstract clamp(value: V): V

    get type(): PrimitiveType {return this.#type}
    get initValue(): V {return this.#initValue}

    setInitValue(value: V): void {
        assert(this.graph.constructingBox(), "Cannot change initial value at runtime")
        this.setValue(this.#initValue = value)
    }

    getValue(): V {return this.#value}
    setValue(value: V): void {
        const oldValue = this.#value
        const newValue = this.clamp(value)
        if (this.equals(newValue)) {return}
        this.#value = value
        this.graph.onPrimitiveValueUpdate(this, oldValue, newValue)
    }
    writeValue(output: ByteArrayOutput, value: V): void {this.serialization().encode(output, value)}
    readValue(input: ByteArrayInput): V {return this.serialization().decode(input)}
    reset(): void {this.setValue(this.#initValue)}
}

export class BooleanField<E extends PointerTypes = UnreferenceableType> extends PrimitiveField<boolean, E> {
    static create<E extends PointerTypes = UnreferenceableType>(
        construct: FieldConstruct<E>,
        value: boolean = false): BooleanField<E> {
        return new BooleanField<E>(construct, value)
    }
    private constructor(construct: FieldConstruct<E>, value: boolean) {super(construct, PrimitiveType.Boolean, value)}
    toggle(): void {this.setValue(!this.getValue())}
    serialization(): ValueSerialization<boolean> {return ValueSerialization[PrimitiveType.Boolean]}
    equals(value: boolean): boolean {return this.getValue() === value}
    clamp(value: boolean): boolean {return value}
    read(input: DataInput): void {this.setValue(input.readBoolean())}
    write(output: DataOutput): void {output.writeBoolean(this.getValue())}
}

export class Float32Field<E extends PointerTypes = UnreferenceableType> extends PrimitiveField<float, E> {
    static create<E extends PointerTypes = UnreferenceableType>(
        construct: FieldConstruct<E>,
        value: float = 0.0): Float32Field<E> {
        return new Float32Field<E>(construct, value)
    }
    private constructor(construct: FieldConstruct<E>, value: float) {super(construct, PrimitiveType.Float32, value)}
    serialization(): ValueSerialization<float> {return ValueSerialization[PrimitiveType.Float32]}
    equals(value: float): boolean {return this.getValue() === value}
    clamp(value: float): float {return Float.toFloat32(value)}
    read(input: DataInput): void {this.setValue(input.readFloat())}
    write(output: DataOutput): void {output.writeFloat(this.getValue())}
}

export class Int32Field<E extends PointerTypes = UnreferenceableType> extends PrimitiveField<int, E> {
    static create<E extends PointerTypes = UnreferenceableType>(
        construct: FieldConstruct<E>,
        value: int = 0): Int32Field<E> {
        return new Int32Field<E>(construct, value)
    }
    private constructor(construct: FieldConstruct<E>, value: int) {super(construct, PrimitiveType.Int32, value)}
    serialization(): ValueSerialization<int> {return ValueSerialization[PrimitiveType.Int32]}
    equals(value: int): boolean {return this.getValue() === value}
    clamp(value: int): int {return Integer.toInt(value)}
    read(input: DataInput): void {this.setValue(input.readInt())}
    write(output: DataOutput): void {output.writeInt(this.getValue())}
}

export class StringField<E extends PointerTypes = UnreferenceableType> extends PrimitiveField<string, E> {
    static create<E extends PointerTypes = UnreferenceableType>(
        construct: FieldConstruct<E>,
        value: string = ""): StringField<E> {
        return new StringField<E>(construct, value)
    }
    private constructor(construct: FieldConstruct<E>, value: string) {super(construct, PrimitiveType.String, value)}
    serialization(): ValueSerialization<string> {return ValueSerialization[PrimitiveType.String]}
    equals(value: string): boolean {return this.getValue() === value}
    clamp(value: string): string {return value}
    read(input: DataInput): void {this.setValue(input.readString())}
    write(output: DataOutput): void {output.writeString(this.getValue())}
}

export class ByteArrayField<E extends PointerTypes = UnreferenceableType> extends PrimitiveField<Readonly<Int8Array>, E> {
    static create<E extends PointerTypes = UnreferenceableType>(
        construct: FieldConstruct<E>,
        value: Readonly<Int8Array> = this.#empty): ByteArrayField<E> {
        return new ByteArrayField<E>(construct, value)
    }
    static readonly #empty = Object.freeze(new Int8Array(0))
    private constructor(construct: FieldConstruct<E>, value: Readonly<Int8Array>) {super(construct, PrimitiveType.Bytes, value)}
    serialization(): ValueSerialization<Readonly<Int8Array>> {return ValueSerialization[PrimitiveType.Bytes]}
    equals(value: Readonly<Int8Array>): boolean {
        return this.getValue().length === value.length && this.getValue().every((x, index) => value[index] === x)
    }
    clamp(value: Readonly<Int8Array>): Readonly<Int8Array> {return value}
    read(input: DataInput): void {
        const bytes: Int8Array = new Int8Array(input.readInt())
        input.readBytes(bytes)
        this.setValue(bytes)
    }
    write(output: DataOutput): void {
        const bytes: Readonly<Int8Array> = this.getValue()
        output.writeInt(bytes.length)
        output.writeBytes(bytes)
    }
}