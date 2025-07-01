import css from "./FlexSpace.sass?inline"
import {createElement} from "lib-jsx"
import {Html} from "lib-dom"

const className = Html.adoptStyleSheet(css, "FlexSpace")

export const FlexSpace = () => {
    return (
        <div className={className}/>
    )
}