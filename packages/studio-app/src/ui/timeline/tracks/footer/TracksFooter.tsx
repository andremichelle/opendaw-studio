import css from "./TracksFooter.sass?inline"
import {Lifecycle} from "opendaw-std"
import {StudioService} from "@/service/StudioService.ts"
import {TimelineRangeSlider} from "@/ui/timeline/TimelineRangeSlider.tsx"
import {createElement} from "opendaw-jsx"
import {TracksFooterHeader} from "@/ui/timeline/tracks/footer/TracksFooterHeader.tsx"
import {Html} from "opendaw-dom"

const className = Html.adoptStyleSheet(css, "TracksFooter")

type Construct = {
    lifecycle: Lifecycle
    service: StudioService
}

export const TracksFooter = ({lifecycle, service}: Construct) => {
    return (
        <div className={className}>
            <TracksFooterHeader/>
            <div className="void"/>
            <TimelineRangeSlider lifecycle={lifecycle}
                                 range={service.timeline.range}
                                 className="clips-aware"/>
        </div>
    )
}