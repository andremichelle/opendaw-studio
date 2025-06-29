import css from "./FloatingTextInput.sass?inline"
import {isDefined, Point} from "opendaw-std"
import {createElement} from "opendaw-jsx"
import {Html} from "opendaw-dom"

const className = Html.adoptStyleSheet(css, "TextInput")

type Construct = {
    resolvers?: PromiseWithResolvers<string>
    position?: Point
    value?: boolean | number | string
    unit?: string
}

export const FloatingTextInput = ({resolvers, position, value, unit}: Construct) => {
    const inputField: HTMLInputElement = (<input type="text" value={isDefined(value) ? String(value) : ""}/>)
    requestAnimationFrame(() => {
        inputField.select()
        inputField.focus()
    })
    if (isDefined(resolvers)) {
        const {reject, resolve} = resolvers
        const remove = () => {
            inputField.onblur = null
            inputField.onkeydown = null
            element.remove()
        }
        inputField.onblur = () => {
            remove()
            reject("cancel")
        }
        inputField.onkeydown = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() === "enter") {
                const value = inputField.value
                remove()
                resolve(value)
            }
        }
    }
    const element: HTMLElement = (
        <div className={className} unit={unit}
             style={isDefined(position) ? {
                 position: "absolute",
                 transform: `translate(${position.x}px, ${position.y}px)`
             } : {}}>
            {inputField}
        </div>
    )
    return element
}