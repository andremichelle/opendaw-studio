import css from "./TrackHeader.sass?inline"
import {Lifecycle} from "lib-std"
import {createElement, Group, Inject, replaceChildren} from "lib-jsx"
import {Icon} from "@/ui/components/Icon.tsx"
import {Colors} from "@/ui/Colors.ts"
import {MenuButton} from "@/ui/components/MenuButton.tsx"
import {MenuItem} from "@/ui/model/menu-item.ts"
import {AudioUnitBoxAdapter} from "studio-shared"
import {AudioUnitChannelControls} from "@/ui/timeline/tracks/audio-unit/AudioUnitChannelControls.tsx"
import {Project} from "@/project/Project.ts"
import {TrackBoxAdapter} from "studio-shared"
import {installTrackHeaderMenu} from "@/ui/timeline/tracks/audio-unit/TrackHeaderMenu.ts"
import {TrackType} from "studio-shared"
import {IconSymbol} from "studio-shared"
import {ColorCodes} from "@/ui/mixer/ColorCodes"
import {Events, Html, Keyboard} from "lib-dom"
import {Modifier} from "@/ui/Modifier"

const className = Html.adoptStyleSheet(css, "TrackHeader")

type Construct = {
    lifecycle: Lifecycle
    project: Project
    trackBoxAdapter: TrackBoxAdapter
    audioUnitBoxAdapter: AudioUnitBoxAdapter
}

export const TrackHeader = ({lifecycle, project, trackBoxAdapter, audioUnitBoxAdapter}: Construct) => {
    const nameLabel = Inject.value("Untitled")
    const channelStrip: HTMLElement = <Group/>
    lifecycle.ownAll(
        audioUnitBoxAdapter.input.catchupAndSubscribeLabelChange(option => nameLabel.value = option.unwrapOrElse("No Input")),
        trackBoxAdapter.indexField.catchupAndSubscribe(owner => {
            Html.empty(channelStrip)
            if (owner.getValue() === 0) {
                replaceChildren(channelStrip, (
                    <AudioUnitChannelControls lifecycle={lifecycle}
                                              editing={project.editing}
                                              midiDevices={project.midiDevices}
                                              adapter={audioUnitBoxAdapter}/>
                ))
            } else {
                replaceChildren(channelStrip, <div/>)
            }
        }),
        trackBoxAdapter.catchupAndSubscribePath(option =>
            nameLabel.value = option.unwrapOrElse(["", "Unassigned track"]).join(" "))
    )

    const color = ColorCodes.forAudioType(audioUnitBoxAdapter.type)
    const element: HTMLElement = (
        <div className={Html.buildClassList(className, "is-primary")} tabindex={-1}>
            <Icon symbol={TrackType.toIconSymbol(trackBoxAdapter.type)} style={{color}}/>
            <div className="info">
                <h5 style={{color: Colors.dark}}>{nameLabel}</h5>
            </div>
            {channelStrip}
            <MenuButton root={MenuItem.root()
                .setRuntimeChildrenProcedure(installTrackHeaderMenu(project, audioUnitBoxAdapter, trackBoxAdapter))}
                        style={{minWidth: "0", justifySelf: "end"}}
                        appearance={{color: Colors.shadow, activeColor: Colors.cream}}>
                <Icon symbol={IconSymbol.Menu} style={{fontSize: "0.75em"}}/>
            </MenuButton>
        </div>
    )
    const audioUnitEditing = project.userEditingManager.audioUnit
    lifecycle.ownAll(
        Events.subscribe(element, "pointerdown", () => {
            if (!audioUnitEditing.isEditing(audioUnitBoxAdapter.box.editing)) {
                audioUnitEditing.edit(audioUnitBoxAdapter.box.editing)
            }
        }),
        Events.subscribe(element, "keydown", (event) => {
            if (!Keyboard.GlobalShortcut.isDelete(event)) {return}
            project.editing.modify(() => {
                if (audioUnitBoxAdapter.tracks.collection.size() === 1) {
                    Modifier.deleteAudioUnit(project, audioUnitBoxAdapter)
                } else {
                    audioUnitBoxAdapter.deleteTrack(trackBoxAdapter)
                }
            })
        })
    )
    return element
}