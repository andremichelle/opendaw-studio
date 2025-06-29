import css from "./TextButton.sass?inline"
import {Exec} from "opendaw-std"
import {createElement} from "opendaw-jsx"
import {Html} from "opendaw-dom"

const className = Html.adoptStyleSheet(css, "TextButton")

export const TextButton = ({onClick}: { onClick: Exec }) => (
    <div className={className} onclick={onClick}/>
)