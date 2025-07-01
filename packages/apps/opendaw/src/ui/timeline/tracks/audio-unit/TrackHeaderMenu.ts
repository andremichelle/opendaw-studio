import {MenuItem} from "@/ui/model/menu-item"
import {Procedure, UUID} from "lib-std"
import {Project} from "@/project/Project.ts"
import {AudioUnitBoxAdapter} from "studio-adapters"
import {TrackBoxAdapter} from "studio-adapters"
import {DebugMenus} from "@/ui/menu/debug"
import {DeviceAccepts} from "studio-adapters"
import {MidiImport} from "@/ui/timeline/MidiImport.ts"
import {TrackBox} from "studio-boxes"
import {TrackType} from "studio-adapters"
import {Modifier} from "@/ui/Modifier.ts"

export const installTrackHeaderMenu = (project: Project,
                                       audioUnitBoxAdapter: AudioUnitBoxAdapter,
                                       trackBoxAdapter: TrackBoxAdapter): Procedure<MenuItem> =>
    parent => {
        const inputAdapter = audioUnitBoxAdapter.input.getValue()
        if (inputAdapter.isEmpty()) {return parent}
        const accepts: DeviceAccepts = inputAdapter.unwrap().accepts
        const trackType = DeviceAccepts.toTrackType(accepts)
        const {editing, selection, midiDevices} = project
        return parent.addMenuItem(
            MenuItem.default({label: "Enabled", checked: trackBoxAdapter.enabled.getValue()})
                .setTriggerProcedure(() => editing.modify(() => trackBoxAdapter.enabled.toggle())),
            MenuItem.default({
                label: `New ${TrackType.toLabelString(trackType)} Track`,
                hidden: trackBoxAdapter.type === TrackType.Undefined
            }).setTriggerProcedure(() => editing.modify(() => {
                TrackBox.create(project.boxGraph, UUID.generate(), box => {
                    box.type.setValue(trackType)
                    box.tracks.refer(audioUnitBoxAdapter.box.tracks)
                    box.index.setValue(audioUnitBoxAdapter.tracks.values().length)
                    box.target.refer(audioUnitBoxAdapter.box)
                })
            })),
            MenuItem.default({label: "Move"})
                .setRuntimeChildrenProcedure(parent => parent.addMenuItem(
                    MenuItem.default({label: "Track 1 Up", selectable: trackBoxAdapter.indexField.getValue() > 0})
                        .setTriggerProcedure(() => editing.modify(() => audioUnitBoxAdapter.moveTrack(trackBoxAdapter, -1))),
                    MenuItem.default({
                        label: "Track 1 Down",
                        selectable: trackBoxAdapter.indexField.getValue() < audioUnitBoxAdapter.tracks.collection.size() - 1
                    }).setTriggerProcedure(() => editing.modify(() => audioUnitBoxAdapter.moveTrack(trackBoxAdapter, 1))),
                    MenuItem.default({
                        label: "AudioUnit 1 Up",
                        selectable: audioUnitBoxAdapter.indexField.getValue() > 0 && false
                    })
                        .setTriggerProcedure(() => editing.modify(() => audioUnitBoxAdapter.move(-1))),
                    MenuItem.default({
                        label: "AudioUnit 1 Down",
                        selectable: audioUnitBoxAdapter.indexField.getValue() < project.rootBoxAdapter.audioUnits.adapters()
                            .filter(adapter => !adapter.isOutput).length - 1 && false
                    }).setTriggerProcedure(() => editing.modify(() => audioUnitBoxAdapter.move(1)))
                )),
            MenuItem.default({label: "Select Clips", selectable: !trackBoxAdapter.clips.collection.isEmpty()})
                .setTriggerProcedure(() => trackBoxAdapter.clips.collection.adapters()
                    .forEach(clip => selection.select(clip.box))),
            MenuItem.default({label: "Select Regions", selectable: !trackBoxAdapter.regions.collection.isEmpty()})
                .setTriggerProcedure(() => trackBoxAdapter.regions.collection.asArray()
                    .forEach(region => selection.select(region.box))),
            MenuItem.default({
                label: "Import Midi...",
                selectable: inputAdapter.mapOr(x => x.accepts === "midi", false)
            }).setTriggerProcedure(() => MidiImport.toTracks(project, audioUnitBoxAdapter)),
            MenuItem.default({
                label: midiDevices.hasMidiConnection(audioUnitBoxAdapter.address) ? "Forget Midi" : "Learn Midi...",
                selectable: inputAdapter.mapOr(x => x.accepts === "midi", false)
            }).setTriggerProcedure(() => {
                if (midiDevices.hasMidiConnection(audioUnitBoxAdapter.address)) {
                    midiDevices.forgetMidiConnection(audioUnitBoxAdapter.address)
                } else {
                    midiDevices.learnMidiKeys(audioUnitBoxAdapter)
                }
            }),
            MenuItem.default({
                label: "Delete Track",
                selectable: !audioUnitBoxAdapter.isOutput,
                separatorBefore: true
            }).setTriggerProcedure(() => editing.modify(() => {
                if (audioUnitBoxAdapter.tracks.collection.size() === 1) {
                    Modifier.deleteAudioUnit(project, audioUnitBoxAdapter)
                } else {
                    audioUnitBoxAdapter.deleteTrack(trackBoxAdapter)
                }
            })),
            MenuItem.default({
                label: `Delete '${audioUnitBoxAdapter.input.label.unwrapOrElse("No Input")}'`,
                selectable: !audioUnitBoxAdapter.isOutput
            }).setTriggerProcedure(() => editing.modify(() =>
                Modifier.deleteAudioUnit(project, audioUnitBoxAdapter))),
            DebugMenus.debugBox(audioUnitBoxAdapter.box)
        )
    }