import WorkletUrl from "../worklet/PeakMeterProcessor.ts?worker&url"
import {WorkletFactory} from "@/audio-engine/WorkletFactory"
import {PeakMeterProcessorOptions} from "@core/shared/PeakMeterProcessorOptions"
import {int, Notifier, Observer, Schema, Subscription, SyncStream, Terminable, Terminator} from "std"
import {AnimationFrame} from "dom"

export type PeakSchema = { peak: Float32Array, rms: Float32Array }

export class PeakMeterWorket extends AudioWorkletNode implements Terminable {
    static async bootFactory(context: BaseAudioContext): Promise<WorkletFactory<PeakMeterWorket>> {
        return WorkletFactory.boot(context, WorkletUrl)
    }

    static create(factory: WorkletFactory<PeakMeterWorket>, numChannels: int): PeakMeterWorket {
        return factory.create(context => new PeakMeterWorket(context, numChannels))
    }

    readonly #terminator: Terminator = new Terminator()
    readonly #notifier: Notifier<PeakSchema> = new Notifier<PeakSchema>()

    private constructor(context: BaseAudioContext, numberOfChannels: int) {
        const receiver = SyncStream.reader(Schema.createBuilder({
            peak: Schema.floats(numberOfChannels),
            rms: Schema.floats(numberOfChannels)
        })(), (data: PeakSchema) => this.#notifier.notify(data))
        super(context, "peak-meter-processor", {
            numberOfInputs: 1,
            channelCount: numberOfChannels,
            channelCountMode: "explicit",
            processorOptions: {
                sab: receiver.buffer,
                numberOfChannels,
                rmsWindowInSeconds: 0.100,
                valueDecay: 0.200
            } satisfies PeakMeterProcessorOptions
        })
        this.#terminator.own(AnimationFrame.add(() => receiver.tryRead()))
    }

    subscribe(observer: Observer<PeakSchema>): Subscription {return this.#notifier.subscribe(observer)}

    terminate(): void {this.#terminator.terminate()}
}