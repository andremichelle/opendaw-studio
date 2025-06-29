import {clamp, Id, int, Option, Terminable, UUID} from "lib-std"
import {
    BandLimitedOscillator,
    BiquadCoeff,
    BiquadMono,
    dbToGain,
    Event,
    midiToHz,
    NoteEvent,
    velocityToGain,
    Waveform
} from "lib-dsp"
import {VaporisateurDeviceBoxAdapter} from "studio-shared"
import {RenderQuantum} from "../../constants.ts"
import {EngineContext} from "../../EngineContext.ts"
import {DeviceProcessor, InstrumentDeviceProcessor} from "../../processors.ts"
import {AudioProcessor} from "../../AudioProcessor.ts"
import {AudioBuffer} from "../../AudioBuffer.ts"
import {Block, Processor} from "../../processing.ts"
import {PeakBroadcaster} from "../../PeakBroadcaster.ts"
import {AutomatableParameter} from "../../AutomatableParameter.ts"
import {NoteEventSource, NoteEventTarget, NoteLifecycleEvent} from "../../NoteEventSource.ts"
import {NoteEventInstrument} from "../../NoteEventInstrument.ts"

export class VaporisateurDeviceProcessor extends AudioProcessor implements InstrumentDeviceProcessor, NoteEventTarget {
    readonly #adapter: VaporisateurDeviceBoxAdapter

    readonly #voices: Array<Voice>
    readonly #noteEventInstrument: NoteEventInstrument
    readonly #audioOutput: AudioBuffer
    readonly #peakBroadcaster: PeakBroadcaster
    readonly #parameterVolume: AutomatableParameter<number>
    readonly #parameterOctave: AutomatableParameter<number>
    readonly #parameterTune: AutomatableParameter<number>
    readonly #parameterAttack: AutomatableParameter<number>
    readonly #parameterRelease: AutomatableParameter<number>
    readonly #parameterWaveform: AutomatableParameter<number>
    readonly #parameterCutoff: AutomatableParameter<number>
    readonly #parameterResonance: AutomatableParameter<number>
    readonly #parameterFilterEnvelope: AutomatableParameter<number>

    gain: number = 1.0
    freqMult: number = 1.0
    attack: number = 1.0
    release: number = 1.0
    waveform: Waveform = Waveform.sine
    cutoff: number = 1.0
    resonance: number = 1.0
    filterEnvelope: number = 0.0

    constructor(context: EngineContext, adapter: VaporisateurDeviceBoxAdapter) {
        super(context)

        this.#adapter = adapter

        this.#voices = []
        this.#noteEventInstrument = new NoteEventInstrument(this, context.broadcaster, adapter.audioUnitBoxAdapter().address)
        this.#audioOutput = new AudioBuffer()
        this.#peakBroadcaster = this.own(new PeakBroadcaster(context.broadcaster, adapter.address))

        this.#parameterVolume = this.own(this.bindParameter(this.#adapter.namedParameter.volume))
        this.#parameterOctave = this.own(this.bindParameter(this.#adapter.namedParameter.octave))
        this.#parameterTune = this.own(this.bindParameter(this.#adapter.namedParameter.tune))
        this.#parameterAttack = this.own(this.bindParameter(this.#adapter.namedParameter.attack))
        this.#parameterRelease = this.own(this.bindParameter(this.#adapter.namedParameter.release))
        this.#parameterWaveform = this.own(this.bindParameter(this.#adapter.namedParameter.waveform))
        this.#parameterCutoff = this.own(this.bindParameter(this.#adapter.namedParameter.cutoff))
        this.#parameterResonance = this.own(this.bindParameter(this.#adapter.namedParameter.resonance))
        this.#parameterFilterEnvelope = this.own(this.bindParameter(this.#adapter.namedParameter.filterEnvelope))

        this.own(context.registerProcessor(this))
        this.readAllParameters()
    }

    get noteEventTarget(): Option<NoteEventTarget & DeviceProcessor> {return Option.wrap(this)}

    introduceBlock(block: Block): void {this.#noteEventInstrument.introduceBlock(block)}
    setNoteEventSource(source: NoteEventSource): Terminable {return this.#noteEventInstrument.setNoteEventSource(source)}

    get incoming(): Processor {return this}
    get outgoing(): Processor {return this}

    reset(): void {
        this.#noteEventInstrument.clear()
        this.#peakBroadcaster.clear()
        this.#voices.length = 0
        this.#audioOutput.clear()
        this.eventInput.clear()
    }

    get uuid(): UUID.Format {return this.#adapter.uuid}
    get audioOutput(): AudioBuffer {return this.#audioOutput}
    get adapter(): VaporisateurDeviceBoxAdapter {return this.#adapter}

    handleEvent(event: Event): void {
        if (NoteLifecycleEvent.isStart(event)) {
            this.#voices.push(new Voice(this, event))
        } else if (NoteLifecycleEvent.isStop(event)) {
            this.#voices.find(voice => voice.event.id === event.id)?.stop()
        }
    }

    processAudio(_block: Block, fromIndex: int, toIndex: int): void {
        this.#audioOutput.clear(fromIndex, toIndex)
        for (let i = this.#voices.length - 1; i >= 0; i--) {
            if (this.#voices[i].processAdd(this.#audioOutput, fromIndex, toIndex)) {
                this.#voices.splice(i, 1)
            }
        }
    }

    parameterChanged(parameter: AutomatableParameter): void {
        if (parameter === this.#parameterVolume) {
            this.gain = dbToGain(this.#parameterVolume.getValue())
        } else if (parameter === this.#parameterOctave || parameter === this.#parameterTune) {
            this.freqMult = 2.0 ** (this.#parameterOctave.getValue() + this.#parameterTune.getValue() / 1200.0)
        } else if (parameter === this.#parameterAttack) {
            this.attack = Math.floor(this.#parameterAttack.getValue() * sampleRate)
        } else if (parameter === this.#parameterRelease) {
            this.release = Math.floor(this.#parameterRelease.getValue() * sampleRate)
        } else if (parameter === this.#parameterWaveform) {
            this.waveform = this.#parameterWaveform.getValue() as Waveform
        } else if (parameter === this.#parameterCutoff) {
            this.cutoff = this.#parameterCutoff.getValue()
        } else if (parameter === this.#parameterResonance) {
            this.resonance = this.#parameterResonance.getValue()
        } else if (parameter === this.#parameterFilterEnvelope) {
            this.filterEnvelope = this.#parameterFilterEnvelope.getValue()
        }
    }

    finishProcess(): void {
        this.#audioOutput.assertSanity()
        this.#peakBroadcaster.process(this.#audioOutput.getChannel(0), this.#audioOutput.getChannel(1))
    }

    toString(): string {return `{VaporisateurDevice}`}
}

class Voice {
    readonly device: VaporisateurDeviceProcessor
    readonly event: Id<NoteEvent>
    readonly osc: BandLimitedOscillator
    readonly buffer: Float32Array
    readonly filterCoeff: BiquadCoeff
    readonly filterProcessor: BiquadMono

    phase: number = 0.0
    position: int = 0 | 0
    decayPosition: int = Number.POSITIVE_INFINITY

    constructor(device: VaporisateurDeviceProcessor, event: Id<NoteEvent>) {
        this.device = device
        this.event = event

        this.osc = new BandLimitedOscillator()
        this.buffer = new Float32Array(RenderQuantum)
        this.filterCoeff = new BiquadCoeff()
        this.filterProcessor = new BiquadMono()
    }

    stop(): void {this.decayPosition = this.position - this.device.attack}

    processAdd(output: AudioBuffer, fromIndex: int, toIndex: int): boolean {
        const frequency = midiToHz(this.event.pitch + this.event.cent / 100.0, 440.0) * this.device.freqMult
        const gain = velocityToGain(this.event.velocity) * this.device.gain * dbToGain(-15)
        const waveform = this.device.waveform
        const attack = this.device.attack
        const release = this.device.release
        const cutoffMapping = this.device.adapter.namedParameter.cutoff.valueMapping
        const cutoff = cutoffMapping.x(this.device.cutoff)
        const resonance = this.device.resonance
        const filterEnvelope = this.device.filterEnvelope
        const l = output.getChannel(0)
        const r = output.getChannel(1)
        this.osc.generate(this.buffer, frequency / sampleRate, waveform, fromIndex, toIndex)
        for (let i = fromIndex; i < toIndex; i++) {
            const env = Math.min(this.position / attack, 1.0 - (this.position - (this.decayPosition + attack)) / release, 1.0) ** 2.0
            this.filterCoeff.setLowpassParams(cutoffMapping.y(clamp(cutoff + env * filterEnvelope, 0.0, 1.0)) / sampleRate, resonance)
            const amp = this.filterProcessor.processFrame(this.filterCoeff, this.buffer[i]) * gain * env
            l[i] += amp
            r[i] += amp
            if (++this.position - this.decayPosition > attack + release) {return true}
        }
        return false
    }
}