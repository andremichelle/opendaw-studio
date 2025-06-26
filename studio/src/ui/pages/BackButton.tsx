import css from "./BackButton.sass?inline"
import {Html} from "dom"
import {Icon} from "@/ui/components/Icon"
import {IconSymbol} from "@core/IconSymbol.ts"
import {createElement, LocalLink} from "jsx"

const className = Html.adoptStyleSheet(css, "BackButton")

export const BackButton = () => {
    return (
        <div className={className}>
            <LocalLink href="/">
                <Icon symbol={IconSymbol.OpenDAW} style={{fontSize: "1.25em"}}/><span>GO BACK TO STUDIO</span>
            </LocalLink>
        </div>
    )
}