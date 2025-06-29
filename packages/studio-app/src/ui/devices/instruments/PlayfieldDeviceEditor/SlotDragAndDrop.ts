import {asInstanceOf, int, ObservableValue, Option, Terminable, UUID} from "opendaw-std"
import {DragAndDrop} from "@/ui/DragAndDrop"
import {AnyDragData} from "@/ui/AnyDragData"
import {PlayfieldSampleBox} from "studio-boxes"
import {Keyboard} from "opendaw-dom"
import {Project} from "@/project/Project"
import {
    PlayfieldSampleBoxAdapter
} from "studio-shared"

export namespace SlotDragAndDrop {
    type Construct = {
        element: HTMLElement
        project: Project
        sample: Option<PlayfieldSampleBoxAdapter>
        octave: ObservableValue<int>
        semitone: int
    }

    export const install = ({element, project, sample, octave, semitone}: Construct): Terminable => {
        const uuid = sample.mapOr(({address}) => address.toString(), "")
        return Terminable.many(
            DragAndDrop.installSource(element, () => ({
                type: "playfield-slot",
                index: octave.getValue() * 12 + semitone,
                uuid
            })),
            DragAndDrop.installTarget(element, {
                drag: (_event: DragEvent, dragData: AnyDragData): boolean => {
                    if (dragData.type !== "playfield-slot") {return false}
                    return uuid !== dragData.uuid
                },
                drop: (event: DragEvent, dragData: AnyDragData): void => {
                    if (dragData.type !== "playfield-slot") {return}
                    if (uuid === dragData.uuid) {return}
                    const {editing, boxGraph, boxAdapters} = project
                    const copyMode = Keyboard.isCopyKey(event)
                    const resolveBox = (uuid: string): Option<PlayfieldSampleBox> => uuid === ""
                        ? Option.None
                        : boxGraph
                            .findBox(UUID.parse(uuid))
                            .assert(() => `Could not find box for ${uuid}`)
                            .map(box => asInstanceOf(box, PlayfieldSampleBox))
                    const target = resolveBox(uuid)
                    const source = resolveBox(dragData.uuid)
                    const newIndex = octave.getValue() * 12 + semitone
                    if (target.isEmpty()) {
                        if (source.nonEmpty()) {
                            if (copyMode) {
                                editing.modify(() => boxAdapters.adapterFor(source.unwrap(), PlayfieldSampleBoxAdapter)
                                    .copyToIndex(newIndex))
                            } else {
                                editing.modify(() => source.unwrap().index.setValue(newIndex))
                            }
                        } else {
                            // else: move or copy empty slot to empty slot has no effect
                        }
                    } else {
                        if (source.isEmpty()) {
                            if (copyMode) {
                                editing.modify(() => target.unwrap().delete())
                            } else {
                                editing.modify(() => target.unwrap().index.setValue(dragData.index))
                            }
                        } else {
                            editing.modify(() => {
                                if (copyMode) {
                                    target.unwrap().delete()
                                    boxAdapters.adapterFor(source.unwrap(), PlayfieldSampleBoxAdapter)
                                        .copyToIndex(newIndex)
                                } else {
                                    source.unwrap().index.setValue(newIndex)
                                    target.unwrap().index.setValue(dragData.index)
                                }
                            })
                        }
                    }
                },
                enter: (allowDrop: boolean): void => {
                    if (allowDrop) {element.classList.add("swap")}
                },
                leave: (): void => element.classList.remove("swap")
            })
        )
    }
}