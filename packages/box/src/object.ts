import {Field, FieldConstruct, Fields} from "./field"
import {UnreferenceableType} from "./pointer"
import {asDefined, DataInput, DataOutput, Nullish, Option, safeExecute} from "opendaw-std"
import {Serializer} from "./serializer"
import {VertexVisitor} from "./vertex"

export abstract class ObjectField<FIELDS extends Fields> extends Field<UnreferenceableType, FIELDS> {
    readonly #fields: FIELDS

    protected constructor(construct: FieldConstruct<UnreferenceableType>) {
        super(construct)

        this.#fields = this.initializeFields()
    }

    protected abstract initializeFields(): FIELDS

    accept<RETURN>(visitor: VertexVisitor<RETURN>): Nullish<RETURN> {
        return safeExecute(visitor.visitObjectField, this)
    }

    fields(): Iterable<Field> {return Object.values(this.#fields)}
    getField<K extends keyof FIELDS>(key: K): FIELDS[K] {return asDefined(this.#fields[key])}
    optField<K extends keyof FIELDS>(key: K): Option<FIELDS[K]> {return Option.wrap(this.#fields[key])}

    read(input: DataInput): void {Serializer.readFields(input, this.#fields)}
    write(output: DataOutput): void {Serializer.writeFields(output, this.#fields)}

    toJSON() {return this.#fields}
}