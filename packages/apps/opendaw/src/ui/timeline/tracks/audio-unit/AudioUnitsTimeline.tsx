import css from "./AudioUnitsTimeline.sass?inline"
import {Lifecycle} from "lib-std"
import {createElement} from "lib-jsx"
import {StudioService} from "@/service/StudioService.ts"
import {Scroller} from "@/ui/components/Scroller.tsx"
import {ScrollModel} from "@/ui/components/ScrollModel.ts"
import {TrackFactory, TracksManager} from "@/ui/timeline/tracks/audio-unit/TracksManager.ts"
import {Track} from "./Track"
import {RegionsArea} from "./regions/RegionsArea.tsx"
import {ClipsArea} from "./clips/ClipsArea.tsx"
import {AudioUnitBoxAdapter} from "studio-adapters"
import {TrackBoxAdapter} from "studio-adapters"
import {AnimationFrame, Events, Html} from "lib-dom"
import {ExtraSpace} from "./Constants.ts"

const className = Html.adoptStyleSheet(css, "AudioUnitsTimeline")

type Construct = {
    lifecycle: Lifecycle
    service: StudioService
}

export const AudioUnitsTimeline = ({lifecycle, service}: Construct) => {
    const {range} = service.timeline
    const scrollModel = new ScrollModel()
    const scrollContainer: HTMLElement = (
        <div className="scrollable">
            <div className="fill"/>
            <div className="extra"/>
        </div>
    )
    const factory: TrackFactory = {
        create: (manager: TracksManager,
                 lifecycle: Lifecycle,
                 audioUnitBoxAdapter: AudioUnitBoxAdapter,
                 trackBoxAdapter: TrackBoxAdapter): HTMLElement => (
            <Track lifecycle={lifecycle}
                   service={service}
                   trackManager={manager}
                   audioUnitBoxAdapter={audioUnitBoxAdapter}
                   trackBoxAdapter={trackBoxAdapter}/>
        )
    }
    const manager: TracksManager = lifecycle.own(new TracksManager(service, scrollContainer, factory))
    const clipArea: HTMLElement = <ClipsArea lifecycle={lifecycle}
                                             service={service}
                                             manager={manager}
                                             scrollModel={scrollModel}
                                             scrollContainer={scrollContainer}/>
    const regionArea: HTMLElement = <RegionsArea lifecycle={lifecycle}
                                                 service={service}
                                                 manager={manager}
                                                 scrollModel={scrollModel}
                                                 scrollContainer={scrollContainer}
                                                 range={range}/>
    const element: HTMLElement = (
        <div className={className}>
            {scrollContainer}
            {clipArea}
            {regionArea}
            <Scroller lifecycle={lifecycle} model={scrollModel} floating/>
        </div>
    )
    lifecycle.ownAll(
        AnimationFrame.add(() => {
            // The ResizeObserver only tracks the visible size changes, not off-screen content,
            // so we take a simple approach to catch all changes.
            scrollModel.visibleSize = scrollContainer.clientHeight
            scrollModel.contentSize = scrollContainer.scrollHeight
        }),
        scrollModel.subscribe(({contentSize}) => {
            element.style.setProperty("--rest-top", `${contentSize === 0 ? 0 : contentSize}px`)
            element.style.setProperty("--rest-height", `${element.clientHeight - contentSize}px`)
        }),
        Events.subscribe(element, "wheel", (event: WheelEvent) => scrollModel.position += event.deltaY, {passive: false}),
        scrollModel.subscribe(() => scrollContainer.scrollTop = scrollModel.position)
    )
    element.style.setProperty("--extra-space", `${ExtraSpace}px`)
    return element
}