import {BoxIO} from "@core/data/boxes"
import {AudioLoaderManager} from "@/audio-engine-shared/AudioLoader"
import {RootBoxAdapter} from "@/audio-engine-shared/adapters/RootBoxAdapter"
import {TimelineBoxAdapter} from "@/audio-engine-shared/adapters/timeline/TimelineBoxAdapter"
import {LiveStreamBroadcaster, LiveStreamReceiver} from "fusion"
import {ClipSequencing} from "@/audio-engine-shared/ClipSequencing"
import {ParameterFieldAdapters} from "@/audio-engine-shared/ParameterFieldAdapters"
import {BoxAdapters} from "@/audio-engine-shared/BoxAdapters"
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