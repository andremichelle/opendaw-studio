import {Dragging} from "opendaw-dom"
import {Editing} from "opendaw-box"

export interface Modifier {
    update(event: Dragging.Event): void
    approve(editing: Editing): void
    cancel(): void
}