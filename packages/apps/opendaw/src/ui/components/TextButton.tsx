import css from "./TextButton.sass?inline"
import {Exec} from "lib-std"
import {createElement} from "lib-jsx"
import {Html} from "lib-dom"

const className = Html.adoptStyleSheet(css, "TextButton")

export const TextButton = ({onClick}: { onClick: Exec }) => (
    <div className={className} onclick={onClick}/>
)