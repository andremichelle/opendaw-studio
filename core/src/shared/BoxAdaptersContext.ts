import {BoxIO} from "@core/data/boxes"
import {AudioLoaderManager} from "./AudioLoader.ts"
import {RootBoxAdapter} from "./RootBoxAdapter.ts"
import {TimelineBoxAdapter} from "./adapters/timeline/TimelineBoxAdapter.ts"
import {LiveStreamBroadcaster, LiveStreamReceiver} from "fusion"
import {ClipSequencing} from "./ClipSequencing.ts"
import {ParameterFieldAdapters} from "./ParameterFieldAdapters.ts"
import {BoxAdapters} from "./BoxAdapters.ts"
import {Terminable} from "std"
import {BoxGraph} from "box"

export interface BoxAdaptersContext extends Terminable {
    get boxGraph(): BoxGraph<BoxIO.TypeMap>
    get boxAdapters(): BoxAdapters
    get audioManager(): AudioLoaderManager
    get rootBoxAdapter(): RootBoxAdapter
    get timelineBoxAdapter(): TimelineBoxAdapter
    get liveStreamReceiver(): LiveStreamReceiver
    get liveStreamBroadcaster(): LiveStreamBroadcaster
    get clipSequencing(): ClipSequencing
    get parameterFieldAdapters(): ParameterFieldAdapters
    get bpm(): number // TODO This is a shortcut for now
    get isMainThread(): boolean
    get isAudioContext(): boolean
}