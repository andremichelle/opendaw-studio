import css from "./FlexSpace.sass?inline"
import {createElement} from "opendaw-jsx"
import {Html} from "opendaw-dom"

const className = Html.adoptStyleSheet(css, "FlexSpace")

export const FlexSpace = () => {
    return (
        <div className={className}/>
    )
}