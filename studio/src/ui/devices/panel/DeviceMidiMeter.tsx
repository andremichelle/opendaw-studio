import css from "./DeviceMidiMeter.sass?inline"
import {Lifecycle} from "std"
import {createElement, DomElement} from "jsx"
import {Address} from "box"
import {LiveStreamReceiver} from "fusion"
import {Colors} from "@/ui/Colors.ts"
import {Html} from "dom"
import {NoteStreamReceiver} from "@/audio-engine-shared/NoteStreamReceiver"

const className = Html.adoptStyleSheet(css, "DeviceMidiMeter")

type Construct = {
    lifecycle: Lifecycle
    receiver: LiveStreamReceiver
    address: Address
}

export const DeviceMidiMeter = ({lifecycle, receiver, address}: Construct) => {
    const size = 8
    const indicator: DomElement = (
        <circle cx={size / 2} cy={size / 2} r={size / 4} fill={Colors.shadow} visibility="hidden"/>
    )
    const streamReceiver = lifecycle.own(new NoteStreamReceiver(receiver, address))
    lifecycle.own(streamReceiver.subscribe(state =>
        indicator.style.visibility = state.isAnyNoteOn() ? "visible" : "hidden"))
    return (
        <svg classList={className} viewBox={`0 0 ${size} ${size}`} width={size} height={size}>{indicator}</svg>
    )
}