import css from "./Track.sass?inline"
import {Lifecycle} from "std"
import {Html} from "dom"
import {StudioService} from "@/service/StudioService.ts"
import {createElement} from "jsx"
import {TrackHeader} from "@/ui/timeline/tracks/audio-unit/TrackHeader.tsx"
import {AudioUnitBoxAdapter} from "@core/shared/adapters/audio-unit/AudioUnitBoxAdapter.ts"
import {TrackBoxAdapter} from "@core/shared/adapters/timeline/TrackBoxAdapter.ts"
import {ClipLane} from "@/ui/timeline/tracks/audio-unit/clips/ClipLane.tsx"
import {RegionLane} from "@/ui/timeline/tracks/audio-unit/regions/RegionLane.tsx"
import {TracksManager} from "@/ui/timeline/tracks/audio-unit/TracksManager.ts"

const className = Html.adoptStyleSheet(css, "Track")

type Construct = {
    lifecycle: Lifecycle
    service: StudioService
    trackManager: TracksManager
    audioUnitBoxAdapter: AudioUnitBoxAdapter
    trackBoxAdapter: TrackBoxAdapter
}

export const Track = ({lifecycle, service, trackManager, audioUnitBoxAdapter, trackBoxAdapter}: Construct) => {
    const {project} = service
    const element: HTMLElement = (
        <div className={className}>
            <TrackHeader lifecycle={lifecycle}
                         project={project}
                         audioUnitBoxAdapter={audioUnitBoxAdapter}
                         trackBoxAdapter={trackBoxAdapter}/>
            <ClipLane lifecycle={lifecycle}
                      service={service}
                      adapter={trackBoxAdapter}
                      trackManager={trackManager}/>
            <RegionLane lifecycle={lifecycle}
                        adapter={trackBoxAdapter}
                        trackManager={trackManager}
                        range={service.timeline.range}/>
        </div>
    )
    lifecycle.own(trackBoxAdapter.indexField
        .catchupAndSubscribe(owner => element.style.gridRow = String(owner.getValue() + 1)))
    return element
}