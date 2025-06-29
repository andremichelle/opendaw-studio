import {byte, float, Lifecycle, Terminable} from "opendaw-std"
import {createElement} from "opendaw-jsx"
import {DeviceEditor} from "@/ui/devices/DeviceEditor.tsx"
import {MenuItems} from "@/ui/devices/menu-items.ts"
import {Project} from "@/project/Project.ts"
import {DevicePeakMeter} from "@/ui/devices/panel/DevicePeakMeter.tsx"
import {Instruments} from "@/service/Instruments"
import {DeviceHost} from "studio-shared"
import {
    PlayfieldSampleBoxAdapter
} from "studio-shared"
import {NoteSender, NoteSustainer} from "studio-shared"
import {SlotEditor} from "@/ui/devices/instruments/PlayfieldDeviceEditor/SlotEditor"
import {Colors} from "@/ui/Colors"
import {Events} from "opendaw-dom"
import {Icon} from "@/ui/components/Icon"
import {IconSymbol} from "studio-shared"
import {TextTooltip} from "@/ui/surface/TextTooltip"

type Construct = {
    lifecycle: Lifecycle
    project: Project
    adapter: PlayfieldSampleBoxAdapter
    deviceHost: DeviceHost
}

export const PlayfieldSampleEditor = ({lifecycle, project, adapter, deviceHost}: Construct) => {
    const audioUnitBoxAdapter = deviceHost.audioUnitBoxAdapter()
    const noteSender: NoteSender = {
        noteOn: (note: byte, velocity: float) => project.service.engine.noteOn(audioUnitBoxAdapter.uuid, note, velocity),
        noteOff: (note: byte) => project.service.engine.noteOff(audioUnitBoxAdapter.uuid, note)
    }
    const fileName = adapter.file().mapOr(file => file.box.fileName.getValue(), "N/A")
    const deviceName = adapter.device().labelField.getValue()
    const goDevice = () => project.userEditingManager.audioUnit.edit(deviceHost.audioUnitBoxAdapter().box.editing)
    return (
        <DeviceEditor lifecycle={lifecycle}
                      project={project}
                      adapter={adapter}
                      populateMenu={parent => MenuItems.forAudioUnitInput(parent, project, deviceHost)}
                      populateControls={() => (
                          <SlotEditor lifecycle={lifecycle}
                                      service={project.service}
                                      adapter={adapter}/>
                      )}
                      populateMeter={() => (
                          <DevicePeakMeter lifecycle={lifecycle}
                                           receiver={project.liveStreamReceiver}
                                           address={adapter.peakAddress}/>
                      )}
                      createLabel={() => {
                          const deviceLabel: HTMLElement = (
                              <span onclick={goDevice}
                                    style={{
                                        cursor: "pointer",
                                        backgroundColor: Colors.green,
                                        height: "1.25em",
                                        lineHeight: "1.25em",
                                        borderRadius: "2px",
                                        padding: "0 0.125em",
                                        color: "rgba(0, 0, 0, 0.8)"
                                    }}>{deviceName}</span>
                          )
                          const playLabel: HTMLElement = (
                              <div
                                  style={{
                                      display: "inline-flex",
                                      columnGap: "0.5em",
                                      alignItems: "center",
                                      cursor: "pointer"
                                  }}>
                                  <Icon symbol={IconSymbol.Play}/> {fileName}
                              </div>)
                          let noteLifeTime = Terminable.Empty
                          lifecycle.ownAll(
                              Terminable.create(() => noteLifeTime.terminate()),
                              TextTooltip.default(deviceLabel, () => "Go back to device"),
                              TextTooltip.default(playLabel, () => "Play sample"),
                              Events.subscribe(playLabel, "pointerdown", ({pointerId}: PointerEvent) => {
                                  playLabel.setPointerCapture(pointerId)
                                  noteLifeTime = NoteSustainer.start(noteSender, adapter.indexField.getValue())
                              }),
                              Events.subscribe(playLabel, "pointerup", () => noteLifeTime.terminate())
                          )
                          return (
                              <h1 style={{display: "flex", columnGap: "0.5em", alignItems: "center"}}>
                                  {deviceLabel}
                                  {playLabel}
                              </h1>
                          )
                      }}
                      icon={Instruments.Playfield.icon}/>
    )
}