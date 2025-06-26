import {asDefined, panic, Terminable} from "std"
import {DragAndDrop} from "@/ui/DragAndDrop"
import {AnyDragData} from "@/ui/AnyDragData"
import {Instruments} from "@/service/Instruments"
import {SortedBoxAdapterCollection} from "@/audio-engine-shared/adapters/SortedBoxAdapterCollection"
import {AudioEffectDeviceBoxAdapter, Devices, MidiEffectDeviceAdapter} from "@/audio-engine-shared/adapters/devices"
import {Effects} from "@/service/Effects"
import {Project} from "@/project/Project"
import {InsertMarker} from "@/ui/components/InsertMarker"
import {Pointers} from "@core/data/pointers"

export namespace DevicePanelDragAndDrop {
    export const install = (project: Project,
                            editors: HTMLElement,
                            midiEffectsContainer: HTMLElement,
                            instrumentContainer: HTMLElement,
                            audioEffectsContainer: HTMLElement): Terminable => {
        const insertMarker: HTMLElement = InsertMarker()
        const {editing, boxGraph, boxAdapters, userInterfaceBox} = project
        return DragAndDrop.installTarget(editors, {
            drag: (event: DragEvent, dragData: AnyDragData): boolean => {
                instrumentContainer.style.opacity = "1.0"
                const editingDeviceChain = userInterfaceBox.editingDeviceChain.targetVertex
                if (editingDeviceChain.isEmpty()) {return false}
                const deviceHost = boxAdapters.adapterFor(editingDeviceChain.unwrap().box, Devices.isHost)
                const {type} = dragData
                let container: HTMLElement
                if (type === "audio-effect") {
                    container = audioEffectsContainer
                } else if (type === "midi-effect") {
                    if (deviceHost.inputAdapter.mapOr(input => input.accepts !== "midi", true)) {return false}
                    container = midiEffectsContainer
                } else if (type === "instrument" && deviceHost.isAudioUnit) {
                    instrumentContainer.style.opacity = "0.5"
                    return true
                } else {
                    return false
                }
                const [index, successor] = DragAndDrop.findInsertLocation(event, container)
                if (dragData.start_index === null) {
                    container.insertBefore(insertMarker, successor)
                } else {
                    const delta = index - dragData.start_index
                    if (delta < 0 || delta > 1) {
                        container.insertBefore(insertMarker, successor)
                    } else if (insertMarker.isConnected) {insertMarker.remove()}
                }
                return true
            },
            drop: (event: DragEvent, dragData: AnyDragData): void => {
                instrumentContainer.style.opacity = "1.0"
                if (insertMarker.isConnected) {insertMarker.remove()}
                const {type} = dragData
                if (type !== "midi-effect" && type !== "audio-effect" && type !== "instrument") {return}
                const editingDeviceChain = userInterfaceBox.editingDeviceChain.targetVertex
                if (editingDeviceChain.isEmpty()) {return}
                const deviceHost = boxAdapters.adapterFor(editingDeviceChain.unwrap().box, Devices.isHost)
                if (type === "instrument") {
                    editing.modify(() => {
                        deviceHost.inputField.pointerHub.incoming().forEach(pointer => pointer.box.delete())
                        const {
                            createDevice,
                            icon,
                            defaultName
                        } = asDefined(Instruments.Named[dragData.device], `Unknown device: '${dragData.device}'`)
                        createDevice(boxGraph, deviceHost, defaultName, icon)
                    })
                    return
                }
                let container: HTMLElement
                let collection: SortedBoxAdapterCollection<MidiEffectDeviceAdapter | AudioEffectDeviceBoxAdapter, Pointers.MidiEffectHost | Pointers.AudioEffectHost>
                let field
                if (type === "audio-effect") {
                    container = audioEffectsContainer
                    collection = deviceHost.audioEffects
                    field = deviceHost.audioEffects.field()
                } else if (type === "midi-effect") {
                    container = midiEffectsContainer
                    collection = deviceHost.midiEffects
                    field = deviceHost.midiEffects.field()
                } else {
                    return panic(`Unknown type: ${type}`)
                }
                const [index] = DragAndDrop.findInsertLocation(event, container)
                if (dragData.start_index === null) {
                    editing.modify(() => {
                        Effects.MergedNamed[dragData.device].create(project, field, index)
                        const adapters = collection.adapters()
                        for (let i = index; i < adapters.length; i++) {
                            adapters[i].indexField.setValue(i + 1)
                        }
                    })
                } else {
                    const delta = index - dragData.start_index
                    if (delta < 0 || delta > 1) { // if delta is zero or one it has no effect on the order
                        editing.modify(() => collection.moveIndex(dragData.start_index, delta))
                    }
                }
            },
            enter: () => {},
            leave: () => {
                instrumentContainer.style.opacity = "1.0"
                if (insertMarker.isConnected) {insertMarker.remove()}
            }
        })
    }
}