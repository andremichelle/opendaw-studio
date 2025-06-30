import css from "./InsertMarker.sass?inline"
import {Html} from "lib-dom"
import {IconSymbol} from "studio-adapters"
import {Icon} from "@/ui/components/Icon"
import {createElement} from "lib-jsx"

const className = Html.adoptStyleSheet(css, "InsertMarker")

export const InsertMarker = () => {
    return (
        <div className={className}>
            <Icon symbol={IconSymbol.ArrayDown}/>
        </div>
    )
}