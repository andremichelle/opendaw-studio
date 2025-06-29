import {DeviceHost, Devices, EffectDeviceBoxAdapter} from "studio-shared"
import {MenuItem} from "@/ui/model/menu-item.ts"
import {Effects} from "@/service/Effects.ts"
import {Editing, PrimitiveField, PrimitiveValues, StringField} from "opendaw-box"
import {Project} from "@/project/Project.ts"
import {Modifier} from "@/ui/Modifier.ts"
import {EmptyExec, panic} from "opendaw-std"
import {Surface} from "@/ui/surface/Surface"
import {FloatingTextInput} from "@/ui/components/FloatingTextInput"

export namespace MenuItems {
    export const forAudioUnitInput = (parent: MenuItem, project: Project, deviceHost: DeviceHost): void => {
        const audioUnit = deviceHost.audioUnitBoxAdapter()
        const canProcessMidi = deviceHost.inputAdapter.mapOr(input => input.accepts === "midi", false)
        parent.addMenuItem(
            MenuItem.default({
                label: `Delete '${deviceHost.label}'`,
                hidden: audioUnit.isOutput
            }).setTriggerProcedure(() => project.editing.modify(() =>
                deviceHost.box.delete())),
            MenuItem.default({
                label: "Minimized",
                checked: deviceHost.minimizedField.getValue()
            }).setTriggerProcedure(() => project.editing.modify(() => deviceHost.minimizedField.toggle())),
            createMenuItemToRenameDevice(project.editing, audioUnit.inputAdapter.unwrap().labelField),
            MenuItem.default({label: "Add Midi-Effect", separatorBefore: true, selectable: canProcessMidi})
                .setRuntimeChildrenProcedure(parent => parent.addMenuItem(...Effects.MidiList
                    .map(entry => MenuItem.default({
                        label: entry.name,
                        separatorBefore: entry.separatorBefore
                    }).setTriggerProcedure(() => Modifier.createEffect(project, deviceHost, entry, 0)))
                )),
            MenuItem.default({label: "Add Audio Effect"})
                .setRuntimeChildrenProcedure(parent => parent.addMenuItem(...Effects.AudioList
                    .map(entry => MenuItem.default({
                        label: entry.name,
                        separatorBefore: entry.separatorBefore
                    }).setTriggerProcedure(() => Modifier.createEffect(project, deviceHost, entry, 0)))
                ))
        )
    }

    export const createForValue = <V extends PrimitiveValues>(editing: Editing,
                                                              label: string,
                                                              primitive: PrimitiveField<V, any>,
                                                              value: V) =>
        MenuItem.default({label, checked: primitive.getValue() === value})
            .setTriggerProcedure(() => editing.modify(() => primitive.setValue(value)))

    export const forEffectDevice = (parent: MenuItem, project: Project, host: DeviceHost, device: EffectDeviceBoxAdapter): void => {
        parent.addMenuItem(
            createMenuItemToToggleEnabled(project.editing, device),
            createMenuItemToToggleMinimized(project.editing, device),
            createMenuItemToDeleteDevice(project.editing, device),
            createMenuItemToRenameDevice(project.editing, device.labelField),
            createMenuItemToCreateEffect(project, host, device),
            createMenuItemToMoveEffect(project, host, device)
        )
    }

    const createMenuItemToRenameDevice = (editing: Editing, labelField: StringField) =>
        MenuItem.default({label: "Rename..."}).setTriggerProcedure(() => {
            const resolvers = Promise.withResolvers<string>()
            const surface = Surface.get()
            surface.flyout.appendChild(FloatingTextInput({
                position: surface.pointer,
                value: labelField.getValue(),
                resolvers
            }))
            resolvers.promise.then(newName => editing.modify(() => labelField.setValue(newName)), EmptyExec)
        })

    const createMenuItemToToggleEnabled = (editing: Editing, {enabledField}: EffectDeviceBoxAdapter) =>
        MenuItem.default({label: "Enabled", checked: enabledField.getValue()})
            .setTriggerProcedure(() => editing.modify(() =>
                enabledField.setValue(!enabledField.getValue())))

    const createMenuItemToToggleMinimized = (editing: Editing, {minimizedField}: EffectDeviceBoxAdapter) =>
        MenuItem.default({label: "Minimized", checked: minimizedField.getValue()})
            .setTriggerProcedure(() => editing.modify(() => {
                minimizedField.setValue(!minimizedField.getValue())
            }))

    const createMenuItemToDeleteDevice = (editing: Editing, ...devices: ReadonlyArray<EffectDeviceBoxAdapter>) => {
        const label = `Delete '${devices.map(device => device.labelField.getValue()).join(", ")}'`
        return MenuItem.default({label})
            .setTriggerProcedure(() => editing.modify(() => Devices.deleteEffectDevices(devices)))
    }

    const createMenuItemToCreateEffect = (project: Project, host: DeviceHost, adapter: EffectDeviceBoxAdapter) =>
        adapter.accepts === "audio"
            ? MenuItem.default({label: "Add Audio Effect", separatorBefore: true})
                .setRuntimeChildrenProcedure(parent => parent
                    .addMenuItem(...Effects.AudioList
                        .map(entry => MenuItem.default({label: entry.name, separatorBefore: entry.separatorBefore})
                            .setTriggerProcedure(() => Modifier.createEffect(project, host, entry, adapter.indexField.getValue() + 1)))
                    ))
            : adapter.accepts === "midi"
                ? MenuItem.default({label: "Add Midi Effect", separatorBefore: true})
                    .setRuntimeChildrenProcedure(parent => parent
                        .addMenuItem(...Effects.MidiList
                            .map(entry => MenuItem.default({label: entry.name, separatorBefore: entry.separatorBefore})
                                .setTriggerProcedure(() => Modifier.createEffect(project, host, entry, adapter.indexField.getValue() + 1)))
                        )) : panic(`Unknown accepts value: ${adapter.accepts}`)

    const createMenuItemToMoveEffect = (project: Project, host: DeviceHost, adapter: EffectDeviceBoxAdapter) =>
        MenuItem.default({label: "Move Effect"})
            .setRuntimeChildrenProcedure(parent => {
                    const adapters: ReadonlyArray<EffectDeviceBoxAdapter> =
                        adapter.accepts === "audio"
                            ? host.audioEffects.adapters()
                            : adapter.accepts === "midi"
                                ? host.midiEffects.adapters()
                                : panic(`Unknown accept type: ${adapter.accepts}`)
                    const index = adapter.indexField.getValue()
                    return parent.addMenuItem(
                        MenuItem.default({
                            label: "Left",
                            selectable: index > 0
                        }).setTriggerProcedure(() => project.editing.modify(() => {
                            adapter.indexField.setValue(index - 1)
                            adapters[index - 1].indexField.setValue(index)
                        })),
                        MenuItem.default({
                            label: "Right",
                            selectable: index < adapters.length - 1
                        }).setTriggerProcedure(() => project.editing.modify(() => {
                            adapter.indexField.setValue(index + 1)
                            adapters[index + 1].indexField.setValue(index)
                        }))
                    )
                }
            )
}
