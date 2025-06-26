import {DeviceBoxAdapter} from "@core/shared/devices.ts"
import {AutomatableParameterFieldAdapter} from "@core/shared/AutomatableParameterFieldAdapter.ts"
import {Column} from "@/ui/devices/Column.tsx"
import {createElement} from "jsx"
import {LKR} from "@/ui/devices/constants.ts"
import {Colors} from "@/ui/Colors.ts"
import {ParameterLabelKnob} from "@/ui/devices/ParameterLabelKnob.tsx"
import {TerminableOwner, ValueGuide} from "std"
import {Editing, PrimitiveValues} from "box"
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