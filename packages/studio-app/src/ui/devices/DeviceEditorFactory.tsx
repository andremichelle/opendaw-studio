import {Project} from "@/project/Project.ts"
import {createElement, JsxValue} from "opendaw-jsx"
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
} from "studio-boxes"
import {ArpeggioDeviceEditor} from "@/ui/devices/midi-effects/ArpeggioDeviceEditor.tsx"
import {ArpeggioDeviceBoxAdapter} from "studio-shared"
import {DelayDeviceEditor} from "@/ui/devices/audio-effects/DelayDeviceEditor.tsx"
import {DelayDeviceBoxAdapter} from "studio-shared"
import {ReverbDeviceEditor} from "@/ui/devices/audio-effects/ReverbDeviceEditor.tsx"
import {ReverbDeviceBoxAdapter} from "studio-shared"
import {RevampDeviceEditor} from "@/ui/devices/audio-effects/RevampDeviceEditor.tsx"
import {RevampDeviceBoxAdapter} from "studio-shared"
import {ModularDeviceEditor} from "@/ui/devices/audio-effects/ModularDeviceEditor.tsx"
import {ModularDeviceBoxAdapter} from "studio-shared"
import {asDefined, Lifecycle} from "opendaw-std"
import {Box} from "opendaw-box"
import {PitchDeviceEditor} from "./midi-effects/PitchDeviceEditor"
import {PitchDeviceBoxAdapter} from "studio-shared"
import {TapeDeviceEditor} from "@/ui/devices/instruments/TapeDeviceEditor.tsx"
import {TapeDeviceBoxAdapter} from "studio-shared"
import {VaporisateurDeviceEditor} from "@/ui/devices/instruments/VaporisateurDeviceEditor.tsx"
import {
    VaporisateurDeviceBoxAdapter
} from "studio-shared"
import {AudioBusEditor} from "@/ui/devices/AudioBusEditor.tsx"
import {AudioBusBoxAdapter} from "studio-shared"
import {NanoDeviceBoxAdapter} from "studio-shared"
import {NanoDeviceEditor} from "./instruments/NanoDeviceEditor"
import {PlayfieldDeviceEditor} from "./instruments/PlayfieldDeviceEditor"
import {PlayfieldDeviceBoxAdapter} from "studio-shared"
import {StereoToolDeviceEditor} from "./audio-effects/StereoToolDeviceEditor"
import {
    StereoToolDeviceBoxAdapter
} from "studio-shared"
import {DeviceHost} from "studio-shared"
import {
    PlayfieldSampleBoxAdapter
} from "studio-shared"
import {PlayfieldSampleEditor} from "./instruments/PlayfieldSampleEditor"
import {ZeitgeistDeviceEditor} from "@/ui/devices/midi-effects/ZeitgeistDeviceEditor"
import {ZeitgeistDeviceBoxAdapter} from "studio-shared"

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