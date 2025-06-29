import css from "./AudioEditorHeader.sass?inline"
import {Lifecycle} from "opendaw-std"
import {StudioService} from "@/service/StudioService.ts"
import {createElement} from "opendaw-jsx"
import {Html} from "opendaw-dom"

const className = Html.adoptStyleSheet(css, "AudioEditorHeader")

type Construct = {
    lifecycle: Lifecycle
    service: StudioService
}

export const AudioEditorHeader = ({}: Construct) => (
    <div className={className}>
        <p className="help-section">
            Navigatable but otherwise non-functional yet
        </p>
    </div>
)