import {int, Option, Terminable, UUID} from "opendaw-std"
import {dbToGain, Ramp, StereoMatrix} from "opendaw-dsp"
import {AudioEffectDeviceBoxAdapter, StereoToolDeviceBoxAdapter} from "studio-shared"
import {AudioEffectDeviceProcessor} from "../../processors.ts"
import {EngineContext} from "../../EngineContext.ts"
import {Block, Processor} from "../../processing.ts"
import {AudioBuffer} from "../../AudioBuffer.ts"
import {PeakBroadcaster} from "../../PeakBroadcaster.ts"
import {AutomatableParameter} from "../../AutomatableParameter.ts"
import {AudioProcessor} from "../../AudioProcessor.ts"

export class StereoToolDeviceProcessor extends AudioProcessor implements AudioEffectDeviceProcessor {
    readonly #adapter: StereoToolDeviceBoxAdapter
    readonly #output: AudioBuffer
    readonly #peaks: PeakBroadcaster

    readonly #matrix: Ramp.StereoMatrixRamp = Ramp.stereoMatrix(sampleRate)
    readonly #params: StereoMatrix.Params = {
        gain: 0.0,
        panning: 0.0,
        stereo: 0.0,
        invertL: false,
        invertR: false,
        swap: false
    }

    readonly #volume: AutomatableParameter<number>
    readonly #panning: AutomatableParameter<number>
    readonly #stereo: AutomatableParameter<number>
    readonly #invertL: AutomatableParameter<boolean>
    readonly #invertR: AutomatableParameter<boolean>
    readonly #swap: AutomatableParameter<boolean>

    #source: Option<AudioBuffer> = Option.None
    #mixing: StereoMatrix.Mixing = StereoMatrix.Mixing.Linear
    #needsUpdate: boolean = true
    #processed: boolean = false

    constructor(context: EngineContext, adapter: StereoToolDeviceBoxAdapter) {
        super(context)

        this.#adapter = adapter
        this.#output = new AudioBuffer()
        this.#peaks = this.own(new PeakBroadcaster(context.broadcaster, adapter.address))
        this.#volume = this.own(this.bindParameter(adapter.namedParameter.volume))
        this.#panning = this.own(this.bindParameter(adapter.namedParameter.panning))
        this.#stereo = this.own(this.bindParameter(adapter.namedParameter.stereo))
        this.#invertL = this.own(this.bindParameter(adapter.namedParameter.invertL))
        this.#invertR = this.own(this.bindParameter(adapter.namedParameter.invertR))
        this.#swap = this.own(this.bindParameter(adapter.namedParameter.swap))

        this.ownAll(
            adapter.box.panningMixing.catchupAndSubscribe(owner => {
                this.#mixing = owner.getValue()
                this.#needsUpdate = true
            }),
            context.registerProcessor(this)
        )
        this.readAllParameters()
    }

    get incoming(): Processor {return this}
    get outgoing(): Processor {return this}

    reset(): void {
        this.#peaks.clear()
        this.#output.clear()
        this.eventInput.clear()
        this.#processed = false
    }

    get uuid(): UUID.Format {return this.#adapter.uuid}

    get audioOutput(): AudioBuffer {return this.#output}

    setAudioSource(source: AudioBuffer): Terminable {
        this.#source = Option.wrap(source)
        return {terminate: () => this.#source = Option.None}
    }

    index(): int {return this.#adapter.indexField.getValue()}
    adapter(): AudioEffectDeviceBoxAdapter {return this.#adapter}

    processAudio(_block: Readonly<Block>, fromIndex: number, toIndex: number): void {
        if (this.#source.isEmpty()) {return}
        if (this.#needsUpdate) {
            this.#matrix.update(this.#params, this.#mixing, this.#processed)
            this.#needsUpdate = false
        }
        const source = this.#source.unwrap().channels() as StereoMatrix.Channels
        const target = this.#output.channels() as StereoMatrix.Channels
        this.#matrix.processFrames(source, target, fromIndex, toIndex)
        this.#peaks.processStereo(target, fromIndex, toIndex)
        this.#processed = true
    }

    parameterChanged(parameter: AutomatableParameter): void {
        switch (parameter) {
            case this.#volume:
                this.#params.gain = dbToGain(this.#volume.getValue())
                this.#needsUpdate = true
                return
            case this.#panning:
                this.#params.panning = this.#panning.getValue()
                this.#needsUpdate = true
                return
            case this.#stereo:
                this.#params.stereo = this.#stereo.getValue()
                this.#needsUpdate = true
                return
            case this.#invertL:
                this.#params.invertL = this.#invertL.getValue()
                this.#needsUpdate = true
                return
            case this.#invertR:
                this.#params.invertR = this.#invertR.getValue()
                this.#needsUpdate = true
                return
            case this.#swap:
                this.#params.swap = this.#swap.getValue()
                this.#needsUpdate = true
                return
        }
    }

    toString(): string {return `{${this.constructor.name}}`}
}