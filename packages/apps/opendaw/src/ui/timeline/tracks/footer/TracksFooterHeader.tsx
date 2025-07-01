import css from "./TracksFooterHeader.sass?inline"
import {Html} from "lib-dom"
import {createElement} from "lib-jsx"

const className = Html.adoptStyleSheet(css, "TracksFooterHeader")

export const TracksFooterHeader = () => {
    return (<div className={className}/>)
}