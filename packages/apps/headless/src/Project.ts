import {BoxGraph, Editing} from "lib-box"
import {
    AudioBusBox,
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
} from "studio-boxes"
import {
    AudioLoaderManager,
    BoxAdapters,
    BoxAdaptersContext,
    ClipSequencing,
    IconSymbol,
    MandatoryBoxes,
    ParameterFieldAdapters,
    ProjectDecoder,
    RootBoxAdapter,
    TimelineBoxAdapter
} from "studio-adapters"
import {asInstanceOf, ByteArrayOutput, Option, panic, Terminable, TerminableOwner, Terminator, UUID} from "lib-std"
import {LiveStreamBroadcaster, LiveStreamReceiver} from "lib-fusion"
import {AudioUnitType} from "studio-enums"

export type ProjectEnv = {
    audioManager: AudioLoaderManager
}

// Main Entry Point for a Project
//
export class Project implements BoxAdaptersContext, Terminable, TerminableOwner {
    static new(env: ProjectEnv): Project {
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
        return new Project(env, boxGraph, {
            rootBox,
            userInterfaceBox,
            masterBusBox,
            masterAudioUnit,
            timelineBox
        })
    }

    static load(env: ProjectEnv, arrayBuffer: ArrayBuffer): Project {
        const skeleton = ProjectDecoder.decode(arrayBuffer)
        this.#migrate(skeleton)
        return new Project(env, skeleton.boxGraph, skeleton.mandatoryBoxes)
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

    readonly #env: ProjectEnv
    readonly boxGraph: BoxGraph<BoxIO.TypeMap>

    readonly rootBox: RootBox
    readonly userInterfaceBox: UserInterfaceBox
    readonly masterBusBox: AudioBusBox
    readonly masterAudioUnit: AudioUnitBox
    readonly timelineBox: TimelineBox

    readonly editing: Editing
    readonly boxAdapters: BoxAdapters
    readonly parameterFieldAdapters: ParameterFieldAdapters
    readonly liveStreamReceiver: LiveStreamReceiver

    private constructor(env: ProjectEnv,
                        boxGraph: BoxGraph, {
                            rootBox,
                            userInterfaceBox,
                            masterBusBox,
                            masterAudioUnit,
                            timelineBox
                        }: MandatoryBoxes) {
        this.#env = env
        this.boxGraph = boxGraph
        this.rootBox = rootBox
        this.userInterfaceBox = userInterfaceBox
        this.masterBusBox = masterBusBox
        this.masterAudioUnit = masterAudioUnit
        this.timelineBox = timelineBox
        this.liveStreamReceiver = this.#terminator.own(new LiveStreamReceiver())
        this.editing = new Editing(this.boxGraph)
        this.parameterFieldAdapters = new ParameterFieldAdapters()
        this.boxAdapters = this.#terminator.own(new BoxAdapters(this))

        console.debug(`Project was created on ${this.rootBoxAdapter.created.toString()}`)
    }

    own<T extends Terminable>(terminable: T): T {return this.#terminator.own<T>(terminable)}
    ownAll<T extends Terminable>(...terminables: Array<T>): void {return this.#terminator.ownAll<T>(...terminables)}
    spawn(): Terminator {return this.#terminator.spawn()}

    get bpm(): number {return this.timelineBox.bpm.getValue()}
    get rootBoxAdapter(): RootBoxAdapter {return this.boxAdapters.adapterFor(this.rootBox, RootBoxAdapter)}
    get timelineBoxAdapter(): TimelineBoxAdapter {return this.boxAdapters.adapterFor(this.timelineBox, TimelineBoxAdapter)}
    get audioManager(): AudioLoaderManager {return this.#env.audioManager}
    get clipSequencing(): ClipSequencing {return panic("Only available in audio context")}
    get isAudioContext(): boolean {return false}
    get isMainThread(): boolean {return true}
    get liveStreamBroadcaster(): LiveStreamBroadcaster {return panic("Only available in audio context")}

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

    copy(): Project {return Project.load(this.#env, this.toArrayBuffer() as ArrayBuffer)}

    terminate(): void {this.#terminator.terminate()}
}