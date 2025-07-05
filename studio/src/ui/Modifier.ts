import {assert, int, Option, panic, UUID} from "std"
import {Field} from "box"
import {Project} from "@/project/Project.ts"
import {
    AudioBusBox,
    AudioUnitBox,
    NoteClipBox,
    NoteEventCollectionBox,
    NoteRegionBox,
    TrackBox,
    ValueClipBox,
    ValueEventCollectionBox,
    ValueRegionBox
} from "@/data/boxes"
import {AudioUnitBoxAdapter} from "@/audio-engine-shared/adapters/audio-unit/AudioUnitBoxAdapter.ts"
import {Effects} from "@/service/Effects.ts"
import {DeviceHost, EffectDeviceBoxAdapter, EffectPointerType} from "@/audio-engine-shared/adapters/devices.ts"
import {enumToName, IconSymbol} from "@/IconSymbol.ts"
import {AnyClipBox} from "@/data/unions.ts"
import {TrackType} from "@/audio-engine-shared/adapters/timeline/TrackType.ts"
import {ColorCodes} from "@/ui/mixer/ColorCodes.ts"
import {TrackClips} from "@/audio-engine-shared/adapters/timeline/TrackClips.ts"
import {ppqn, PPQN} from "dsp"
import {showInfoDialog} from "./components/dialogs"
import {TrackRegions} from "@/audio-engine-shared/adapters/timeline/TrackRegions"
import {AudioUnitType} from "@/data/enums.ts"
import {RootBoxAdapter} from "@/audio-engine-shared/adapters/RootBoxAdapter"

export namespace Modifier {
    const AudioUnitOrdering = {
        [AudioUnitType.Instrument]: 0,
        [AudioUnitType.Aux]: 1,
        [AudioUnitType.Bus]: 2,
        [AudioUnitType.Output]: 3
    } as const

    export const createAudioUnit =
        ({boxGraph, rootBox, rootBoxAdapter, masterBusBox}: Project, type: AudioUnitType, index?: int) => {
            const insertIndex = index ?? pushAudioUnitsIndices(rootBoxAdapter, type, 1)
            console.debug(`createAudioUnit type: ${type}, insertIndex: ${insertIndex}`)
            return AudioUnitBox.create(boxGraph, UUID.generate(), box => {
                box.collection.refer(rootBox.audioUnits)
                box.output.refer(masterBusBox.input)
                box.index.setValue(insertIndex)
                box.type.setValue(type)
            })
        }

    export const pushAudioUnitsIndices = (rootBoxAdapter: RootBoxAdapter, type: AudioUnitType, count: int = 1): int => {
        const adapters = rootBoxAdapter.audioUnits.adapters()
        const order: int = AudioUnitOrdering[type]
        let index = 0 | 0
        for (; index < adapters.length; index++) {
            if (AudioUnitOrdering[adapters[index].type] > order) {break}
        }
        const insertIndex = index
        while (index < adapters.length) {
            adapters[index].indexField.setValue(count + index++)
        }
        return insertIndex
    }

    export const deleteAudioUnit = ({rootBoxAdapter}: Project, adapter: AudioUnitBoxAdapter): void => {
        const adapters = rootBoxAdapter.audioUnits.adapters()
        const boxIndex = adapter.indexField.getValue()
        const deleteIndex = adapters.indexOf(adapter)
        console.debug(`deleteAudioUnit adapter: ${adapter.toString()}, deleteIndex: ${deleteIndex}, indexField: ${boxIndex}`)
        if (deleteIndex === -1) {return panic(`Cannot delete ${adapter}. Does not exist.`)}
        if (deleteIndex !== boxIndex) {
            console.debug("indices", adapters.map(x => x.box.index.getValue()).join(", "))
            return panic(`Cannot delete ${adapter}. Wrong index.`)
        }
        for (let index = deleteIndex + 1; index < adapters.length; index++) {
            adapters[index].indexField.setValue(index - 1)
        }
        adapter.box.delete()
    }

    export const createAudioBus = (project: Project,
                                   name: string,
                                   icon: IconSymbol,
                                   type: AudioUnitType,
                                   color: string): AudioBusBox => {
        console.debug(`createAudioBus '${name}', type: ${type}, color: ${color}`)
        const {rootBox, boxGraph} = project
        assert(rootBox.audioBusses.isAttached(), "rootBox not attached")
        const uuid = UUID.generate()
        const audioBusBox = AudioBusBox.create(boxGraph, uuid, box => {
            box.collection.refer(rootBox.audioBusses)
            box.label.setValue(name)
            box.icon.setValue(enumToName(icon))
            box.color.setValue(color)
        })
        const audioUnitBox = Modifier.createAudioUnit(project, type)
        TrackBox.create(boxGraph, UUID.generate(), box => {
            box.tracks.refer(audioUnitBox.tracks)
            box.target.refer(audioUnitBox)
            box.index.setValue(0)
            box.type.setValue(TrackType.Undefined)
        })
        audioBusBox.output.refer(audioUnitBox.input)
        return audioBusBox
    }

    export const createEffect = (project: Project, host: DeviceHost, entry: Effects.Entry, newIndex: int) => {
        let chain: ReadonlyArray<EffectDeviceBoxAdapter>
        let field: Field<EffectPointerType>
        if (entry.type === "audio") {
            chain = host.audioEffects.adapters()
            field = host.audioEffects.field()
        } else if (entry.type === "midi") {
            chain = host.midiEffects.adapters()
            field = host.midiEffects.field()
        } else {
            return panic(`Unknown factory type: ${entry.type}`)
        }
        project.editing.modify(() => {
            entry.create(project, field, newIndex)
            for (let index = newIndex; index < chain.length; index++) {
                chain[index].indexField.setValue(index + 1)
            }
        })
    }

    export const createClip = (clips: TrackClips, clipIndex: int, {name}: {
        name?: string
    } = {}): Option<AnyClipBox> => {
        if (clips.collection.getAdapterByIndex(clipIndex).nonEmpty()) {
            console.warn("Cannot create Clip on occupied cell.")
            return Option.None
        }
        const graph = clips.trackBoxAdapter.box.graph
        const type = clips.trackBoxAdapter.type
        switch (type) {
            case TrackType.Notes: {
                const events = NoteEventCollectionBox.create(graph, UUID.generate())
                return Option.wrap(NoteClipBox.create(graph, UUID.generate(), box => {
                    box.index.setValue(clipIndex)
                    box.label.setValue(name ?? "Notes")
                    box.hue.setValue(ColorCodes.forTrackType(type))
                    box.mute.setValue(false)
                    box.duration.setValue(PPQN.Bar)
                    box.clips.refer(clips.trackBoxAdapter.box.clips)
                    box.events.refer(events.owners)
                }))
            }
            case TrackType.Value: {
                const events = ValueEventCollectionBox.create(graph, UUID.generate())
                return Option.wrap(ValueClipBox.create(graph, UUID.generate(), box => {
                    box.index.setValue(clipIndex)
                    box.label.setValue(name ?? "CV")
                    box.hue.setValue(ColorCodes.forTrackType(type))
                    box.mute.setValue(false)
                    box.duration.setValue(PPQN.Bar)
                    box.events.refer(events.owners)
                    box.clips.refer(clips.trackBoxAdapter.box.clips)
                }))
            }
            case TrackType.Audio: {
                showInfoDialog({message: "Please drag and drop samples from the sample editor."}).then()
            }
        }
        return Option.None
    }

    export const createRegion = (regions: TrackRegions,
                                 position: ppqn,
                                 duration: ppqn, {name}: { name?: string } = {}) => {
        const graph = regions.trackBoxAdapter.box.graph
        const type = regions.trackBoxAdapter.type
        switch (type) {
            case TrackType.Notes: {
                const events = NoteEventCollectionBox.create(graph, UUID.generate())
                return Option.wrap(NoteRegionBox.create(graph, UUID.generate(), box => {
                    box.position.setValue(Math.max(position, 0))
                    box.label.setValue(name ?? "Notes")
                    box.hue.setValue(ColorCodes.forTrackType(type))
                    box.mute.setValue(false)
                    box.duration.setValue(duration)
                    box.loopDuration.setValue(PPQN.Bar)
                    box.events.refer(events.owners)
                    box.regions.refer(regions.trackBoxAdapter.box.regions)
                }))
            }
            case TrackType.Value: {
                const events = ValueEventCollectionBox.create(graph, UUID.generate())
                return Option.wrap(ValueRegionBox.create(graph, UUID.generate(), box => {
                    box.position.setValue(Math.max(position, 0))
                    box.label.setValue(name ?? "Automation")
                    box.hue.setValue(ColorCodes.forTrackType(type))
                    box.mute.setValue(false)
                    box.duration.setValue(duration)
                    box.loopDuration.setValue(PPQN.Bar)
                    box.events.refer(events.owners)
                    box.regions.refer(regions.trackBoxAdapter.box.regions)
                }))
            }
            case TrackType.Audio: {
                showInfoDialog({message: "Please drag and drop samples from the sample browser."}).then()
            }
        }
        return Option.None
    }
}