import {assert, Bits, isInstanceOf, Option, UUID} from "lib-std"
import {LoopableRegion} from "lib-dsp"
import {AudioClipBoxAdapter, AudioData, AudioRegionBoxAdapter, TapeDeviceBoxAdapter, TrackType} from "studio-adapters"
import {RenderQuantum} from "../../constants.ts"
import {EngineContext} from "../../EngineContext.ts"
import {DeviceProcessor} from "../../processors.ts"
import {AudioGenerator, Block, BlockFlag, ProcessInfo, Processor} from "../../processing.ts"
import {AbstractProcessor} from "../../AbstractProcessor.ts"
import {AudioBuffer} from "../../AudioBuffer.ts"
import {PeakBroadcaster} from "../../PeakBroadcaster.ts"
import {AutomatableParameter} from "../../AutomatableParameter.ts"
import {NoteEventTarget} from "../../NoteEventSource.ts"

export class TapeDeviceProcessor extends AbstractProcessor implements DeviceProcessor, AudioGenerator {
    readonly #adapter: TapeDeviceBoxAdapter

    readonly #audioOutput: AudioBuffer
    readonly #peaks: PeakBroadcaster

    constructor(context: EngineContext, adapter: TapeDeviceBoxAdapter) {
        super(context)

        this.#adapter = adapter
        this.#audioOutput = new AudioBuffer(2)
        this.#peaks = this.own(new PeakBroadcaster(context.broadcaster, adapter.address))

        this.own(context.registerProcessor(this))
    }

    get noteEventTarget(): Option<NoteEventTarget & DeviceProcessor> {return Option.None}

    reset(): void {
        this.#peaks.clear()
        this.#audioOutput.clear()
        this.eventInput.clear()
    }

    get uuid(): UUID.Format {return this.#adapter.uuid}
    get incoming(): Processor {return this}
    get outgoing(): Processor {return this}
    get audioOutput(): AudioBuffer {return this.#audioOutput}

    process({blocks}: ProcessInfo): void {
        this.#audioOutput.clear(0, RenderQuantum)
        const [outL, outR] = this.#audioOutput.channels()
        this.#adapter.deviceHost().audioUnitBoxAdapter().tracks.collection.adapters()
            .filter(trackBoxAdapter => trackBoxAdapter.type === TrackType.Audio && trackBoxAdapter.enabled.getValue())
            .forEach(trackBoxAdapter => blocks
                .forEach((block) => {
                    const {p0, p1, flags} = block
                    if (!Bits.every(flags, BlockFlag.transporting | BlockFlag.playing)) {return}
                    const intervals = this.context.clipSequencing.iterate(trackBoxAdapter.uuid, p0, p1)
                    for (const {optClip, sectionFrom, sectionTo} of intervals) {
                        optClip.match({
                            none: () => {
                                for (const region of trackBoxAdapter.regions.collection.iterateRange(p0, p1)) {
                                    if (region.mute || !isInstanceOf(region, AudioRegionBoxAdapter)) {continue}
                                    const optData = region.file.getOrCreateAudioLoader().data
                                    if (optData.isEmpty()) {return}
                                    const data = optData.unwrap()
                                    for (const cycle of LoopableRegion.locateLoops(region, p0, p1)) {
                                        this.#processPass(this.#audioOutput, data, cycle, block)
                                    }
                                }
                            },
                            some: clip => {
                                if (!isInstanceOf(clip, AudioClipBoxAdapter)) {return}
                                const optData = clip.file.getOrCreateAudioLoader().data
                                if (optData.isEmpty()) {return}
                                const data = optData.unwrap()
                                for (const cycle of LoopableRegion.locateLoops({
                                    position: 0.0,
                                    loopDuration: clip.duration,
                                    loopOffset: 0,
                                    complete: Number.POSITIVE_INFINITY
                                }, sectionFrom, sectionTo)) {
                                    this.#processPass(this.#audioOutput, data, cycle, block)
                                }
                            }
                        })
                    }
                }))
        this.#audioOutput.assertSanity()
        this.#peaks.process(outL, outR)
    }

    parameterChanged(_parameter: AutomatableParameter): void {}

    #processPass(output: AudioBuffer, data: AudioData, cycle: LoopableRegion.LoopCycle, {p0, p1, s0, s1}: Block): void {
        const [outL, outR] = output.channels()
        const {numberOfFrames, frames} = data
        const framesL = frames[0]
        const framesR = frames.length === 1 ? frames[0] : frames[1]
        const sn = s1 - s0
        const pn = p1 - p0
        // read target range
        const wp0 = numberOfFrames * cycle.resultStartValue
        const wp1 = numberOfFrames * cycle.resultEndValue
        // block ratio
        const r0 = (cycle.resultStart - p0) / pn
        const r1 = (cycle.resultEnd - p0) / pn
        // block position
        const bp0 = s0 + sn * r0
        const bp1 = s0 + sn * r1
        const bpn = (bp1 - bp0) | 0
        // read step size
        const step = (wp1 - wp0) / bpn
        assert(s0 <= bp0 && bp1 <= s1, `Out of bounds ${bp0}, ${bp1}`)
        for (let i = 0 | 0, j = bp0 | 0; i < bpn; i++, j++) {
            const read = wp0 + i * step
            const readInt = read | 0
            const readAlpha = read - readInt
            const l0 = framesL[readInt]
            const r0 = framesR[readInt]
            outL[j] += l0 + readAlpha * (framesL[(readInt + 1) % numberOfFrames] - l0)
            outR[j] += r0 + readAlpha * (framesR[(readInt + 1) % numberOfFrames] - r0)
        }
    }
}