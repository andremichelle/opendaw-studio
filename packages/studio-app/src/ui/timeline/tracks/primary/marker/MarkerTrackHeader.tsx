import css from "./MarkerTrackHeader.sass?inline"
import {Html} from "opendaw-dom"
import {createElement} from "opendaw-jsx"

const className = Html.adoptStyleSheet(css, "MarkerTrackHeader")

export const MarkerTrackHeader = () => {
    return (<div className={className}>Markers</div>)
}