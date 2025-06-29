import css from "./MarkerTrackHeader.sass?inline"
import {Html} from "lib-dom"
import {createElement} from "lib-jsx"

const className = Html.adoptStyleSheet(css, "MarkerTrackHeader")

export const MarkerTrackHeader = () => {
    return (<div className={className}>Markers</div>)
}