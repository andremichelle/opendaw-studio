import css from "./StereoToolDeviceEditor.sass?inline"
import {
    StereoToolDeviceBoxAdapter
} from "studio-adapters"
import {Lifecycle} from "lib-std"
import {createElement} from "lib-jsx"
import {DeviceEditor} from "@/ui/devices/DeviceEditor.tsx"
import {Project} from "@/project/Project.ts"
import {ControlBuilder} from "@/ui/devices/ControlBuilder.tsx"
import {DevicePeakMeter} from "@/ui/devices/panel/DevicePeakMeter.tsx"
import {Html} from "lib-dom"
import {Effects} from "@/service/Effects"
import {SnapCenter, SnapCommonDecibel} from "@/ui/configs"
import {LKR} from "@/ui/devices/constants"
import {Colors} from "@/ui/Colors"
import {Column} from "@/ui/devices/Column"
import {Checkbox} from "@/ui/components/Checkbox"
import {EditWrapper} from "@/ui/wrapper/EditWrapper.ts"
import {Icon} from "@/ui/components/Icon"
import {IconSymbol} from "studio-adapters"
import {ControlIndicator} from "@/ui/components/ControlIndicator"
import {AutoGainButton} from "./StereoToolDeviceEditor/AutoGainButton"
import {MenuItem} from "@/ui/model/menu-item"
import {StereoMatrix} from "lib-dsp"
import {MenuItems} from "../menu-items"
import {DeviceHost} from "studio-adapters"

const className = Html.adoptStyleSheet(css, "StereoToolDeviceEditor")

type Construct = {
    lifecycle: Lifecycle
    project: Project
    adapter: StereoToolDeviceBoxAdapter
    deviceHost: DeviceHost
}

export const StereoToolDeviceEditor = ({lifecycle, project, adapter, deviceHost}: Construct) => {
    const {volume, panning, stereo, invertL, invertR, swap} = adapter.namedParameter
    const {editing, midiDevices} = project
    const panningMixing = adapter.box.panningMixing
    return (
        <DeviceEditor lifecycle={lifecycle}
                      project={project}
                      adapter={adapter}
                      populateMenu={parent => {
                          parent.addMenuItem(
                              MenuItem.default({label: "Panning"})
                                  .setRuntimeChildrenProcedure(parent => parent.addMenuItem(
                                      MenuItems.createForValue(editing, "Linear", panningMixing, StereoMatrix.Mixing.Linear),
                                      MenuItems.createForValue(editing, "Equal Power", panningMixing, StereoMatrix.Mixing.EqualPower)
                                  )))
                          MenuItems.forEffectDevice(parent, project, deviceHost, adapter)
                      }}
                      populateControls={() => (
                          <div className={className}>
                              {ControlBuilder.createKnob({
                                  lifecycle,
                                  editing,
                                  midiDevices,
                                  adapter,
                                  parameter: volume,
                                  options: SnapCommonDecibel
                              })}
                              <AutoGainButton lifecycle={lifecycle} project={project} adapter={adapter}/>
                              {ControlBuilder.createKnob({
                                  lifecycle,
                                  editing,
                                  midiDevices,
                                  adapter,
                                  parameter: panning,
                                  options: SnapCenter,
                                  anchor: 0.5
                              })}
                              {ControlBuilder.createKnob({
                                  lifecycle,
                                  editing,
                                  midiDevices,
                                  adapter,
                                  parameter: stereo,
                                  options: SnapCenter,
                                  anchor: 0.5
                              })}
                              <div className="checkboxes">
                                  <Column ems={LKR.slice(2)} color={Colors.cream}>
                                      <h5>L-</h5>
                                      <ControlIndicator lifecycle={lifecycle} parameter={invertL}>
                                          <Checkbox lifecycle={lifecycle}
                                                    model={EditWrapper.forAutomatableParameter(editing, invertL)}
                                                    appearance={{
                                                        color: Colors.cream,
                                                        activeColor: Colors.red,
                                                        framed: false,
                                                        cursor: "pointer"
                                                    }}>
                                              <Icon symbol={IconSymbol.Invert}/>
                                          </Checkbox>
                                      </ControlIndicator>
                                  </Column>
                                  <Column ems={LKR.slice(2)} color={Colors.cream}>
                                      <h5>R-</h5>
                                      <ControlIndicator lifecycle={lifecycle} parameter={invertR}>
                                          <Checkbox lifecycle={lifecycle}
                                                    model={EditWrapper.forAutomatableParameter(editing, invertR)}
                                                    appearance={{
                                                        color: Colors.cream,
                                                        activeColor: Colors.red,
                                                        framed: false,
                                                        cursor: "pointer"
                                                    }}>
                                              <Icon symbol={IconSymbol.Invert}/>
                                          </Checkbox>
                                      </ControlIndicator>
                                  </Column>
                                  <Column ems={LKR.slice(2)} color={Colors.cream}>
                                      <h5>LR</h5>
                                      <ControlIndicator lifecycle={lifecycle} parameter={swap}>
                                          <Checkbox lifecycle={lifecycle}
                                                    model={EditWrapper.forAutomatableParameter(editing, swap)}
                                                    appearance={{
                                                        color: Colors.cream,
                                                        activeColor: Colors.blue,
                                                        framed: false,
                                                        cursor: "pointer"
                                                    }}>
                                              <Icon symbol={IconSymbol.Swap}/>
                                          </Checkbox>
                                      </ControlIndicator>
                                  </Column>
                              </div>
                          </div>)}
                      populateMeter={() => (
                          <DevicePeakMeter lifecycle={lifecycle}
                                           receiver={project.liveStreamReceiver}
                                           address={adapter.address}/>
                      )}
                      icon={Effects.AudioNamed.StereoTool.icon}/>
    )
}