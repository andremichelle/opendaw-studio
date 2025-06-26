import css from "./ParameterLabel.sass?inline"
import {ControlSource, Lifecycle, Terminable} from "std"
import {createElement} from "jsx"
import {attachParameterContextMenu} from "@/ui/menu/automation.ts"
import {AutomatableParameterFieldAdapter} from "@core/shared/AutomatableParameterFieldAdapter.ts"
import {DeviceBoxAdapter} from "@core/shared/devices.ts"
import {Editing} from "box"
import {Html} from "dom"
import {MidiDevices} from "@/midi/devices/MidiDevices"

const className = Html.adoptStyleSheet(css, "ParameterLabel")

type Construct = {
    lifecycle: Lifecycle
    editing: Editing
    midiDevices: MidiDevices
    adapter: DeviceBoxAdapter
    parameter: AutomatableParameterFieldAdapter
    framed?: boolean
    standalone?: boolean
}

export const ParameterLabel = (
    {lifecycle, editing, midiDevices, adapter, parameter, framed, standalone}: Construct): HTMLLabelElement => {
    const element: HTMLLabelElement = (
        <label className={Html.buildClassList(className, framed && "framed")}/>
    )
    const onValueChange = (adapter: AutomatableParameterFieldAdapter) => {
        const printValue = adapter.stringMapping.x(adapter.valueMapping.y(adapter.getControlledUnitValue()))
        element.textContent = printValue.value
        element.setAttribute("unit", printValue.unit)
    }
    lifecycle.ownAll(
        standalone === true
            ? attachParameterContextMenu(editing, midiDevices,
                adapter.deviceHost().audioUnitBoxAdapter().tracks, parameter, element)
            : Terminable.Empty,
        parameter.catchupAndSubscribeControlSources({
            onControlSourceAdd: (source: ControlSource) => element.classList.add(source),
            onControlSourceRemove: (source: ControlSource) => element.classList.remove(source)
        }),
        parameter.subscribe(onValueChange)
    )
    onValueChange(parameter)
    return element
}