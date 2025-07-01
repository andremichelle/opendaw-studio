import css from "./Icon.sass?inline"
import {Lifecycle, ObservableValue} from "lib-std"
import {createElement} from "lib-jsx"
import {IconSymbol} from "studio-adapters"
import {Html} from "lib-dom"

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