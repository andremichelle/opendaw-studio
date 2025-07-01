import css from "./Footer.sass?inline"
import {createElement} from "lib-jsx"
import {isDefined, Lifecycle, Terminator, TimeSpan} from "lib-std"
import {StudioService} from "@/service/StudioService"
import {ProjectMeta} from "@/project/ProjectMeta"
import {Surface} from "@/ui/surface/Surface"
import {Events, Html} from "lib-dom"
import {Runtime} from "lib-runtime"
import {FooterLabel} from "@/service/FooterLabel"

const className = Html.adoptStyleSheet(css, "footer")

type Construct = { lifecycle: Lifecycle, service: StudioService }

export const Footer = ({lifecycle, service}: Construct) => {
    const labelOnline: HTMLElement = (<div title="Online"/>)
    const updateOnline = () => labelOnline.textContent = navigator.onLine ? "Yes" : "No"
    lifecycle.ownAll(
        Events.subscribe(window, "online", updateOnline),
        Events.subscribe(window, "offline", updateOnline)
    )
    updateOnline()
    const labelName: HTMLElement = (
        <div className="name"
             title="Project"
             ondblclick={(event) => {
                 const optSession = service.sessionService.getValue()
                 if (optSession.isEmpty()) {return}
                 const session = optSession.unwrap()
                 const name = session.meta.name
                 if (isDefined(name)) {
                     Surface.get(labelName).requestFloatingTextInput(event, name)
                         .then(name => session.updateMetaData("name", name))
                 }
             }}/>
    )
    const sessionLifecycle = lifecycle.own(new Terminator())
    lifecycle.own(service.sessionService.catchupAndSubscribe(owner => {
        sessionLifecycle.terminate()
        const optSession = owner.getValue()
        if (optSession.nonEmpty()) {
            const session = optSession.unwrap()
            const observer = (meta: ProjectMeta) => labelName.textContent = meta.name
            sessionLifecycle.own(session.subscribeMetaData(observer))
            observer(session.meta)
        } else {
            labelName.textContent = "⏏︎"
        }
    }))
    const lastBuildTime = TimeSpan.millis(new Date(service.buildInfo.date).getTime() - new Date().getTime()).toUnitString()
    const labelLatency: HTMLElement = (<div title="Latency">N/A</div>)
    lifecycle.own(Runtime.scheduleInterval(() => {
        const outputLatency = service.context.outputLatency
        if (outputLatency > 0.0) {
            labelLatency.textContent = `${(outputLatency * 1000.0).toFixed(1)}ms`
        }
    }, 1000))
    const footer: HTMLElement = (
        <footer className={className}>
            {labelOnline}
            {labelName}
            <div title="SampleRate">{service.context.sampleRate}</div>
            {labelLatency}
            <div title="Build Version">{service.buildInfo.uuid}</div>
            <div title="Build Time">{lastBuildTime}</div>
        </footer>
    )
    service.registerFooter((): FooterLabel => {
        const label: HTMLElement = <div/>
        footer.appendChild(label)
        return {
            setTitle: (value: string) => label.title = value,
            setValue: (value: string) => label.textContent = value,
            terminate: () => {if (label.isConnected) {label.remove()}}
        } satisfies FooterLabel
    })
    return footer
}