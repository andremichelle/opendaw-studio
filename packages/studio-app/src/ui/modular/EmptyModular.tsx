import css from "./EmptyModular.sass?inline"
import {Lifecycle} from "opendaw-std"
import {Icon} from "@/ui/components/Icon.tsx"
import {IconSymbol} from "studio-shared"
import {createElement} from "opendaw-jsx"
import {Html} from "opendaw-dom"

const className = Html.adoptStyleSheet(css, "EmptyModular")

type Construct = {
    lifecycle: Lifecycle
}

export const EmptyModular = ({lifecycle}: Construct) => {
    return (
        <div className={className}>
            <div>
                <h1>
                    <Icon symbol={IconSymbol.Box}/><span>No Modular System</span>
                </h1>
                <p>
                    Create a new modular system in the devices panel (not yet functional though).
                </p>
            </div>
        </div>
    )
}