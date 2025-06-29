import {Field, FieldConstruct} from "./field"
import {UnreferenceableType} from "./pointer"
import {Arrays, asDefined, DataInput, DataOutput, int, Nullish, Option, safeExecute} from "lib-std"
import {NoPointers, VertexVisitor} from "./vertex"

export type ArrayFieldFactory<FIELD extends Field> = (construct: FieldConstruct<UnreferenceableType>) => FIELD

export class ArrayField<FIELD extends Field = Field>
    extends Field<UnreferenceableType, Record<int, FIELD>> {
    static create<FIELD extends Field>(
        construct: FieldConstruct<UnreferenceableType>,
        factory: ArrayFieldFactory<FIELD>,
        length: int): ArrayField<FIELD> {
        return new ArrayField<FIELD>(construct, factory, length)
    }
    readonly #fields: ReadonlyArray<FIELD>

    private constructor(construct: FieldConstruct<UnreferenceableType>, factory: ArrayFieldFactory<FIELD>, length: int) {
        super(construct)

        this.#fields = Arrays.create((index: int) => factory({
            parent: this,
            fieldKey: index,
            fieldName: String(index),
            pointerRules: NoPointers
        }), length)
    }

    accept<RETURN>(visitor: VertexVisitor<RETURN>): Nullish<RETURN> {
        return safeExecute(visitor.visitArrayField, this)
    }

    fields(): Iterable<FIELD> {return this.#fields}

    getField(key: keyof Record<int, FIELD>): Record<int, FIELD>[keyof Record<int, FIELD>] {
        return asDefined(this.#fields[key])
    }

    optField(key: keyof Record<int, FIELD>): Option<Record<int, FIELD>[keyof Record<int, FIELD>]> {
        return Option.wrap(this.#fields[key])
    }

    read(input: DataInput): void {this.#fields.forEach(field => field.read(input))}
    write(output: DataOutput): void {this.#fields.forEach(field => field.write(output))}

    size(): int {return this.#fields.length}

    toJSON() {return this.#fields}
}