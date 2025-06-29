import {AudioLoaderManager} from "./AudioLoader"
import {RootBoxAdapter} from "./RootBoxAdapter"
import {TimelineBoxAdapter} from "./adapters/timeline/TimelineBoxAdapter"
import {LiveStreamBroadcaster, LiveStreamReceiver} from "lib-fusion"
import {ClipSequencing} from "./ClipSequencing"
import {ParameterFieldAdapters} from "./ParameterFieldAdapters"
import {BoxAdapters} from "./BoxAdapters"
import {Terminable} from "lib-std"
import {BoxGraph} from "lib-box"

export interface BoxAdaptersContext extends Terminable {
    get boxGraph(): BoxGraph
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