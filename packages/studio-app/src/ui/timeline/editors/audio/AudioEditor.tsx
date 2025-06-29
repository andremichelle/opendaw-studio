import {Lifecycle} from "opendaw-std"
import {createElement, Frag} from "opendaw-jsx"
import {StudioService} from "@/service/StudioService.ts"
import {AudioEditorHeader} from "@/ui/timeline/editors/audio/AudioEditorHeader.tsx"
import {AudioEditorCanvas} from "@/ui/timeline/editors/audio/AudioEditorCanvas.tsx"
import {TimelineRange} from "@/ui/timeline/TimelineRange.ts"
import {Snapping} from "@/ui/timeline/Snapping.ts"
import {EditorMenuCollector} from "@/ui/timeline/editors/EditorMenuCollector.ts"
import {AudioEventOwnerReader} from "@/ui/timeline/editors/EventOwnerReader.ts"

type Construct = {
    lifecycle: Lifecycle
    service: StudioService
    menu: EditorMenuCollector
    range: TimelineRange
    snapping: Snapping
    reader: AudioEventOwnerReader
}

export const AudioEditor = ({lifecycle, service, range, snapping, reader}: Construct) => {
    return (
        <Frag>
            <AudioEditorHeader lifecycle={lifecycle}
                               service={service}/>
            <AudioEditorCanvas lifecycle={lifecycle}
                               service={service}
                               range={range}
                               snapping={snapping}
                               reader={reader}/>
        </Frag>
    )
}