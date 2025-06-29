import {DataInput, DataOutput, Nullish, Observer, Option, panic, safeExecute, Subscription} from "lib-std"
import {Vertex, VertexVisitor} from "./vertex"
import {Address} from "./address"
import {PointerHub} from "./pointer-hub"
import {Field, FieldConstruct} from "./field"
import {Propagation} from "./dispatchers"

const _Unreferenceable = Symbol("Unreferenceable")

export type UnreferenceableType = typeof _Unreferenceable

export type PointerTypes = number | string | UnreferenceableType

export class PointerField<P extends PointerTypes = PointerTypes> extends Field<UnreferenceableType, never> {
    static create<P extends PointerTypes>(construct: FieldConstruct<UnreferenceableType>,
                                          pointerType: P,
                                          mandatory: boolean): PointerField<P> {
        return new PointerField<P>(construct, pointerType, mandatory)
    }

    readonly #pointerType: P
    readonly #mandatory: boolean

    #targetVertex: Option<Vertex> = Option.None
    #targetAddress: Option<Address> = Option.None

    private constructor(field: FieldConstruct<UnreferenceableType>, pointerType: P, mandatory: boolean) {
        super(field)

        this.#pointerType = pointerType
        this.#mandatory = mandatory

        if (mandatory) {this.graph.edges().watchVertex(this)}
    }

    get pointerHub(): PointerHub {return panic(`${this} cannot be pointed to`)}

    get pointerType(): P {return this.#pointerType}
    get mandatory(): boolean {return this.#mandatory}

    accept<RETURN>(visitor: VertexVisitor<RETURN>): Nullish<RETURN> {
        return safeExecute(visitor.visitPointerField, this as PointerField)
    }

    subscribe(observer: Observer<this>): Subscription {
        return this.graph.subscribeVertexUpdates(Propagation.This, this.address, () => observer(this))
    }

    catchupAndSubscribe(observer: Observer<this>): Subscription {
        observer(this)
        return this.graph.subscribeVertexUpdates(Propagation.This, this.address,
            () => this.graph.subscribeEndTransaction(() => observer(this)))
    }

    refer<TARGET extends PointerTypes>(vertex: Vertex<P & TARGET extends never ? never : TARGET>): void {
        this.targetVertex = Option.wrap(vertex)
    }

    defer(): void {this.targetVertex = Option.None}

    get targetVertex(): Option<Vertex> {return this.#targetVertex}
    set targetVertex(option: Option<Vertex>) {
        if (option.nonEmpty()) {
            const issue = PointerHub.validate(this, option.unwrap())
            if (issue.nonEmpty()) {
                panic(issue.unwrap())
            }
        }
        this.targetAddress = option.map(vertex => vertex.address)
    }

    get targetAddress(): Option<Address> {return this.#targetAddress}
    set targetAddress(newValue: Option<Address>) {
        const oldValue = this.#targetAddress
        if ((oldValue.isEmpty() && newValue.isEmpty())
            || (newValue.nonEmpty() && oldValue.unwrapOrNull()?.equals(newValue.unwrap())) === true) {return}
        this.#targetAddress = newValue
        this.graph.onPointerAddressUpdated(this, oldValue, newValue)
    }

    isEmpty(): boolean {return this.targetAddress.isEmpty()}
    nonEmpty(): boolean {return this.targetAddress.nonEmpty()}

    resolve(): void {
        const targetAddress: Option<Address> = this.targetAddress
        const target: Option<Vertex> = targetAddress.flatMap((address: Address) => this.graph.findVertex(address))
        if (targetAddress.nonEmpty() && target.isEmpty()) {
            return panic(`${targetAddress.unwrapOrNull()?.toString()} could not be resolved`)
        }
        this.#targetVertex = target
    }

    read(input: DataInput) {
        this.targetAddress = input.readBoolean() ? Option.wrap(Address.read(input)) : Option.None
    }

    write(output: DataOutput) {
        this.#targetAddress.match({
            none: () => output.writeBoolean(false),
            some: address => {
                output.writeBoolean(true)
                address.write(output)
            }
        })
    }
}