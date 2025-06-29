import css from "./TracksFooterHeader.sass?inline"
import {Html} from "opendaw-dom"
import {createElement} from "opendaw-jsx"

const className = Html.adoptStyleSheet(css, "TracksFooterHeader")

export const TracksFooterHeader = () => {
    return (<div className={className}/>)
}