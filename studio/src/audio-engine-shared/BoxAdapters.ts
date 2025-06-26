import {asDefined, assert, AssertType, Class, isDefined, panic, SortedSet, Subscription, Terminable, UUID} from "std"
import {Box, Update} from "box"
import {
    ArpeggioDeviceBox,
    AudioBusBox,
    AudioClipBox,
    AudioFileBox,
    AudioRegionBox,
    AudioUnitBox,
    AuxSendBox,
    BoxVisitor,
    DelayDeviceBox,
    DeviceInterfaceKnobBox,
    GrooveShuffleBox,
    MarkerBox,
    ModularAudioInputBox,
    ModularAudioOutputBox,
    ModularBox,
    ModularDeviceBox,
    ModuleConnectionBox,
    ModuleDelayBox,
    ModuleGainBox,
    ModuleMultiplierBox,
    NanoDeviceBox,
    NoteClipBox,
    NoteEventBox,
    NoteEventCollectionBox,
    NoteRegionBox,
    PitchDeviceBox,
    PlayfieldDeviceBox,
    PlayfieldSampleBox,
    RevampDeviceBox,
    ReverbDeviceBox,
    RootBox,
    StereoToolDeviceBox,
    TapeDeviceBox,
    TimelineBox,
    TrackBox,
    ValueClipBox,
    ValueEventBox,
    ValueEventCollectionBox,
    ValueRegionBox,
    VaporisateurDeviceBox,
    ZeitgeistDeviceBox
} from "@core/data/boxes"
import {AudioUnitBoxAdapter} from "@/audio-engine-shared/adapters/audio-unit/AudioUnitBoxAdapter.ts"
import {DelayDeviceBoxAdapter} from "@/audio-engine-shared/adapters/devices/audio-effects/DelayDeviceBoxAdapter.ts"
import {ReverbDeviceBoxAdapter} from "@/audio-engine-shared/adapters/devices/audio-effects/ReverbDeviceBoxAdapter.ts"
import {RevampDeviceBoxAdapter} from "@/audio-engine-shared/adapters/devices/audio-effects/RevampDeviceBoxAdapter.ts"
import {AudioFileBoxAdapter} from "@/audio-engine-shared/adapters/AudioFileBoxAdapter.ts"
import {AudioRegionBoxAdapter} from "@/audio-engine-shared/adapters/timeline/region/AudioRegionBoxAdapter.ts"
import {TimelineBoxAdapter} from "@/audio-engine-shared/adapters/timeline/TimelineBoxAdapter.ts"
import {MarkerBoxAdapter} from "@/audio-engine-shared/adapters/timeline/MarkerBoxAdapter.ts"
import {ModularAdapter} from "@/audio-engine-shared/adapters/modular/modular.ts"
import {ModuleDelayAdapter} from "@/audio-engine-shared/adapters/modular/modules/delay.ts"
import {ModuleMultiplierAdapter} from "@/audio-engine-shared/adapters/modular/modules/multiplier.ts"
import {ModuleConnectionAdapter} from "@/audio-engine-shared/adapters/modular/connection.ts"
import {ModularAudioOutputAdapter} from "@/audio-engine-shared/adapters/modular/modules/audio-output.ts"
import {ModularAudioInputAdapter} from "@/audio-engine-shared/adapters/modular/modules/audio-input.ts"
import {ModularDeviceBoxAdapter} from "@/audio-engine-shared/adapters/devices/audio-effects/ModularDeviceBoxAdapter.ts"
import {DeviceInterfaceKnobAdapter} from "@/audio-engine-shared/adapters/modular/user-interface.ts"
import {ModuleGainAdapter} from "@/audio-engine-shared/adapters/modular/modules/gain.ts"
import {AudioBusBoxAdapter} from "@/audio-engine-shared/adapters/audio-unit/AudioBusBoxAdapter.ts"
import {AuxSendBoxAdapter} from "@/audio-engine-shared/adapters/audio-unit/AuxSendBoxAdapter.ts"
import {RootBoxAdapter} from "@/audio-engine-shared/adapters/RootBoxAdapter.ts"
import {NoteEventBoxAdapter} from "@/audio-engine-shared/adapters/timeline/event/NoteEventBoxAdapter.ts"
import {NoteRegionBoxAdapter} from "@/audio-engine-shared/adapters/timeline/region/NoteRegionBoxAdapter.ts"
import {
    NoteEventCollectionBoxAdapter
} from "@/audio-engine-shared/adapters/timeline/collection/NoteEventCollectionBoxAdapter.ts"
import {ValueEventBoxAdapter} from "@/audio-engine-shared/adapters/timeline/event/ValueEventBoxAdapter.ts"
import {ValueRegionBoxAdapter} from "@/audio-engine-shared/adapters/timeline/region/ValueRegionBoxAdapter.ts"
import {
    ValueEventCollectionBoxAdapter
} from "@/audio-engine-shared/adapters/timeline/collection/ValueEventCollectionBoxAdapter.ts"
import {NoteClipBoxAdapter} from "@/audio-engine-shared/adapters/timeline/clip/NoteClipBoxAdapter.ts"
import {AudioClipBoxAdapter} from "@/audio-engine-shared/adapters/timeline/clip/AudioClipBoxAdapter.ts"
import {ValueClipBoxAdapter} from "@/audio-engine-shared/adapters/timeline/clip/ValueClipBoxAdapter.ts"
import {TrackBoxAdapter} from "@/audio-engine-shared/adapters/timeline/TrackBoxAdapter.ts"
import {TapeDeviceBoxAdapter} from "./adapters/devices/instruments/TapeDeviceBoxAdapter"
import {VaporisateurDeviceBoxAdapter} from "./adapters/devices/instruments/VaporisateurDeviceBoxAdapter"
import {ArpeggioDeviceBoxAdapter} from "./adapters/devices/midi-effects/ArpeggioDeviceBoxAdapter"
import {PitchDeviceBoxAdapter} from "./adapters/devices/midi-effects/PitchDeviceBoxAdapter"
import {NanoDeviceBoxAdapter} from "./adapters/devices/instruments/NanoDeviceBoxAdapter"
import {PlayfieldDeviceBoxAdapter} from "./adapters/devices/instruments/PlayfieldDeviceBoxAdapter"
import {StereoToolDeviceBoxAdapter} from "./adapters/devices/audio-effects/StereoToolDeviceBoxAdapter"
import {
    PlayfieldSampleBoxAdapter
} from "@/audio-engine-shared/adapters/devices/instruments/Playfield/PlayfieldSampleBoxAdapter"
import {BoxAdaptersContext} from "@/audio-engine-shared/BoxAdaptersContext"
import {BoxAdapter} from "@/audio-engine-shared/BoxAdapter"
import {ZeitgeistDeviceBoxAdapter} from "@/audio-engine-shared/adapters/devices/midi-effects/ZeitgeistDeviceBoxAdapter"
import {GrooveShuffleBoxAdapter} from "@/audio-engine-shared/adapters/grooves/GrooveShuffleBoxAdapter"

export class BoxAdapters implements Terminable {
    readonly #context: BoxAdaptersContext
    readonly #adapters: SortedSet<UUID.Format, BoxAdapter>
    readonly #deleted: Set<Box>

    #terminable: Subscription

    constructor(context: BoxAdaptersContext) {
        this.#context = context
        this.#adapters = UUID.newSet<BoxAdapter>(adapter => adapter.uuid)
        this.#deleted = new Set<Box>()

        this.#terminable = this.#context.boxGraph.subscribeToAllUpdates({
            onUpdate: (update: Update) => {
                if (update.type === "delete") {
                    const adapter = this.#adapters.getOrNull(update.uuid)
                    if (isDefined(adapter)) {
                        this.#deleted.add(adapter.box)
                        this.#adapters.removeByValue(adapter).terminate()
                    }
                }
            }
        })
    }

    terminate(): void {
        this.#adapters.values().forEach(adapter => adapter.terminate())
        this.#adapters.clear()
        this.#terminable.terminate()
    }

    adapterFor<BOX extends Box, T extends BoxAdapter>(box: BOX, checkType: Class<T> | AssertType<T>): T {
        if (this.#deleted.has(box)) {
            return panic(`Cannot resolve adapter for already deleted box: ${box}`)
        }
        let adapter = this.#adapters.getOrNull(box.address.uuid)
        if (adapter === null) {
            adapter = this.#create(box)
            const added = this.#adapters.add(adapter)
            assert(added, `Could not add adapter for ${box}`)
        }
        if (typeof checkType === "function") {
            return Object.hasOwn(checkType, "prototype")
                ? adapter instanceof checkType ? adapter as T : panic(`${adapter} is not instance of ${checkType}`)
                : (checkType as AssertType<T>)(adapter) ? adapter as T : panic(`${adapter} did not pass custom type guard`)
        }
        return panic("Unknown checkType method")
    }

    #create(unknownBox: Box): BoxAdapter {
        return asDefined(unknownBox.accept<BoxVisitor<BoxAdapter>>({
            visitRootBox: (box: RootBox): BoxAdapter => new RootBoxAdapter(this.#context, box),
            visitArpeggioDeviceBox: (box: ArpeggioDeviceBox) => new ArpeggioDeviceBoxAdapter(this.#context, box),
            visitPitchDeviceBox: (box: PitchDeviceBox) => new PitchDeviceBoxAdapter(this.#context, box),
            visitStereoToolDeviceBox: (box: StereoToolDeviceBox) => new StereoToolDeviceBoxAdapter(this.#context, box),
            visitDelayDeviceBox: (box: DelayDeviceBox) => new DelayDeviceBoxAdapter(this.#context, box),
            visitReverbDeviceBox: (box: ReverbDeviceBox) => new ReverbDeviceBoxAdapter(this.#context, box),
            visitRevampDeviceBox: (box: RevampDeviceBox) => new RevampDeviceBoxAdapter(this.#context, box),
            visitPlayfieldDeviceBox: (box: PlayfieldDeviceBox) => new PlayfieldDeviceBoxAdapter(this.#context, box),
            visitPlayfieldSampleBox: (box: PlayfieldSampleBox) => new PlayfieldSampleBoxAdapter(this.#context, box),
            visitModularDeviceBox: (box: ModularDeviceBox) => new ModularDeviceBoxAdapter(this.#context, box),
            visitTapeDeviceBox: (box: TapeDeviceBox) => new TapeDeviceBoxAdapter(this.#context, box),
            visitNanoDeviceBox: (box: NanoDeviceBox) => new NanoDeviceBoxAdapter(this.#context, box),
            visitVaporisateurDeviceBox: (box: VaporisateurDeviceBox) => new VaporisateurDeviceBoxAdapter(this.#context, box),
            visitModularBox: (box: ModularBox) => new ModularAdapter(this.#context, box),
            visitModuleConnectionBox: (box: ModuleConnectionBox) => new ModuleConnectionAdapter(this.#context, box),
            visitModuleDelayBox: (box: ModuleDelayBox) => new ModuleDelayAdapter(this.#context, box),
            visitModuleGainBox: (box: ModuleGainBox) => new ModuleGainAdapter(this.#context, box),
            visitModuleMultiplierBox: (box: ModuleMultiplierBox) => new ModuleMultiplierAdapter(this.#context, box),
            visitModularAudioInputBox: (box: ModularAudioInputBox) => new ModularAudioInputAdapter(this.#context, box),
            visitModularAudioOutputBox: (box: ModularAudioOutputBox) => new ModularAudioOutputAdapter(this.#context, box),
            visitDeviceInterfaceKnobBox: (box: DeviceInterfaceKnobBox) => new DeviceInterfaceKnobAdapter(this.#context, box),
            visitAudioUnitBox: (box: AudioUnitBox) => new AudioUnitBoxAdapter(this.#context, box),
            visitAudioBusBox: (box: AudioBusBox): BoxAdapter => new AudioBusBoxAdapter(this.#context, box),
            visitAuxSendBox: (box: AuxSendBox): BoxAdapter => new AuxSendBoxAdapter(this.#context, box),
            visitAudioFileBox: (box: AudioFileBox) => new AudioFileBoxAdapter(this.#context, box),
            visitAudioClipBox: (box: AudioClipBox) => new AudioClipBoxAdapter(this.#context, box),
            visitAudioRegionBox: (box: AudioRegionBox) => new AudioRegionBoxAdapter(this.#context, box),
            visitNoteEventBox: (box: NoteEventBox) => new NoteEventBoxAdapter(this.#context, box),
            visitNoteEventCollectionBox: (box: NoteEventCollectionBox): BoxAdapter => new NoteEventCollectionBoxAdapter(this.#context, box),
            visitNoteClipBox: (box: NoteClipBox) => new NoteClipBoxAdapter(this.#context, box),
            visitNoteRegionBox: (box: NoteRegionBox) => new NoteRegionBoxAdapter(this.#context, box),
            visitValueEventBox: (box: ValueEventBox) => new ValueEventBoxAdapter(this.#context, box),
            visitValueEventCollectionBox: (box: ValueEventCollectionBox): BoxAdapter => new ValueEventCollectionBoxAdapter(this.#context, box),
            visitValueClipBox: (box: ValueClipBox) => new ValueClipBoxAdapter(this.#context, box),
            visitValueRegionBox: (box: ValueRegionBox) => new ValueRegionBoxAdapter(this.#context, box),
            visitTrackBox: (box: TrackBox) => new TrackBoxAdapter(this.#context, box),
            visitTimelineBox: (box: TimelineBox) => new TimelineBoxAdapter(this.#context, box),
            visitMarkerBox: (box: MarkerBox) => new MarkerBoxAdapter(this.#context, box),
            visitZeitgeistDeviceBox: (box: ZeitgeistDeviceBox) => new ZeitgeistDeviceBoxAdapter(this.#context, box),
            visitGrooveShuffleBox: (box: GrooveShuffleBox) => new GrooveShuffleBoxAdapter(this.#context, box)
        }), `Could not find factory for ${unknownBox}`)
    }
}