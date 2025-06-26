import css from "./Icon.sass?inline"
import {Lifecycle, ObservableValue} from "std"
import {createElement} from "jsx"
import {IconSymbol} from "@core/IconSymbol.ts"
import {Html} from "dom"

const defaultClassName = Html.adoptStyleSheet(css, "Icon")

export const Icon = ({symbol, className, style}: {
    symbol: IconSymbol,
    className?: string,
    style?: Partial<CSSStyleDeclaration>
}) => (
    <svg classList={Html.buildClassList(defaultClassName, className)} style={style}>
        <use href={`#${IconSymbol.toName(symbol)}`}/>
    </svg>
)

export const IconCartridge = ({lifecycle, symbol, className, style}: {
    lifecycle: Lifecycle,
    symbol: ObservableValue<IconSymbol>,
    className?: string,
    style?: Partial<CSSStyleDeclaration>
}) => {
    const use: SVGUseElement = <use href=""/>
    const updater = () => use.href.baseVal = `#${IconSymbol.toName(symbol.getValue())}`
    updater()
    lifecycle.own(symbol.subscribe(updater))
    return (<svg classList={Html.buildClassList(defaultClassName, className)} style={style}>{use}</svg>)
}