import {Lifecycle, unitValue} from "lib-std"
import {Knob} from "@/ui/components/Knob.tsx"
import {ParameterLabel} from "@/ui/components/ParameterLabel.tsx"
import {createElement} from "lib-jsx"
import {AutomatableParameterFieldAdapter} from "studio-adapters"
import {DeviceBoxAdapter} from "studio-adapters"
import {Editing} from "lib-box"
import {MidiDevices} from "@/midi/devices/MidiDevices"

type Construct = {
    lifecycle: Lifecycle
    editing: Editing
    midiDevices: MidiDevices,
    adapter: DeviceBoxAdapter
    parameter: AutomatableParameterFieldAdapter
    anchor: unitValue
}

export const LabelKnob = ({lifecycle, editing, midiDevices, adapter, parameter, anchor}: Construct) => {
    return (
        <div style={{display: "contents"}}>
            <Knob lifecycle={lifecycle} value={parameter} anchor={anchor}/>
            <ParameterLabel lifecycle={lifecycle}
                            editing={editing}
                            midiDevices={midiDevices}
                            adapter={adapter}
                            parameter={parameter}/>
        </div>
    )
}