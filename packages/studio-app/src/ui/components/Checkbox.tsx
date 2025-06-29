import {Lifecycle, MutableObservableValue} from "opendaw-std"
import {createElement, JsxValue} from "opendaw-jsx"
import {Appearance, ButtonCheckboxRadio} from "@/ui/components/ButtonCheckboxRadio.tsx"
import {Html} from "opendaw-dom"

type Construct = {
    lifecycle: Lifecycle
    model: MutableObservableValue<boolean>
    style?: Partial<CSSStyleDeclaration>
    className?: string
    appearance?: Appearance
}

export const Checkbox = ({lifecycle, model, style, className, appearance}: Construct, children: JsxValue) => {
    const id = Html.nextID()
    const input: HTMLInputElement = (
        <input type="checkbox"
               id={id}
               oninput={() => {
                   model.setValue(input.checked)
                   input.checked = model.getValue()
               }}
               checked={model.getValue()}/>
    )
    lifecycle.own(model.subscribe(model => {
        input.checked = model.getValue()
    }))
    return (
        <ButtonCheckboxRadio lifecycle={lifecycle}
                             style={style}
                             className={className}
                             appearance={appearance}
                             dataClass="checkbox">
            {input}
            <label htmlFor={id} style={{cursor: appearance?.cursor ?? "auto"}}>{children}</label>
        </ButtonCheckboxRadio>
    )
}