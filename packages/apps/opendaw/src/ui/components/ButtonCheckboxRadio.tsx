import css from "./ButtonCheckboxRadio.sass?inline"
import {isDefined, Lifecycle} from "lib-std"
import {createElement, JsxValue} from "lib-jsx"
import {TextTooltip} from "@/ui/surface/TextTooltip.tsx"
import {CssUtils, Html} from "lib-dom"

const className = Html.adoptStyleSheet(css, "ButtonCheckboxRadio")

export type Appearance = {
    color?: string
    activeColor?: string
    framed?: boolean
    landscape?: boolean
    tooltip?: string
    cursor?: CssUtils.Cursor
}

type Construct = {
    lifecycle: Lifecycle
    dataClass: string
    style?: Partial<CSSStyleDeclaration>
    className?: string
    appearance?: Appearance
}

export const ButtonCheckboxRadio = ({
                                        lifecycle,
                                        dataClass,
                                        style,
                                        className: externalClassName,
                                        appearance
                                    }: Construct, children: JsxValue) => {
    const wrapper: HTMLElement = (
        <div
            className={Html.buildClassList(className,
                appearance?.framed && "framed",
                appearance?.landscape && "landscape",
                externalClassName)}
            data-class={dataClass}
            onpointerdown={(event: PointerEvent) => {
                self.getSelection()?.removeAllRanges()
                event.preventDefault()
                event.stopPropagation()
            }}>
            {children}
        </div>
    )

    if (appearance?.tooltip) {
        lifecycle.own(TextTooltip.simple(wrapper, () => {
            const clientRect = wrapper.getBoundingClientRect()
            return {
                clientX: clientRect.left,
                clientY: clientRect.bottom + 8,
                text: appearance.tooltip ?? ""
            }
        }))
    }

    if (isDefined(appearance?.color)) {
        wrapper.style.setProperty("--color", appearance.color)
    }
    if (isDefined(appearance?.activeColor)) {
        wrapper.style.setProperty("--color-active", appearance.activeColor)
    }
    if (isDefined(style)) {
        Object.assign(wrapper.style, style)
    }
    return wrapper
}