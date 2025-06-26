import {AudioEffectDeviceProcessor, InstrumentDeviceProcessor, MidiEffectProcessor} from "@core/worklet/processors.ts"
import {
    ArpeggioDeviceBox,
    AudioBusBox,
    BoxVisitor,
    DelayDeviceBox,
    ModularDeviceBox,
    NanoDeviceBox,
    PitchDeviceBox,
    PlayfieldDeviceBox,
    RevampDeviceBox,
    ReverbDeviceBox,
    StereoToolDeviceBox,
    TapeDeviceBox,
    VaporisateurDeviceBox,
    ZeitgeistDeviceBox
} from "@core/data/boxes"
import {DelayDeviceProcessor} from "@core/worklet/devices/audio-effects/DelayDeviceProcessor.ts"
import {DelayDeviceBoxAdapter} from "@core/shared/adapters/devices/audio-effects/DelayDeviceBoxAdapter.ts"
import {NopDeviceProcessor} from "@core/worklet/devices/audio-effects/NopDeviceProcessor.ts"
import {ReverbDeviceBoxAdapter} from "@core/shared/adapters/devices/audio-effects/ReverbDeviceBoxAdapter.ts"
import {RevampDeviceBoxAdapter} from "@core/shared/adapters/devices/audio-effects/RevampDeviceBoxAdapter.ts"
import {ModularDeviceBoxAdapter} from "@core/shared/adapters/devices/audio-effects/ModularDeviceBoxAdapter.ts"
import {asDefined, Nullish} from "std"
import {EngineContext} from "@core/worklet/EngineContext.ts"
import {Box} from "box"
import {AudioBusProcessor} from "@core/worklet/AudioBusProcessor.ts"
import {AudioBusBoxAdapter} from "@core/shared/adapters/audio-unit/AudioBusBoxAdapter.ts"
import {VaporisateurDeviceProcessor} from "@core/worklet/devices/instruments/VaporisateurDeviceProcessor.ts"
import {TapeDeviceProcessor} from "@core/worklet/devices/instruments/TapeDeviceProcessor.ts"
import {TapeDeviceBoxAdapter} from "@core/shared/adapters/devices/instruments/TapeDeviceBoxAdapter.ts"
import {
    VaporisateurDeviceBoxAdapter
} from "@core/shared/adapters/devices/instruments/VaporisateurDeviceBoxAdapter.ts"
import {ArpeggioDeviceBoxAdapter} from "@core/shared/adapters/devices/midi-effects/ArpeggioDeviceBoxAdapter.ts"
import {ArpeggioDeviceProcessor} from "./devices/midi-effects/ArpeggioDeviceProcessor.ts"
import {PitchDeviceProcessor} from "./devices/midi-effects/PitchDeviceProcessor.ts"
import {PitchDeviceBoxAdapter} from "@core/shared/adapters/devices/midi-effects/PitchDeviceBoxAdapter.ts"
import {RevampDeviceProcessor} from "@core/worklet/devices/audio-effects/RevampDeviceProcessor.ts"
import {ReverbDeviceProcessor} from "@core/worklet/devices/audio-effects/ReverbDeviceProcessor.ts"
import {NanoDeviceBoxAdapter} from "@core/shared/adapters/devices/instruments/NanoDeviceBoxAdapter.ts"
import {NanoDeviceProcessor} from "./devices/instruments/NanoDeviceProcessor.ts"
import {PlayfieldDeviceProcessor} from "./devices/instruments/PlayfieldDeviceProcessor.ts"
import {PlayfieldDeviceBoxAdapter} from "@core/shared/adapters/devices/instruments/PlayfieldDeviceBoxAdapter.ts"
import {
    StereoToolDeviceBoxAdapter
} from "@core/shared/adapters/devices/audio-effects/StereoToolDeviceBoxAdapter.ts"
import {StereoToolDeviceProcessor} from "./devices/audio-effects/StereoToolDeviceProcessor.ts"
import {ZeitgeistDeviceProcessor} from "@core/worklet/devices/midi-effects/ZeitgeistDeviceProcessor.ts"
import {ZeitgeistDeviceBoxAdapter} from "@core/shared/adapters/devices/midi-effects/ZeitgeistDeviceBoxAdapter.ts"

export namespace InstrumentDeviceProcessorFactory {
    export const create = (context: EngineContext,
                           box: Box): Nullish<InstrumentDeviceProcessor | AudioBusProcessor> =>
        box.accept<BoxVisitor<InstrumentDeviceProcessor | AudioBusProcessor>>({
            visitAudioBusBox: (box: AudioBusBox) =>
                new AudioBusProcessor(context, context.boxAdapters.adapterFor(box, AudioBusBoxAdapter)),
            visitVaporisateurDeviceBox: (box: VaporisateurDeviceBox) =>
                new VaporisateurDeviceProcessor(context, context.boxAdapters.adapterFor(box, VaporisateurDeviceBoxAdapter)),
            visitNanoDeviceBox: (box: NanoDeviceBox) =>
                new NanoDeviceProcessor(context, context.boxAdapters.adapterFor(box, NanoDeviceBoxAdapter)),
            visitTapeDeviceBox: (box: TapeDeviceBox) =>
                new TapeDeviceProcessor(context, context.boxAdapters.adapterFor(box, TapeDeviceBoxAdapter)),
            visitPlayfieldDeviceBox: (box: PlayfieldDeviceBox) =>
                new PlayfieldDeviceProcessor(context, context.boxAdapters.adapterFor(box, PlayfieldDeviceBoxAdapter))
        })
}

export namespace MidiEffectDeviceProcessorFactory {
    export const create = (context: EngineContext,
                           box: Box): MidiEffectProcessor =>
        asDefined(box.accept<BoxVisitor<MidiEffectProcessor>>({
            visitArpeggioDeviceBox: (box: ArpeggioDeviceBox): MidiEffectProcessor =>
                new ArpeggioDeviceProcessor(context, context.boxAdapters.adapterFor(box, ArpeggioDeviceBoxAdapter)),
            visitPitchDeviceBox: (box: PitchDeviceBox): MidiEffectProcessor =>
                new PitchDeviceProcessor(context, context.boxAdapters.adapterFor(box, PitchDeviceBoxAdapter)),
            visitZeitgeistDeviceBox: (box: ZeitgeistDeviceBox): MidiEffectProcessor =>
                new ZeitgeistDeviceProcessor(context, context.boxAdapters.adapterFor(box, ZeitgeistDeviceBoxAdapter))
        }), `Could not create midi-effect for'${box.name}'`)
}

export namespace AudioEffectDeviceProcessorFactory {
    export const create = (context: EngineContext,
                           box: Box): AudioEffectDeviceProcessor =>
        asDefined(box.accept<BoxVisitor<AudioEffectDeviceProcessor>>({
            visitStereoToolDeviceBox: (box: StereoToolDeviceBox): AudioEffectDeviceProcessor =>
                new StereoToolDeviceProcessor(context, context.boxAdapters.adapterFor(box, StereoToolDeviceBoxAdapter)),
            visitDelayDeviceBox: (box: DelayDeviceBox): AudioEffectDeviceProcessor =>
                new DelayDeviceProcessor(context, context.boxAdapters.adapterFor(box, DelayDeviceBoxAdapter)),
            visitReverbDeviceBox: (box: ReverbDeviceBox): AudioEffectDeviceProcessor =>
                new ReverbDeviceProcessor(context, context.boxAdapters.adapterFor(box, ReverbDeviceBoxAdapter)),
            visitRevampDeviceBox: (box: RevampDeviceBox): AudioEffectDeviceProcessor =>
                new RevampDeviceProcessor(context, context.boxAdapters.adapterFor(box, RevampDeviceBoxAdapter)),
            visitModularDeviceBox: (box: ModularDeviceBox): AudioEffectDeviceProcessor =>
                new NopDeviceProcessor(context, context.boxAdapters.adapterFor(box, ModularDeviceBoxAdapter))
        }), `Could not create audio-effect for'${box.name}'`)
}