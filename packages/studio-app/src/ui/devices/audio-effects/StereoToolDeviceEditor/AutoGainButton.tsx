import css from "./AutoGainButton.sass?inline"
import {Events, Html} from "opendaw-dom"
import {Lifecycle, Terminator} from "opendaw-std"
import {createElement} from "opendaw-jsx"
import {LKR} from "@/ui/devices/constants"
import {Colors} from "@/ui/Colors"
import {Column} from "@/ui/devices/Column"
import {Icon} from "@/ui/components/Icon"
import {IconSymbol} from "studio-shared"
import {gainToDb} from "opendaw-dsp"
import {Project} from "@/project/Project"
import {
    StereoToolDeviceBoxAdapter
} from "studio-shared"
import {Runtime} from "opendaw-runtime"

const className = Html.adoptStyleSheet(css, "AutoGainButton")

type Construct = {
    lifecycle: Lifecycle
    project: Project
    adapter: StereoToolDeviceBoxAdapter
}

export const AutoGainButton = ({lifecycle, project: {editing, liveStreamReceiver}, adapter}: Construct) => {
    const autoGainButton: HTMLDivElement = (
        <div className={className}>
            <Icon symbol={IconSymbol.AutoGain}/>
        </div>
    )
    let max = 0.0
    let startTime = 0.0
    let canProbe = true
    const probing = lifecycle.own(new Terminator())
    const minDuration = 1000 // ms
    const targetDb = -0.1
    const startProbing = () => {
        max = 0.0
        startTime = Date.now()
        autoGainButton.classList.add("probing")
        canProbe = false
    }
    const stopProbing = () => {
        probing.terminate()
        autoGainButton.classList.remove("probing")
        canProbe = true
        const volume = adapter.namedParameter.volume
        const normalizeDb = (volume.getValue() - gainToDb(max)) + targetDb
        if (normalizeDb > 48.0) {
            console.debug("greater than 48db. do nothing.")
        } else if (normalizeDb > 12.0) {
            console.debug("greater than 12db")
            editing.modify(() => volume.setValue(12.0))
        } else {
            editing.modify(() => volume.setValue(normalizeDb))
        }
    }
    lifecycle.ownAll(
        Events.subscribe(autoGainButton, "pointerdown", (event: PointerEvent) => {
            if (!canProbe) {return}
            autoGainButton.setPointerCapture(event.pointerId)
            startProbing()
            probing.ownAll(
                liveStreamReceiver.subscribeFloats(adapter.address, peaks => max = Math.max(peaks[0], peaks[1], max)),
                Events.subscribe(autoGainButton, "pointerup", () => {
                    const duration = Date.now() - startTime
                    if (duration < minDuration) {
                        probing.own(Runtime.scheduleTimeout(stopProbing, minDuration - duration))
                    } else {
                        stopProbing()
                    }
                }, {once: true})
            )
        })
    )
    return (
        <Column ems={LKR} color={Colors.cream}>
            <h5>Auto Gain</h5>
            {autoGainButton}
        </Column>
    )
}