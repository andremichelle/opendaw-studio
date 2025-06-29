import css from "./ParameterLabelKnob.sass?inline"
import {Lifecycle, unitValue, ValueGuide} from "opendaw-std"
import {createElement} from "opendaw-jsx"
import {RelativeUnitValueDragging} from "@/ui/wrapper/RelativeUnitValueDragging.tsx"
import {LabelKnob} from "@/ui/composite/LabelKnob.tsx"
import {AutomatableParameterFieldAdapter} from "studio-shared"
import {DeviceBoxAdapter} from "studio-shared"
import {Editing} from "opendaw-box"
import {attachParameterContextMenu} from "@/ui/menu/automation.ts"
import {Html} from "opendaw-dom"
import {MidiDevices} from "@/midi/devices/MidiDevices"

const className = Html.adoptStyleSheet(css, "ParameterLabelKnob")

type Construct = {
    lifecycle: Lifecycle
    editing: Editing
    midiDevices: MidiDevices
    adapter: DeviceBoxAdapter
    parameter: AutomatableParameterFieldAdapter
    options?: ValueGuide.Options
    anchor?: unitValue
}

export const ParameterLabelKnob = ({
                                       lifecycle,
                                       editing,
                                       midiDevices,
                                       adapter,
                                       parameter,
                                       options,
                                       anchor
                                   }: Construct) => {
    const element: HTMLElement = (
        <div className={className}>
            <RelativeUnitValueDragging lifecycle={lifecycle}
                                       editing={editing}
                                       parameter={parameter}
                                       options={options}>
                <LabelKnob lifecycle={lifecycle}
                           editing={editing}
                           midiDevices={midiDevices}
                           adapter={adapter}
                           parameter={parameter}
                           anchor={anchor ?? 0.0}/>
            </RelativeUnitValueDragging>
        </div>
    )
    lifecycle.own(
        attachParameterContextMenu(editing, midiDevices,
            adapter.deviceHost().audioUnitBoxAdapter().tracks, parameter, element))
    return element
}