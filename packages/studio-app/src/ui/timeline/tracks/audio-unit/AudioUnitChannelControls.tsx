import css from "./AudioUnitChannelControls.sass?inline"
import {Lifecycle} from "lib-std"
import {RelativeUnitValueDragging} from "@/ui/wrapper/RelativeUnitValueDragging.tsx"
import {SnapCenter, SnapCommonDecibel} from "@/ui/configs.ts"
import {Knob} from "@/ui/components/Knob.tsx"
import {Colors} from "@/ui/Colors.ts"
import {Checkbox} from "@/ui/components/Checkbox.tsx"
import {Icon} from "@/ui/components/Icon.tsx"
import {createElement} from "lib-jsx"
import {Editing} from "lib-box"
import {EditWrapper} from "@/ui/wrapper/EditWrapper.ts"
import {IconSymbol} from "studio-adapters"
import {attachParameterContextMenu} from "@/ui/menu/automation.ts"
import {AudioUnitBoxAdapter} from "studio-adapters"
import {ControlIndicator} from "@/ui/components/ControlIndicator"
import {Html} from "lib-dom"
import {MidiDevices} from "@/midi/devices/MidiDevices"

const className = Html.adoptStyleSheet(css, "AudioUnitChannelControls")

type Construct = {
    lifecycle: Lifecycle
    editing: Editing
    midiDevices: MidiDevices
    adapter: AudioUnitBoxAdapter
}

export const AudioUnitChannelControls = ({lifecycle, editing, midiDevices, adapter}: Construct) => {
    const {volume, panning, mute, solo} = adapter.namedParameter
    const volumeControl = (
        <RelativeUnitValueDragging lifecycle={lifecycle}
                                   editing={editing}
                                   parameter={volume}
                                   options={SnapCommonDecibel}>
            <ControlIndicator lifecycle={lifecycle} parameter={volume}>
                <Knob lifecycle={lifecycle} value={volume} anchor={0.0} color={Colors.yellow}/>
            </ControlIndicator>
        </RelativeUnitValueDragging>
    )
    const panningControl = (
        <RelativeUnitValueDragging lifecycle={lifecycle}
                                   editing={editing}
                                   parameter={panning}
                                   options={SnapCenter}>
            <ControlIndicator lifecycle={lifecycle} parameter={panning}>
                <Knob lifecycle={lifecycle} value={panning} anchor={0.5} color={Colors.green}/>
            </ControlIndicator>
        </RelativeUnitValueDragging>
    )
    const muteControl = (
        <ControlIndicator lifecycle={lifecycle} parameter={mute}>
            <Checkbox lifecycle={lifecycle}
                      model={EditWrapper.forAutomatableParameter(editing, mute)}
                      appearance={{activeColor: Colors.red, framed: true}}>
                <Icon symbol={IconSymbol.Mute}/>
            </Checkbox>
        </ControlIndicator>
    )
    const soloControl = (
        <ControlIndicator lifecycle={lifecycle} parameter={solo}>
            <Checkbox lifecycle={lifecycle}
                      model={EditWrapper.forAutomatableParameter(editing, solo)}
                      appearance={{activeColor: Colors.yellow, framed: true}}>
                <Icon symbol={IconSymbol.Solo}/>
            </Checkbox>
        </ControlIndicator>
    )
    lifecycle.ownAll(
        attachParameterContextMenu(editing, midiDevices, adapter.tracks, volume, volumeControl),
        attachParameterContextMenu(editing, midiDevices, adapter.tracks, panning, panningControl),
        attachParameterContextMenu(editing, midiDevices, adapter.tracks, mute, muteControl),
        attachParameterContextMenu(editing, midiDevices, adapter.tracks, solo, soloControl)
    )
    return (
        <div className={className}>
            <div className="channel-mix">
                {volumeControl}
                {panningControl}
            </div>
            <div className="channel-isolation">
                {muteControl}
                {soloControl}
            </div>
        </div>
    )
}