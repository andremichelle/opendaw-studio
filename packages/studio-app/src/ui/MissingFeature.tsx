import css from "./MissingFeature.sass?inline"
import {createElement} from "opendaw-jsx"
import {Html} from "opendaw-dom"
import {Colors} from "@/ui/Colors.ts"

const className = Html.adoptStyleSheet(css, "MissingFeature")

type Construct = { error: unknown }

export const MissingFeature = ({error}: Construct) => {
    return (
        <div className={className}>
            <h1>Get openDAW Working</h1>
            <h2>An important feature <span style={{color: Colors.purple}}>"{error}"</span> is missing.</h2>
            <p>Please update your browser or switch to the latest Chrome (recommended).</p>
            <p>openDAW should run on all modern browsers like Chrome, Edge, Firefox, and Safari.</p>
            <p>If you are already using one of these, please report your problem to <a
                href="mailto:support@opendaw.org">support@opendaw.org</a></p>
        </div>
    )
}