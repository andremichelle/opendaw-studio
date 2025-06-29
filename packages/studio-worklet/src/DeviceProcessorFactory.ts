import {AudioEffectDeviceProcessor, InstrumentDeviceProcessor, MidiEffectProcessor} from "./processors.ts"
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
} from "studio-boxes"
import {DelayDeviceProcessor} from "./devices/audio-effects/DelayDeviceProcessor.ts"
import {DelayDeviceBoxAdapter} from "studio-shared"
import {NopDeviceProcessor} from "./devices/audio-effects/NopDeviceProcessor.ts"
import {ReverbDeviceBoxAdapter} from "studio-shared"
import {RevampDeviceBoxAdapter} from "studio-shared"
import {ModularDeviceBoxAdapter} from "studio-shared"
import {asDefined, Nullish} from "opendaw-std"
import {EngineContext} from "./EngineContext.ts"
import {Box} from "opendaw-box"
import {AudioBusProcessor} from "./AudioBusProcessor.ts"
import {AudioBusBoxAdapter} from "studio-shared"
import {VaporisateurDeviceProcessor} from "./devices/instruments/VaporisateurDeviceProcessor.ts"
import {TapeDeviceProcessor} from "./devices/instruments/TapeDeviceProcessor.ts"
import {TapeDeviceBoxAdapter} from "studio-shared"
import {
    VaporisateurDeviceBoxAdapter
} from "studio-shared"
import {ArpeggioDeviceBoxAdapter} from "studio-shared"
import {ArpeggioDeviceProcessor} from "./devices/midi-effects/ArpeggioDeviceProcessor.ts"
import {PitchDeviceProcessor} from "./devices/midi-effects/PitchDeviceProcessor.ts"
import {PitchDeviceBoxAdapter} from "studio-shared"
import {RevampDeviceProcessor} from "./devices/audio-effects/RevampDeviceProcessor.ts"
import {ReverbDeviceProcessor} from "./devices/audio-effects/ReverbDeviceProcessor.ts"
import {NanoDeviceBoxAdapter} from "studio-shared"
import {NanoDeviceProcessor} from "./devices/instruments/NanoDeviceProcessor.ts"
import {PlayfieldDeviceProcessor} from "./devices/instruments/PlayfieldDeviceProcessor.ts"
import {PlayfieldDeviceBoxAdapter} from "studio-shared"
import {
    StereoToolDeviceBoxAdapter
} from "studio-shared"
import {StereoToolDeviceProcessor} from "./devices/audio-effects/StereoToolDeviceProcessor.ts"
import {ZeitgeistDeviceProcessor} from "./devices/midi-effects/ZeitgeistDeviceProcessor.ts"
import {ZeitgeistDeviceBoxAdapter} from "studio-shared"

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