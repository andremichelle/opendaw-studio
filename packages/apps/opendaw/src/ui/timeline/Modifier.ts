import {Dragging} from "lib-dom"
import {Editing} from "lib-box"

export interface Modifier {
    update(event: Dragging.Event): void
    approve(editing: Editing): void
    cancel(): void
}