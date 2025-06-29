import css from "./VUMeterPanel.sass?inline"
import {DefaultObservableValue, Lifecycle, Terminator, UUID} from "opendaw-std"
import {createElement} from "opendaw-jsx"
import {VUMeterDesign} from "@/ui/meter/VUMeterDesign.tsx"
import {StudioService} from "@/service/StudioService.ts"
import {Address} from "opendaw-box"
import {Html} from "opendaw-dom"

const className = Html.adoptStyleSheet(css, "VUMeterPanel")

type Construct = {
    lifecycle: Lifecycle
    service: StudioService
}

export const VUMeterPanel = ({lifecycle, service}: Construct) => {
    const peakL = lifecycle.own(new DefaultObservableValue(0.0))
    const peakR = lifecycle.own(new DefaultObservableValue(0.0))
    const runtime = lifecycle.own(new Terminator())
    lifecycle.own(service.sessionService.catchupAndSubscribe((owner) => {
        runtime.terminate()
        owner.getValue().match({
            none: () => {
                peakL.setValue(0.0)
                peakR.setValue(0.0)
            },
            some: ({project: {liveStreamReceiver}}) => {
                runtime.own(liveStreamReceiver.subscribeFloats(Address.compose(UUID.Lowest), peaks => {
                    const [pl, pr] = peaks
                    peakL.setValue(pl >= peakL.getValue() ? pl : peakL.getValue() * 0.98)
                    peakR.setValue(pr >= peakR.getValue() ? pr : peakR.getValue() * 0.98)
                }))
            }
        })
    }))
    return (
        <div className={className}>
            <div className="meters">
                <div><VUMeterDesign.Default model={peakL}/></div>
                <div><VUMeterDesign.Default model={peakR}/></div>
            </div>
        </div>
    )
}