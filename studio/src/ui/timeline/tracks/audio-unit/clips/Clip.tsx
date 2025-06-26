import css from "./Clip.sass?inline"
import {asDefined, DefaultObservableValue, Lifecycle, Procedure, Terminator, UUID} from "std"
import {NoteClipBoxAdapter} from "@/audio-engine-shared/adapters/timeline/clip/NoteClipBoxAdapter.ts"
import {createElement} from "jsx"
import {CanvasPainter} from "@/ui/canvas/painter.ts"
import {createNoteClipPainter} from "@/ui/timeline/tracks/audio-unit/clips/painter/NoteClipPainter.ts"
import {AnyClipBoxAdapter} from "@/audio-engine-shared/adapters/UnionAdapterTypes.ts"
import {ValueClipBoxAdapter} from "@/audio-engine-shared/adapters/timeline/clip/ValueClipBoxAdapter.ts"
import {AudioClipBoxAdapter} from "@/audio-engine-shared/adapters/timeline/clip/AudioClipBoxAdapter.ts"
import {createAudioClipPainter} from "@/ui/timeline/tracks/audio-unit/clips/painter/AudioClipPainter.ts"
import {createValueClipPainter} from "@/ui/timeline/tracks/audio-unit/clips/painter/ValueClipPainter.ts"
import {Project} from "@/project/Project.ts"
import {ClipPlaybackButton} from "./ClipPlaybackButton"
import {ppqn} from "dsp"
import {ClipNotification} from "@/audio-engine-shared/ClipNotifications.ts"
import {Events, Html} from "dom"

const className = Html.adoptStyleSheet(css, "Clip")

type Construct = {
    lifecycle: Lifecycle
    project: Project
    adapter: AnyClipBoxAdapter
    gridColumn: string
}

export enum ClipState {Idle, Waiting, Playing}

export const Clip = ({lifecycle, project, adapter, gridColumn}: Construct) => {
    const canvas: HTMLCanvasElement = (<canvas/>)
    const progress: HTMLElement = (<div className="progress"/>)
    const state = new DefaultObservableValue(ClipState.Idle)
    const updateProgress = (position: ppqn) => element.style.setProperty("--progress", String(position / adapter.duration * 360))
    const painter = lifecycle.own(new CanvasPainter(canvas, asDefined(adapter.accept({
        visitAudioClipBoxAdapter: (adapter: AudioClipBoxAdapter): Procedure<CanvasPainter> => createAudioClipPainter(adapter),
        visitNoteClipBoxAdapter: (adapter: NoteClipBoxAdapter): Procedure<CanvasPainter> => createNoteClipPainter(adapter),
        visitValueClipBoxAdapter: (adapter: ValueClipBoxAdapter): Procedure<CanvasPainter> => createValueClipPainter(adapter)
    }), `Could not find paintProcedure for ${adapter}`)))
    const label: HTMLElement = <span className="label"/>
    const element: HTMLElement = (
        <div className={className} style={{gridColumn}}>
            {label}
            <div className="content">
                {progress}
                {canvas}
                <ClipPlaybackButton lifecycle={lifecycle} project={project} adapter={adapter} state={state}/>
            </div>
        </div>
    )
    element.style.setProperty("--hue", String(adapter.hue))
    element.classList.toggle("selected", adapter.isSelected)
    element.classList.toggle("mirrored", adapter.isMirrowed)
    element.classList.toggle("muted", adapter.box.mute.getValue())
    label.textContent = adapter.label.length === 0 ? "◻" : adapter.label
    const timelineEditing = project.userEditingManager.timeline
    lifecycle.ownAll(
        state.catchupAndSubscribe(owner => {
            element.classList.remove("waiting", "playing")
            switch (owner.getValue()) {
                case ClipState.Idle:
                    break
                case ClipState.Waiting:
                    element.classList.add("waiting")
                    break
                case ClipState.Playing:
                    element.classList.add("playing")
                    break
            }
        }),
        Html.watchResize(canvas, painter.requestUpdate),
        Events.subscribe(element, "dblclick", () => timelineEditing.edit(adapter.box)),
        timelineEditing.catchupAndSubscribe(() => element.classList.toggle("edit-mode", timelineEditing.isEditing(adapter.box))),
        adapter.subscribeChange(() => {
            label.textContent = adapter.label.length === 0 ? "◻" : adapter.label
            element.style.setProperty("--hue", String(adapter.hue))
            element.classList.toggle("mirrored", adapter.isMirrowed)
            element.classList.toggle("muted", adapter.box.mute.getValue())
            painter.requestUpdate()
        }),
        adapter.catchupAndSubscribeSelected(owner => element.classList.toggle("selected", owner.getValue()))
    )
    const running = lifecycle.own(new Terminator())
    lifecycle.own(project.service.engine.subscribeClipNotification((notification: ClipNotification) => {
        if (notification.type === "sequencing") {
            const {started, stopped, obsolete} = notification.changes
            if (started.some(uuid => UUID.equals(uuid, adapter.uuid))) {
                running.own(project.position.subscribe(owner => updateProgress(owner.getValue())))
                state.setValue(ClipState.Playing)
            } else if (
                stopped.some(uuid => UUID.equals(uuid, adapter.uuid)) || obsolete.some(uuid => UUID.equals(uuid, adapter.uuid))) {
                state.setValue(ClipState.Idle)
                running.terminate()
                updateProgress(0.0)
            }
        } else if (notification.type === "waiting") {
            if (notification.clips.some(uuid => UUID.equals(uuid, adapter.uuid))) {
                state.setValue(ClipState.Waiting)
            }
        }
    }))
    return element
}