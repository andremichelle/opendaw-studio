import {Exec, Provider} from "opendaw-std"
import {createElement, replaceChildren} from "../create-element"
import {DomElement, JsxValue} from "../types"
import {Inject} from "../inject"

export type HotspotUpdater = { update: Exec }
export type HotSpotProps = { render: Provider<JsxValue>, ref: Inject.Ref<HotspotUpdater> }

export const Hotspot = ({render, ref}: HotSpotProps) => {
    const contents: DomElement = <div style={{display: "contents"}}/>
    replaceChildren(contents, render())
    ref.addTarget({update: () => replaceChildren(contents, render())})
    return contents
}