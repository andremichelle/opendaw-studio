import {DeviceBoxAdapter} from "studio-shared"
import {AutomatableParameterFieldAdapter} from "studio-shared"
import {Column} from "@/ui/devices/Column.tsx"
import {createElement} from "opendaw-jsx"
import {LKR} from "@/ui/devices/constants.ts"
import {Colors} from "@/ui/Colors.ts"
import {ParameterLabelKnob} from "@/ui/devices/ParameterLabelKnob.tsx"
import {TerminableOwner, ValueGuide} from "opendaw-std"
import {Editing, PrimitiveValues} from "opendaw-box"
import {MidiDevices} from "@/midi/devices/MidiDevices"

type Creation<T extends PrimitiveValues> = {
    lifecycle: TerminableOwner
    editing: Editing
    midiDevices: MidiDevices
    adapter: DeviceBoxAdapter
    parameter: AutomatableParameterFieldAdapter<T>
    options?: ValueGuide.Options
    anchor?: number
    color?: string
}

export namespace ControlBuilder {
    export const createKnob = <T extends PrimitiveValues, >
    ({lifecycle, editing, midiDevices, adapter, parameter, options, anchor, color}: Creation<T>) => {
        return (
            <Column ems={LKR} color={color ?? Colors.cream}>
                <h5>{parameter.name}</h5>
                <ParameterLabelKnob lifecycle={lifecycle}
                                    editing={editing}
                                    midiDevices={midiDevices}
                                    adapter={adapter}
                                    parameter={parameter}
                                    options={options}
                                    anchor={anchor}/>
            </Column>
        )
    }
}