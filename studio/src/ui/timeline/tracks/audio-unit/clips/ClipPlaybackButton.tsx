import css from "./ClipPlaybackButton.sass?inline"
import {DefaultObservableValue, Lifecycle} from "std"
import {AnyClipBoxAdapter} from "@core/shared/UnionAdapterTypes.ts"
import {IconSymbol} from "@core/IconSymbol.ts"
import {Colors} from "@/ui/Colors"
import {IconCartridge} from "@/ui/components/Icon"
import {Project} from "@/project/Project"
import {createElement} from "jsx"
import {ClipState} from "./Clip"
import {Html} from "dom"

const className = Html.adoptStyleSheet(css, "ClipPlaybackButton")

type Construct = {
    lifecycle: Lifecycle
    project: Project
    adapter: AnyClipBoxAdapter
    state: DefaultObservableValue<ClipState>
}

export const ClipPlaybackButton = ({lifecycle, project, adapter, state}: Construct) => {
    const iconModel = new DefaultObservableValue(IconSymbol.Play)
    const element: HTMLElement = (
        <div className={className}
             ondblclick={event => event.stopPropagation()}
             onclick={() => {
                 if (state.getValue() !== ClipState.Idle) {
                     project.service.engine.scheduleClipStop(adapter.trackBoxAdapter.unwrap().uuid)
                 } else if (!adapter.box.mute.getValue()) {
                     project.service.engine.scheduleClipPlay(adapter.uuid)
                 }
             }}>
            <IconCartridge lifecycle={lifecycle}
                           symbol={iconModel}
                           style={{color: Colors.gray}}/>
        </div>
    )
    lifecycle.own(state.catchupAndSubscribe(owner => {
        switch (owner.getValue()) {
            case ClipState.Idle:
                iconModel.setValue(IconSymbol.Play)
                break
            case ClipState.Waiting:
                break
            case ClipState.Playing:
                iconModel.setValue(IconSymbol.Stop)
                break
        }
    }))
    return element
}