import css from "./InsertMarker.sass?inline"
import {Html} from "opendaw-dom"
import {IconSymbol} from "studio-shared"
import {Icon} from "@/ui/components/Icon"
import {createElement} from "opendaw-jsx"

const className = Html.adoptStyleSheet(css, "InsertMarker")

export const InsertMarker = () => {
    return (
        <div className={className}>
            <Icon symbol={IconSymbol.ArrayDown}/>
        </div>
    )
}