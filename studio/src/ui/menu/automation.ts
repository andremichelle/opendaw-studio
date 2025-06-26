import {ContextMenu} from "@/ui/ContextMenu.ts"
import {MenuItem} from "@/ui/model/menu-item.ts"
import {TrackType} from "@core/shared/adapters/timeline/TrackType.ts"
import {Editing, PrimitiveValues} from "box"
import {AudioUnitTracks} from "@core/shared/adapters/audio-unit/AudioUnitTracks.ts"
import {MidiDevices} from "@/midi/devices/MidiDevices"
import {AutomatableParameterFieldAdapter} from "@core/shared/AutomatableParameterFieldAdapter.ts"

export const attachParameterContextMenu = <T extends PrimitiveValues>(editing: Editing,
                                                                      midiDevices: MidiDevices,
                                                                      tracks: AudioUnitTracks,
                                                                      parameter: AutomatableParameterFieldAdapter<T>,
                                                                      element: Element) =>
    ContextMenu.subscribe(element, collector => {
        const field = parameter.field
        const automation = tracks.controls(field)
        collector.addItems(
            automation.isEmpty()
                ? MenuItem.default({label: "Create Automation"})
                    .setTriggerProcedure(() => editing.modify(() =>
                        tracks.create(TrackType.Value, field)))
                : MenuItem.default({label: "Remove Automation"})
                    .setTriggerProcedure(() => editing.modify(() =>
                        tracks.delete(automation.unwrap()))),
            MenuItem.default({
                label: midiDevices.hasMidiConnection(field.address)
                    ? "Forget Midi"
                    : "Learn Midi Control..."
            }).setTriggerProcedure(() => {
                if (midiDevices.hasMidiConnection(field.address)) {
                    midiDevices.forgetMidiConnection(field.address)
                } else {
                    midiDevices.learnMidiControls(field).then()
                }
            }),
            MenuItem.default({label: "Reset Value", checked: field.getValue() === field.initValue})
                .setTriggerProcedure(() => editing.modify(() => parameter.reset()))
        )
    })