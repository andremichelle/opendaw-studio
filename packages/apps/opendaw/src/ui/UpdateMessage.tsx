import css from "./UpdateMessage.sass?inline"
import {Html} from "lib-dom"
import {createElement} from "lib-jsx"

const className = Html.adoptStyleSheet(css, "UpdateMessage")

export const UpdateMessage = () => {
    return (
        <div className={className}>
            Update available! (please reload)
        </div>
    )
}