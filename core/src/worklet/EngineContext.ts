import {Observer, Subscription, Terminable, UUID} from "std"
import {Processor, ProcessPhase} from "@core/worklet/processing.ts"
import {LiveStreamBroadcaster} from "fusion"
import {UpdateClock} from "@core/worklet/UpdateClock.ts"
import {TimeInfo} from "@core/worklet/TimeInfo.ts"
import {AudioUnit} from "@core/worklet/AudioUnit.ts"
import {Mixer} from "@core/worklet/Mixer.ts"
import {EngineToClient} from "@core/worklet/protocols.ts"
import {BoxAdaptersContext} from "@core/shared/BoxAdaptersContext.ts"

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