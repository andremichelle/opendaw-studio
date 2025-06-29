import css from "./UpdateMessage.sass?inline"
import {Html} from "opendaw-dom"
import {createElement} from "opendaw-jsx"

const className = Html.adoptStyleSheet(css, "UpdateMessage")

export const UpdateMessage = () => {
    return (
        <div className={className}>
            Update available! (please reload)
        </div>
    )
}