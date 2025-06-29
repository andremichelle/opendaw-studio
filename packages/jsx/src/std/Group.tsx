import {JsxValue} from "../types"
import {createElement} from "../create-element"

export const Group = (_: unknown, children: ReadonlyArray<JsxValue>) => (
    <div style={{display: "contents"}}>{children}</div>
)