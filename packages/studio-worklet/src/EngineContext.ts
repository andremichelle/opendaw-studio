import {Observer, Subscription, Terminable, UUID} from "lib-std"
import {Processor, ProcessPhase} from "./processing.ts"
import {LiveStreamBroadcaster} from "lib-fusion"
import {UpdateClock} from "./UpdateClock.ts"
import {TimeInfo} from "./TimeInfo.ts"
import {AudioUnit} from "./AudioUnit.ts"
import {Mixer} from "./Mixer.ts"
import {BoxAdaptersContext, EngineToClient} from "studio-adapters"

export interface EngineContext extends BoxAdaptersContext, Terminable {
    get broadcaster(): LiveStreamBroadcaster
    get updateClock(): UpdateClock
    get timeInfo(): TimeInfo
    get mixer(): Mixer
    get engineToClient(): EngineToClient

    getAudioUnit(uuid: UUID.Format): AudioUnit
    registerProcessor(processor: Processor): Terminable
    registerEdge(source: Processor, target: Processor): Terminable
    subscribeProcessPhase(observer: Observer<ProcessPhase>): Subscription
}