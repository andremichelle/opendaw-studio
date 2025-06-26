import {BoxGraph, Editing} from "box"
import {
    AudioBusBox,
    AudioFileBox,
    AudioUnitBox,
    BoxIO,
    BoxVisitor,
    GrooveShuffleBox,
    RootBox,
    TimelineBox,
    UserInterfaceBox,
    ValueEventBox,
    ValueEventCurveBox,
    ZeitgeistDeviceBox
} from "@core/data/boxes"
import {UIAudioManager} from "@/project/UIAudioManager"
import {BoxAdapters} from "@core/shared/BoxAdapters.ts"
import {
    asInstanceOf,
    assert,
    ByteArrayOutput,
    ObservableValue,
    Option,
    panic,
    Terminable,
    TerminableOwner,
    Terminator,
    UUID
} from "std"
import {UserEditingManager} from "@/UserEditingManager.ts"
import {StudioService} from "@/service/StudioService.ts"
import {RootBoxAdapter} from "@core/shared/RootBoxAdapter.ts"
import {AudioUnitType} from "@core/data/enums.ts"
import {Colors} from "@/ui/Colors"
import {ppqn} from "dsp"
import {IconSymbol} from "@core/IconSymbol.ts"
import {TimelineBoxAdapter} from "@core/shared/adapters/timeline/TimelineBoxAdapter.ts"
import {ParameterFieldAdapters} from "@core/shared/ParameterFieldAdapters"
import {showInfoDialog} from "@/ui/components/dialogs.tsx"
import {MandatoryBoxes} from "@core/shared/ManadatoryBoxes.ts"
import {ProjectDecoder} from "@core/shared/ProjectDecoder.ts"
import {ClipSequencing} from "@core/shared/ClipSequencing.ts"
import {LiveStreamBroadcaster, LiveStreamReceiver} from "fusion"
import {MidiDevices} from "@/midi/devices/MidiDevices"
import {BoxAdaptersContext} from "@core/shared/BoxAdaptersContext"
import {VertexSelection} from "@/ui/selection/VertexSelection"
import {Mixer} from "@/project/Mixer"
import {AudioSample} from "@/audio/AudioSample"
import {SampleApi} from "@/service/SampleApi"
import {AudioStorage} from "@/audio/AudioStorage"
import {Promises} from "runtime"
import {SampleDialogs} from "@/ui/browse/SampleDialogs"
import {Errors} from "dom"

// Main Entry Point for a Project
//
export class Project implements BoxAdaptersContext, Terminable, TerminableOwner {
    static new(service: StudioService): Project {
        const boxGraph = new BoxGraph<BoxIO.TypeMap>(Option.wrap(BoxIO.create))
        const isoString = new Date().toISOString()
        console.debug(`New Project created on ${isoString}`)
        boxGraph.beginTransaction()
        const grooveShuffleBox = GrooveShuffleBox.create(boxGraph, UUID.generate(), box => {
            box.label.setValue("Groove Shuffle")
        })
        const rootBox = RootBox.create(boxGraph, UUID.generate(), box => {
            box.groove.refer(grooveShuffleBox)
            box.created.setValue(isoString)
        })
        const userInterfaceBox = UserInterfaceBox.create(boxGraph, UUID.generate())
        const masterBusBox = AudioBusBox.create(boxGraph, UUID.generate(), box => {
            box.collection.refer(rootBox.audioBusses)
            box.label.setValue("Output")
            box.icon.setValue(IconSymbol.toName(IconSymbol.SpeakerHeadphone))
            box.color.setValue(Colors.blue)
        })
        const masterAudioUnit = AudioUnitBox.create(boxGraph, UUID.generate(), box => {
            box.type.setValue(AudioUnitType.Output)
            box.collection.refer(rootBox.audioUnits)
            box.output.refer(rootBox.outputDevice)
            box.index.setValue(0)
        })
        const timelineBox = TimelineBox.create(boxGraph, UUID.generate())
        rootBox.timeline.refer(timelineBox.root)
        userInterfaceBox.root.refer(rootBox.users)
        masterBusBox.output.refer(masterAudioUnit.input)
        boxGraph.endTransaction()
        return new Project(service, boxGraph, {
            rootBox,
            userInterfaceBox,
            masterBusBox,
            masterAudioUnit,
            timelineBox
        })
    }

    static load(service: StudioService, arrayBuffer: ArrayBuffer): Project {
        const skeleton = ProjectDecoder.decode(arrayBuffer)
        this.#migrate(skeleton)
        return new Project(service, skeleton.boxGraph, skeleton.mandatoryBoxes)
    }

    static #migrate({boxGraph, mandatoryBoxes}: ProjectDecoder.Skeleton): void {
        const {rootBox} = mandatoryBoxes
        if (rootBox.groove.targetAddress.isEmpty()) {
            console.debug("Migrate to global GrooveShuffleBox")
            boxGraph.beginTransaction()
            rootBox.groove.refer(GrooveShuffleBox.create(boxGraph, UUID.generate()))
            boxGraph.endTransaction()
        }
        const globalShuffle = asInstanceOf(rootBox.groove.targetVertex.unwrap(), GrooveShuffleBox).label
        if (globalShuffle.getValue() !== "Groove Shuffle") {
            boxGraph.beginTransaction()
            globalShuffle.setValue("Groove Shuffle")
            boxGraph.endTransaction()
        }
        // TODO We can remove this when we delete all not-migrated, local(!) project files from my machine
        boxGraph.boxes().forEach(box => box.accept<BoxVisitor>({
            visitZeitgeistDeviceBox: (box: ZeitgeistDeviceBox) => {
                if (box.groove.targetAddress.isEmpty()) {
                    console.debug("Migrate 'ZeitgeistDeviceBox' to GrooveShuffleBox")
                    boxGraph.beginTransaction()
                    box.groove.refer(rootBox.groove.targetVertex.unwrap())
                    boxGraph.endTransaction()
                }
            },
            visitValueEventBox: (eventBox: ValueEventBox) => {
                const slope = eventBox.slope.getValue()
                if (isNaN(slope)) {return} // already migrated, nothing to do
                if (slope === 0.0) { // never set
                    console.debug("Migrate 'ValueEventBox'")
                    boxGraph.beginTransaction()
                    eventBox.slope.setValue(NaN)
                    boxGraph.endTransaction()
                } else if (eventBox.interpolation.getValue() === 1) { // linear
                    if (slope === 0.5) {
                        console.debug("Migrate 'ValueEventBox' to linear")
                        boxGraph.beginTransaction()
                        eventBox.slope.setValue(NaN)
                        boxGraph.endTransaction()
                    } else {
                        console.debug("Migrate 'ValueEventBox' to new ValueEventCurveBox")
                        boxGraph.beginTransaction()
                        ValueEventCurveBox.create(boxGraph, UUID.generate(), box => {
                            box.event.refer(eventBox.interpolation)
                            box.slope.setValue(slope)
                        })
                        eventBox.slope.setValue(NaN)
                        boxGraph.endTransaction()
                    }
                }
            }
        }))
    }

    readonly #terminator = new Terminator()

    readonly service: StudioService
    readonly boxGraph: BoxGraph<BoxIO.TypeMap>

    readonly rootBox: RootBox
    readonly userInterfaceBox: UserInterfaceBox
    readonly masterBusBox: AudioBusBox
    readonly masterAudioUnit: AudioUnitBox
    readonly timelineBox: TimelineBox

    readonly editing: Editing
    readonly selection: VertexSelection
    readonly boxAdapters: BoxAdapters
    readonly userEditingManager: UserEditingManager
    readonly parameterFieldAdapters: ParameterFieldAdapters
    readonly liveStreamReceiver: LiveStreamReceiver
    readonly midiDevices: MidiDevices
    readonly mixer: Mixer

    private constructor(service: StudioService, boxGraph: BoxGraph, {
        rootBox,
        userInterfaceBox,
        masterBusBox,
        masterAudioUnit,
        timelineBox
    }: MandatoryBoxes) {
        this.service = service
        this.boxGraph = boxGraph
        this.rootBox = rootBox
        this.userInterfaceBox = userInterfaceBox
        this.masterBusBox = masterBusBox
        this.masterAudioUnit = masterAudioUnit
        this.timelineBox = timelineBox
        this.liveStreamReceiver = this.#terminator.own(new LiveStreamReceiver())
        this.midiDevices = this.#terminator.own(new MidiDevices(this))

        this.editing = new Editing(this.boxGraph)
        this.selection = new VertexSelection(this.editing, this.boxGraph)
        this.parameterFieldAdapters = new ParameterFieldAdapters()
        this.boxAdapters = this.#terminator.own(new BoxAdapters(this))
        this.userEditingManager = new UserEditingManager(this.editing)
        this.userEditingManager.follow(this.userInterfaceBox)
        this.selection.switch(this.userInterfaceBox.selection)

        this.mixer = new Mixer(this.rootBoxAdapter.audioUnits)

        console.debug(`Project was created on ${this.rootBoxAdapter.created.toString()}`)
    }

    own<T extends Terminable>(terminable: T): T {return this.#terminator.own<T>(terminable)}
    ownAll<T extends Terminable>(...terminables: Array<T>): void {return this.#terminator.ownAll<T>(...terminables)}
    spawn(): Terminator {return this.#terminator.spawn()}

    get bpm(): number {return this.timelineBox.bpm.getValue()}
    get position(): ObservableValue<ppqn> {return this.service.engine.position()}
    get rootBoxAdapter(): RootBoxAdapter {return this.boxAdapters.adapterFor(this.rootBox, RootBoxAdapter)}
    get timelineBoxAdapter(): TimelineBoxAdapter {return this.boxAdapters.adapterFor(this.timelineBox, TimelineBoxAdapter)}
    get audioManager(): UIAudioManager {return this.service.audioManager}
    get clipSequencing(): ClipSequencing {return panic("Only available in audio context")}
    get isAudioContext(): boolean {return false}
    get isMainThread(): boolean {return true}
    get liveStreamBroadcaster(): LiveStreamBroadcaster {return panic("Only available in audio context")}

    verify(): void {
        assert(this.rootBox.isAttached(), "[verify] rootBox is not attached")
        assert(this.userInterfaceBox.isAttached(), "[verify] userInterfaceBox is not attached")
        assert(this.masterBusBox.isAttached(), "[verify] masterBusBox is not attached")
        assert(this.timelineBox.isAttached(), "[verify] timelineBox is not attached")
        const result = this.boxGraph.verifyPointers()
        showInfoDialog({message: `Project is okay. All ${result.count} pointers are fine.`})
    }

    async verifySamples() {
        const boxes = this.boxGraph.boxes().filter((box) => box instanceof AudioFileBox)
        if (boxes.length > 0) {
            // check for missing samples
            const online = UUID.newSet<{ uuid: UUID.Format, sample: AudioSample }>(x => x.uuid)
            online.addMany((await SampleApi.all()).map(sample => ({uuid: UUID.parse(sample.uuid), sample})))
            const offline = UUID.newSet<{ uuid: UUID.Format, sample: AudioSample }>(x => x.uuid)
            offline.addMany((await AudioStorage.list()).map(sample => ({uuid: UUID.parse(sample.uuid), sample})))
            for (const box of boxes) {
                const uuid = box.address.uuid
                if (online.hasKey(uuid)) {continue}
                const optSample = offline.opt(uuid)
                if (optSample.isEmpty()) {
                    const {
                        status,
                        error,
                        value: sample
                    } = await Promises.tryCatch(SampleDialogs.missingSampleDialog(this.service, uuid, box.fileName.getValue()))
                    if (status === "rejected") {
                        if (Errors.isAbort(error)) {continue} else {return panic(String(error))}
                    }
                    await showInfoDialog({
                        headline: "Replaced Sample",
                        message: `${sample.name} has been replaced`
                    })
                    this.service.audioManager.invalidate(UUID.parse(sample.uuid))
                }
            }
        }
    }

    toArrayBuffer(): ArrayBufferLike {
        const output = ByteArrayOutput.create()
        output.writeInt(ProjectDecoder.MAGIC_HEADER_OPEN)
        output.writeInt(ProjectDecoder.FORMAT_VERSION)
        // store all boxes
        const boxGraphChunk = this.boxGraph.toArrayBuffer()
        output.writeInt(boxGraphChunk.byteLength)
        output.writeBytes(new Int8Array(boxGraphChunk))
        // store mandatory boxes' addresses
        UUID.toDataOutput(output, this.rootBox.address.uuid)
        UUID.toDataOutput(output, this.userInterfaceBox.address.uuid)
        UUID.toDataOutput(output, this.masterBusBox.address.uuid)
        UUID.toDataOutput(output, this.masterAudioUnit.address.uuid)
        UUID.toDataOutput(output, this.timelineBox.address.uuid)
        return output.toArrayBuffer()
    }

    copy(): Project {
        return Project.load(this.service, this.toArrayBuffer() as ArrayBuffer)
    }

    terminate(): void {this.#terminator.terminate()}
}