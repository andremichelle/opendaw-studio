import {Project} from "@/project/Project.ts"
import {createElement, JsxValue} from "jsx"
import {
    ArpeggioDeviceBox,
    AudioBusBox,
    BoxVisitor,
    DelayDeviceBox,
    ModularDeviceBox,
    NanoDeviceBox,
    PitchDeviceBox,
    PlayfieldDeviceBox,
    PlayfieldSampleBox,
    RevampDeviceBox,
    ReverbDeviceBox,
    StereoToolDeviceBox,
    TapeDeviceBox,
    VaporisateurDeviceBox,
    ZeitgeistDeviceBox
} from "@core/data/boxes"
import {ArpeggioDeviceEditor} from "@/ui/devices/midi-effects/ArpeggioDeviceEditor.tsx"
import {ArpeggioDeviceBoxAdapter} from "@core/shared/adapters/devices/midi-effects/ArpeggioDeviceBoxAdapter.ts"
import {DelayDeviceEditor} from "@/ui/devices/audio-effects/DelayDeviceEditor.tsx"
import {DelayDeviceBoxAdapter} from "@core/shared/adapters/devices/audio-effects/DelayDeviceBoxAdapter.ts"
import {ReverbDeviceEditor} from "@/ui/devices/audio-effects/ReverbDeviceEditor.tsx"
import {ReverbDeviceBoxAdapter} from "@core/shared/adapters/devices/audio-effects/ReverbDeviceBoxAdapter.ts"
import {RevampDeviceEditor} from "@/ui/devices/audio-effects/RevampDeviceEditor.tsx"
import {RevampDeviceBoxAdapter} from "@core/shared/adapters/devices/audio-effects/RevampDeviceBoxAdapter.ts"
import {ModularDeviceEditor} from "@/ui/devices/audio-effects/ModularDeviceEditor.tsx"
import {ModularDeviceBoxAdapter} from "@core/shared/adapters/devices/audio-effects/ModularDeviceBoxAdapter.ts"
import {asDefined, Lifecycle} from "std"
import {Box} from "box"
import {PitchDeviceEditor} from "./midi-effects/PitchDeviceEditor"
import {PitchDeviceBoxAdapter} from "@core/shared/adapters/devices/midi-effects/PitchDeviceBoxAdapter"
import {TapeDeviceEditor} from "@/ui/devices/instruments/TapeDeviceEditor.tsx"
import {TapeDeviceBoxAdapter} from "@core/shared/adapters/devices/instruments/TapeDeviceBoxAdapter.ts"
import {VaporisateurDeviceEditor} from "@/ui/devices/instruments/VaporisateurDeviceEditor.tsx"
import {
    VaporisateurDeviceBoxAdapter
} from "@core/shared/adapters/devices/instruments/VaporisateurDeviceBoxAdapter.ts"
import {AudioBusEditor} from "@/ui/devices/AudioBusEditor.tsx"
import {AudioBusBoxAdapter} from "@core/shared/adapters/audio-unit/AudioBusBoxAdapter.ts"
import {NanoDeviceBoxAdapter} from "@core/shared/adapters/devices/instruments/NanoDeviceBoxAdapter"
import {NanoDeviceEditor} from "./instruments/NanoDeviceEditor"
import {PlayfieldDeviceEditor} from "./instruments/PlayfieldDeviceEditor"
import {PlayfieldDeviceBoxAdapter} from "@core/shared/adapters/devices/instruments/PlayfieldDeviceBoxAdapter"
import {StereoToolDeviceEditor} from "./audio-effects/StereoToolDeviceEditor"
import {
    StereoToolDeviceBoxAdapter
} from "@core/shared/adapters/devices/audio-effects/StereoToolDeviceBoxAdapter"
import {DeviceHost} from "@core/shared/devices.ts"
import {
    PlayfieldSampleBoxAdapter
} from "@core/shared/adapters/devices/instruments/Playfield/PlayfieldSampleBoxAdapter"
import {PlayfieldSampleEditor} from "./instruments/PlayfieldSampleEditor"
import {ZeitgeistDeviceEditor} from "@/ui/devices/midi-effects/ZeitgeistDeviceEditor"
import {ZeitgeistDeviceBoxAdapter} from "@core/shared/adapters/devices/midi-effects/ZeitgeistDeviceBoxAdapter"

export namespace DeviceEditorFactory {
    export const toMidiEffectDeviceEditor = (project: Project, lifecycle: Lifecycle, box: Box, deviceHost: DeviceHost) =>
        asDefined(box.accept<BoxVisitor<JsxValue>>({
            visitArpeggioDeviceBox: (box: ArpeggioDeviceBox) => (
                <ArpeggioDeviceEditor lifecycle={lifecycle}
                                      project={project}
                                      adapter={project.boxAdapters.adapterFor(box, ArpeggioDeviceBoxAdapter)}
                                      deviceHost={deviceHost}/>
            ),
            visitPitchDeviceBox: (box: PitchDeviceBox) => (
                <PitchDeviceEditor lifecycle={lifecycle}
                                   project={project}
                                   adapter={project.boxAdapters.adapterFor(box, PitchDeviceBoxAdapter)}
                                   deviceHost={deviceHost}/>
            ),
            visitZeitgeistDeviceBox: (box: ZeitgeistDeviceBox) => (
                <ZeitgeistDeviceEditor lifecycle={lifecycle}
                                       project={project}
                                       adapter={project.boxAdapters.adapterFor(box, ZeitgeistDeviceBoxAdapter)}
                                       deviceHost={deviceHost}/>
            )
        }), `No MidiEffectDeviceEditor found for ${box}`)

    export const toInstrumentDeviceEditor = (project: Project, lifecycle: Lifecycle, box: Box, deviceHost: DeviceHost) =>
        asDefined(box.accept<BoxVisitor<JsxValue>>({
            visitTapeDeviceBox: (box: TapeDeviceBox): JsxValue => (
                <TapeDeviceEditor lifecycle={lifecycle}
                                  project={project}
                                  adapter={project.boxAdapters.adapterFor(box, TapeDeviceBoxAdapter)}
                                  deviceHost={deviceHost}/>
            ),
            visitVaporisateurDeviceBox: (box: VaporisateurDeviceBox): JsxValue => (
                <VaporisateurDeviceEditor lifecycle={lifecycle}
                                          project={project}
                                          adapter={project.boxAdapters.adapterFor(box, VaporisateurDeviceBoxAdapter)}
                                          deviceHost={deviceHost}/>
            ),
            visitNanoDeviceBox: (box: NanoDeviceBox): JsxValue => (
                <NanoDeviceEditor lifecycle={lifecycle}
                                  project={project}
                                  adapter={project.boxAdapters.adapterFor(box, NanoDeviceBoxAdapter)}
                                  deviceHost={deviceHost}/>
            ),
            visitPlayfieldDeviceBox: (box: PlayfieldDeviceBox): JsxValue => (
                <PlayfieldDeviceEditor lifecycle={lifecycle}
                                       project={project}
                                       adapter={project.boxAdapters.adapterFor(box, PlayfieldDeviceBoxAdapter)}
                                       deviceHost={deviceHost}/>
            ),
            visitPlayfieldSampleBox: (box: PlayfieldSampleBox): JsxValue => (
                <PlayfieldSampleEditor lifecycle={lifecycle}
                                       project={project}
                                       adapter={project.boxAdapters.adapterFor(box, PlayfieldSampleBoxAdapter)}
                                       deviceHost={deviceHost}/>
            ),
            visitAudioBusBox: (box: AudioBusBox): JsxValue => (
                <AudioBusEditor lifecycle={lifecycle}
                                project={project}
                                adapter={project.boxAdapters.adapterFor(box, AudioBusBoxAdapter)}/>
            )
        }), `No MidiEffectDeviceEditor found for ${box}`)

    export const toAudioEffectDeviceEditor = (project: Project, lifecycle: Lifecycle, box: Box, deviceHost: DeviceHost) =>
        asDefined(box.accept<BoxVisitor<JsxValue>>({
            visitStereoToolDeviceBox: (box: StereoToolDeviceBox) => (
                <StereoToolDeviceEditor lifecycle={lifecycle}
                                        project={project}
                                        adapter={project.boxAdapters.adapterFor(box, StereoToolDeviceBoxAdapter)}
                                        deviceHost={deviceHost}/>
            ),
            visitDelayDeviceBox: (box: DelayDeviceBox) => (
                <DelayDeviceEditor lifecycle={lifecycle}
                                   project={project}
                                   adapter={project.boxAdapters.adapterFor(box, DelayDeviceBoxAdapter)}
                                   deviceHost={deviceHost}/>
            ),
            visitReverbDeviceBox: (box: ReverbDeviceBox) => (
                <ReverbDeviceEditor lifecycle={lifecycle}
                                    project={project}
                                    adapter={project.boxAdapters.adapterFor(box, ReverbDeviceBoxAdapter)}
                                    deviceHost={deviceHost}/>
            ),
            visitRevampDeviceBox: (box: RevampDeviceBox) => (
                <RevampDeviceEditor lifecycle={lifecycle}
                                    project={project}
                                    adapter={project.boxAdapters.adapterFor(box, RevampDeviceBoxAdapter)}
                                    deviceHost={deviceHost}/>
            ),
            visitModularDeviceBox: (box: ModularDeviceBox) => (
                <ModularDeviceEditor lifecycle={lifecycle}
                                     project={project}
                                     adapter={project.boxAdapters.adapterFor(box, ModularDeviceBoxAdapter)}
                                     deviceHost={deviceHost}/>
            )
        }), `No AudioEffectDeviceEditor found for ${box}`)
}