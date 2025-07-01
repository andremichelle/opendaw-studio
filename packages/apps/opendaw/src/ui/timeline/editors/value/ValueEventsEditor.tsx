import css from "./ValueEventsEditor.sass?inline"
import {Lifecycle} from "lib-std"
import {StudioService} from "@/service/StudioService.ts"
import {createElement} from "lib-jsx"
import {TimelineRange} from "@/ui/timeline/TimelineRange.ts"
import {Snapping} from "@/ui/timeline/Snapping.ts"
import {ValueEditor} from "@/ui/timeline/editors/value/ValueEditor.tsx"
import {ValueEditorHeader} from "@/ui/timeline/editors/value/ValueEditorHeader.tsx"
import {EditorMenuCollector} from "@/ui/timeline/editors/EditorMenuCollector.ts"
import {ValueEventOwnerReader} from "@/ui/timeline/editors/EventOwnerReader.ts"
import {ValueEditingContext} from "@/ui/timeline/editors/value/ValueEditingContext.ts"
import {Html} from "lib-dom"

const className = Html.adoptStyleSheet(css, "ValueEventsEditor")

type Construct = {
    lifecycle: Lifecycle
    service: StudioService
    context: ValueEditingContext
    menu: EditorMenuCollector
    range: TimelineRange
    snapping: Snapping
    reader: ValueEventOwnerReader
}

export const ValueEventsEditor = ({lifecycle, service, context, range, snapping, reader}: Construct) => {
    return (
        <div className={className}>
            <ValueEditorHeader lifecycle={lifecycle}
                               service={service}
                               context={context}/>
            <ValueEditor lifecycle={lifecycle}
                         service={service}
                         range={range}
                         snapping={snapping}
                         context={context}
                         reader={reader}/>
        </div>
    )
}