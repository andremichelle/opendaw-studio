import {BoxForge} from "box-forge"
import {Pointers} from "@core/data/pointers"
import {StepAutomationBox} from "./schema/step-automation"
import {AudioBusBox, AudioUnitBox, AuxSendBox} from "./schema/audio-unit"
import {TimelineBox} from "./schema/timeline/timeline"
import {AudioFileBox} from "./schema/audio"
import {RootBox} from "./schema/root"
import {SelectionBox} from "./schema/selection"
import {UserInterfaceBox} from "./schema/user-interface"
import {DeviceDefinitions} from "./schema/devices"
import {ModuleDefinitions} from "./schema/modular"
import {
    NoteClipBox,
    NoteEventBox,
    NoteEventCollectionBox,
    NoteEventRepeatBox,
    NoteRegionBox
} from "./schema/timeline/notes"
import {AudioClipBox, AudioRegionBox} from "./schema/timeline/audio"
import {
    ValueClipBox,
    ValueEventBox,
    ValueEventCollectionBox,
    ValueEventCurveBox,
    ValueRegionBox
} from "./schema/timeline/value"
import {TrackBox} from "./schema/timeline/track"
import {MarkerBox} from "./schema/timeline/marker"
import {GrooveShuffleBox} from "./schema/grooves"

BoxForge.gen<Pointers>({
    path: "../core/src/data/boxes",
    pointers: {
        from: "../pointers",
        enum: "Pointers",
        print: pointer => `Pointers.${Pointers[pointer]}`
    },
    boxes: [
        RootBox, SelectionBox, UserInterfaceBox,
        TimelineBox, TrackBox,
        NoteEventBox, NoteEventRepeatBox, NoteEventCollectionBox, NoteRegionBox, NoteClipBox,
        ValueEventBox, ValueEventCollectionBox, ValueEventCurveBox, ValueRegionBox, ValueClipBox,
        AudioRegionBox, AudioClipBox,
        MarkerBox,
        AudioFileBox,
        AudioUnitBox, AudioBusBox, AuxSendBox,
        StepAutomationBox,
        GrooveShuffleBox,
        ...DeviceDefinitions,
        ...ModuleDefinitions
    ]
}).then(() => console.debug("forged."))