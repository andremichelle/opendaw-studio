import css from "./ModularDeviceEditor.sass?inline"
import {createElement} from "lib-jsx"
import {DeviceEditor} from "@/ui/devices/DeviceEditor.tsx"
import {assert, Lifecycle, SortedSet, Terminable, Terminator, UUID} from "lib-std"
import {MenuItems} from "@/ui/devices/menu-items.ts"
import {Project} from "@/project/Project.ts"
import {ModularDeviceBoxAdapter} from "studio-shared"
import {MenuItem} from "@/ui/model/menu-item.ts"
import {BoxVisitor, DeviceInterfaceKnobBox} from "studio-boxes"
import {Box, PointerField} from "lib-box"
import {ContextMenu} from "@/ui/ContextMenu.ts"
import {DeviceInterfaceKnobAdapter} from "studio-shared"
import {ControlBuilder} from "@/ui/devices/ControlBuilder.tsx"
import {DevicePeakMeter} from "@/ui/devices/panel/DevicePeakMeter.tsx"
import {Html} from "lib-dom"
import {Effects} from "@/service/Effects"
import {DeviceHost} from "studio-shared"

const className = Html.adoptStyleSheet(css, "ModularDeviceEditor")

type Construct = {
    lifecycle: Lifecycle
    project: Project
    adapter: ModularDeviceBoxAdapter
    deviceHost: DeviceHost
}

type UserInterfaceElement = {
    uuid: UUID.Format
    element: Element
    terminable: Terminable
}

export const ModularDeviceEditor = ({lifecycle, project, adapter, deviceHost}: Construct) => {
    const userInterface: HTMLElement = <div className={className}/>
    const elements: SortedSet<UUID.Format, UserInterfaceElement> = UUID.newSet(entry => entry.uuid)
    const addElement = (box: Box): void => {
        const sucess = box.accept<BoxVisitor<true>>({
            visitDeviceInterfaceKnobBox: (box: DeviceInterfaceKnobBox): true => {
                const runtime = new Terminator()
                const {parameterAdapter} = project.boxAdapters.adapterFor(box, DeviceInterfaceKnobAdapter)
                const element: HTMLElement = ControlBuilder.createKnob({
                    lifecycle: lifecycle,
                    editing: project.editing,
                    midiDevices: project.midiDevices,
                    adapter: adapter,
                    parameter: parameterAdapter,
                    anchor: box.anchor.getValue()
                })
                runtime.own(ContextMenu.subscribe(element, collector =>
                    collector.addItems(MenuItem.default({label: "Remove"})
                        .setTriggerProcedure(() => project.editing.modify(() => box.delete())))))
                userInterface.appendChild(element)
                runtime.own({terminate: () => element.remove()})
                elements.add({
                    uuid: box.address.uuid,
                    element,
                    terminable: runtime
                })
                return true
            }
        })
        assert(sucess === true, `Could not resolve ${box}`)
    }
    const removeElement = (box: Box): void => {
        const sucess = box.accept<BoxVisitor<true>>({
            visitDeviceInterfaceKnobBox: (box: DeviceInterfaceKnobBox): true => {
                elements.removeByKey(box.address.uuid).terminable.terminate()
                return true
            }
        })
        assert(sucess === true, `Could not resolve ${box}`)
    }
    adapter.box.userInterface.elements.pointerHub.incoming().forEach(pointer => addElement(pointer.box))
    lifecycle.own(adapter.box.userInterface.elements.pointerHub.subscribeTransactual({
        onAdd: (pointer: PointerField) => addElement(pointer.box),
        onRemove: (pointer: PointerField) => removeElement(pointer.box)
    }))
    lifecycle.own({terminate: () => elements.forEach(entry => entry.terminable.terminate())})
    return (
        <DeviceEditor lifecycle={lifecycle}
                      project={project}
                      adapter={adapter}
                      populateMenu={parent => {
                          parent.addMenuItem(MenuItem.default({
                              label: "Edit...",
                              selectable: !project.userEditingManager.modularSystem.isEditing(adapter.modular().box.editing) ||
                                  project.service.layout.screen.getValue() !== "modular"
                          })
                              .setTriggerProcedure(() => {
                                  project.userEditingManager.modularSystem.edit(adapter.modular().box.editing)
                                  project.service.switchScreen("modular")
                              }))
                          MenuItems.forEffectDevice(parent, project, deviceHost, adapter)
                      }}
                      populateControls={() => userInterface}
                      populateMeter={() => (
                          <DevicePeakMeter lifecycle={lifecycle}
                                           receiver={project.liveStreamReceiver}
                                           address={adapter.address}/>
                      )}
                      icon={Effects.AudioNamed.Modular.icon}>
        </DeviceEditor>
    )
}