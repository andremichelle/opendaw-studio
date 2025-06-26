import {ContextMenu} from "@/ui/ContextMenu.ts"
import {MenuItem} from "@/ui/model/menu-item.ts"
import {ElementCapturing} from "@/ui/canvas/capturing.ts"
import {AnyClipBoxAdapter} from "@core/shared/UnionAdapterTypes.ts"
import {Project} from "@/project/Project.ts"
import {EmptyExec, Procedure, Selection, UUID} from "std"
import {Surface} from "@/ui/surface/Surface.tsx"
import {NameValidator} from "@/ui/validator/name.ts"
import {ClipCaptureTarget} from "@/ui/timeline/tracks/audio-unit/clips/ClipCapturing.ts"
import {DebugMenus} from "@/ui/menu/debug"
import {exportNotesToMidiFile} from "@/ui/timeline/editors/notes/NoteUtils"
import {AudioRegionBox, NoteRegionBox, ValueRegionBox} from "@core/data/boxes"
import {ColorMenu} from "@/ui/timeline/ColorMenu"

type Creation = {
    element: HTMLElement
    project: Project
    capturing: ElementCapturing<ClipCaptureTarget>
    selection: Selection<AnyClipBoxAdapter>
}

export const installClipContextMenu = ({element, project, selection, capturing}: Creation) =>
    ContextMenu.subscribe(element, collector => {
        const client = collector.client
        const target = capturing.captureEvent(client)
        if (target === null) {
            // TODO Create clips
        } else if (target.type === "clip") {
            const {clip} = target
            if (!selection.isSelected(clip)) {
                selection.deselectAll()
                selection.select(clip)
            }
            const modify = <T extends AnyClipBoxAdapter>(procedure: Procedure<T>) =>
                project.editing.modify(() => selection.selected().forEach(adapter => procedure(adapter as T)))
            collector.addItems(
                MenuItem.default({label: "Delete"})
                    .setTriggerProcedure(() => project.editing.modify(() =>
                        selection.selected().forEach(clip => clip.box.delete()))),
                MenuItem.default({label: "Rename"})
                    .setTriggerProcedure(() => Surface.get(element).requestFloatingTextInput(client, clip.label)
                        .then(value => {
                            NameValidator.validate(value, {
                                success: name => project.editing.modify(() => selection.selected()
                                    .forEach(adapter => adapter.box.label.setValue(name)))
                            })
                        }, EmptyExec)),
                MenuItem.default({label: "Mute", checked: clip.box.mute.getValue()})
                    .setTriggerProcedure(() => {
                        const newValue = !clip.box.mute.getValue()
                        modify(({box: {mute}}) => mute.setValue(newValue))
                    }),
                ColorMenu.createItem(hue => modify(adapter => adapter.box.hue.setValue(hue))),
                MenuItem.default({label: "Consolidate", selectable: clip.isMirrowed})
                    .setTriggerProcedure(() => project.editing.modify(() =>
                        selection.selected().forEach(clip => clip.consolidate()))),
                MenuItem.default({label: "Playback", separatorBefore: true})
                    .setRuntimeChildrenProcedure(parent => parent.addMenuItem(
                        MenuItem.default({label: "Loop", checked: clip.box.playback.loop.getValue()})
                            .setTriggerProcedure(() => {
                                const newValue = !clip.box.playback.loop.getValue()
                                modify(({box: {playback: {loop}}}) => loop.setValue(newValue))
                            })
                    )),
                MenuItem.default({
                    label: "Convert to Region"
                }).setTriggerProcedure(() => {
                    const trackBoxAdapter = clip.trackBoxAdapter.unwrap()
                    const regions = trackBoxAdapter.regions
                    const lastRegion = regions.collection.lowerEqual(Number.POSITIVE_INFINITY)
                    const position = lastRegion?.complete ?? 0
                    project.editing.modify(() => {
                        if (clip.type === "note-clip") {
                            NoteRegionBox.create(clip.box.graph, UUID.generate(), box => {
                                box.position.setValue(position)
                                box.duration.setValue(clip.duration)
                                box.loopOffset.setValue(0)
                                box.loopDuration.setValue(clip.duration)
                                box.hue.setValue(clip.hue)
                                box.label.setValue(clip.label)
                                box.mute.setValue(clip.mute)
                                box.events.refer(clip.box.events.targetVertex.unwrap())
                                box.regions.refer(trackBoxAdapter.box.regions)
                            })
                        } else if (clip.type === "audio-clip") {
                            AudioRegionBox.create(clip.box.graph, UUID.generate(), box => {
                                box.position.setValue(position)
                                box.duration.setValue(clip.duration)
                                box.loopOffset.setValue(0)
                                box.loopDuration.setValue(clip.duration)
                                box.hue.setValue(clip.hue)
                                box.label.setValue(clip.label)
                                box.mute.setValue(clip.mute)
                                box.file.refer(clip.box.file.targetVertex.unwrap())
                                box.regions.refer(trackBoxAdapter.box.regions)
                            })
                        } else if (clip.type === "value-clip") {
                            ValueRegionBox.create(clip.box.graph, UUID.generate(), box => {
                                box.position.setValue(position)
                                box.duration.setValue(clip.duration)
                                box.loopOffset.setValue(0)
                                box.loopDuration.setValue(clip.duration)
                                box.hue.setValue(clip.hue)
                                box.label.setValue(clip.label)
                                box.mute.setValue(clip.mute)
                                box.events.refer(clip.box.events.targetVertex.unwrap())
                                box.regions.refer(trackBoxAdapter.box.regions)
                            })
                        }
                    })
                }),
                MenuItem.default({
                    label: "Export to Midi-File",
                    hidden: clip.type !== "note-clip"
                }).setTriggerProcedure(() => {
                    if (clip.type === "note-clip") {
                        const label = clip.label
                        exportNotesToMidiFile(clip.optCollection.unwrap(), `${label.length === 0 ? "clip" : label}.mid`)
                    }
                }),
                DebugMenus.debugBox(clip.box))
        }
    })