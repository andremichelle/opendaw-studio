import {UserInterfaceBox} from "studio-boxes"
import {Editing, PointerField, Vertex} from "opendaw-box"
import {Pointers} from "studio-enums"
import {Notifier, Observer, Option, Subscription, Terminable, Terminator} from "opendaw-std"

export class UserEditing implements Terminable {
    readonly #editing: Editing
    readonly #notifier: Notifier<Option<Vertex>>

    #subscription: Option<Subscription> = Option.None
    #pointer: Option<PointerField<Pointers.Editing>> = Option.None

    constructor(editing: Editing) {
        this.#editing = editing
        this.#notifier = new Notifier()
    }

    catchupAndSubscribe(observer: Observer<Option<Vertex>>): Subscription {
        observer(this.get())
        return this.#notifier.subscribe(observer)
    }

    follow(pointer: PointerField<Pointers.Editing>): void {
        this.#pointer = Option.wrap(pointer)
        this.#subscription.ifSome(subscription => subscription.terminate())
        this.#subscription = Option.wrap(pointer
            .catchupAndSubscribe(pointer => this.#notifier.notify(pointer.targetVertex)))
    }

    edit(target: Vertex<Pointers.Editing | Pointers>): void {
        this.#pointer.ifSome(pointer => this.#editing.modify(() => pointer.refer(target)))
    }

    isEditing(vertex: Vertex<Pointers.Editing | Pointers>): boolean {
        return this.#pointer.match({
            none: () => false,
            some: pointer => pointer.targetVertex.contains(vertex)
        })
    }

    get(): Option<Vertex> {return this.#pointer.flatMap(pointer => pointer.targetVertex)}

    clear(): void {this.#pointer.ifSome(pointer => this.#editing.modify(() => pointer.defer()))}

    terminate(): void {
        this.#pointer = Option.None
        this.#subscription.ifSome(subscription => subscription.terminate())
        this.#subscription = Option.None
        this.#notifier.notify(Option.None)
        this.#notifier.terminate()
    }
}

export class UserEditingManager implements Terminable {
    readonly #terminator: Terminator
    readonly #modularSystem: UserEditing
    readonly #timeline: UserEditing
    readonly #audioUnit: UserEditing

    constructor(editing: Editing) {
        this.#terminator = new Terminator()
        this.#modularSystem = this.#terminator.own(new UserEditing(editing))
        this.#timeline = this.#terminator.own(new UserEditing(editing))
        this.#audioUnit = this.#terminator.own(new UserEditing(editing))
    }

    follow(userInterfaceBox: UserInterfaceBox): void {
        this.#modularSystem.follow(userInterfaceBox.editingModularSystem)
        this.#timeline.follow(userInterfaceBox.editingTimelineRegion)
        this.#audioUnit.follow(userInterfaceBox.editingDeviceChain)
    }

    get modularSystem(): UserEditing {return this.#modularSystem}
    get timeline(): UserEditing {return this.#timeline}
    get audioUnit(): UserEditing {return this.#audioUnit}

    terminate(): void {this.#terminator.terminate()}
}