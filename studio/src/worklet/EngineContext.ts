import {Observer, Subscription, Terminable, UUID} from "std"
import {Processor, ProcessPhase} from "@/worklet/processing.ts"
import {LiveStreamBroadcaster} from "fusion"
import {UpdateClock} from "@/worklet/UpdateClock.ts"
import {TimeInfo} from "@/worklet/TimeInfo.ts"
import {AudioUnit} from "@/worklet/AudioUnit.ts"
import {Mixer} from "@/worklet/Mixer.ts"
import {EngineToClient} from "@/worklet/protocols"
import {BoxAdaptersContext} from "@core/shared/BoxAdaptersContext"

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