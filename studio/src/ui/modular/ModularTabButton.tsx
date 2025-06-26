import css from "./ModularTabButton.sass?inline"
import {Lifecycle} from "std"
import {ModularAdapter} from "@core/shared/adapters/modular/modular.ts"
import {UserEditing} from "@/UserEditingManager.ts"
import {Vertex} from "box"
import {createElement, Inject} from "jsx"
import {Html} from "dom"

const className = Html.adoptStyleSheet(css, "ModularTabButton")

type Construct = {
    lifecycle: Lifecycle
    userFocus: UserEditing
    adapter: ModularAdapter
}

export const ModularTabButton = ({lifecycle, userFocus, adapter}: Construct) => {
    const nameValue = lifecycle.own(Inject.value(adapter.labelField.getValue()))
    lifecycle.own(adapter.labelField.subscribe(owner => nameValue.value = owner.getValue()))
    const element: HTMLDivElement = (
        <div className={className} onclick={() => userFocus.edit(adapter.editingField)}>
            {nameValue}
        </div>
    )
    lifecycle.own(userFocus.catchupAndSubscribe(subject => subject.match({
        none: () => element.classList.remove("focus"),
        some: (vertex: Vertex) => {element.classList.toggle("focus", vertex === adapter.editingField)}
    })))
    return element
}