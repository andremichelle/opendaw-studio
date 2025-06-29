import css from "./WorkspacePage.sass?inline"
import {isDefined, Iterables, Lifecycle, Nullable, Terminator, Unhandled} from "opendaw-std"
import {appendChildren, createElement, PageContext, PageFactory} from "opendaw-jsx"
import {StudioService} from "@/service/StudioService.ts"
import {Workspace} from "@/ui/workspace/Workspace.ts"
import {PanelPlaceholder} from "@/ui/workspace/PanelPlaceholder.tsx"
import {PanelResizer} from "@/ui/workspace/PanelResizer.tsx"
import {PanelContents} from "@/ui/workspace/PanelContents.tsx"
import {ContentGlue} from "@/ui/workspace/ContentGlue.ts"
import {Html} from "opendaw-dom"

const className = Html.adoptStyleSheet(css, "WorkspacePage")

const buildScreen = (lifecycle: Lifecycle,
                     panelContents: PanelContents,
                     element: HTMLElement,
                     screenKey: Nullable<Workspace.ScreenKeys>) => {
    Html.empty(element)
    if (screenKey === null) {return}
    const build = (container: HTMLElement,
                   siblings: ContentGlue[],
                   content: Workspace.Content,
                   next: Nullable<Workspace.Content>,
                   orientation: Workspace.Orientation) => {
        const element: HTMLElement = (() => {
            if (content.type === "panel") {
                return (
                    <PanelPlaceholder lifecycle={lifecycle}
                                      orientation={orientation}
                                      siblings={siblings}
                                      panelContents={panelContents}
                                      panelState={content}/>
                )
            } else if (content.type === "layout") {
                const section = (
                    <section className={Html.buildClassList("workspace", content.orientation)}>
                        <div className="fill"/>
                    </section>
                )
                const children: Array<ContentGlue> = []
                for (const [curr, next] of Iterables.pairWise(content.contents)) {
                    build(section, children, curr, next, content.orientation)
                }
                return section
            } else {
                return Unhandled(content)
            }
        })()
        siblings.push({element, content})
        appendChildren(container, element)
        if (content.constrains.type === "flex" && isDefined(next) && next.constrains.type === "flex") {
            container.appendChild(
                <PanelResizer lifecycle={lifecycle}
                              panelContents={panelContents}
                              target={element}
                              orientation={orientation}
                              siblings={siblings}/>
            )
        }
    }
    build(element, [], Workspace.Default[screenKey].content, null, "vertical")
}

export const WorkspacePage: PageFactory<StudioService> = ({lifecycle, service}: PageContext<StudioService>) => {
    const mainElement: HTMLElement = <main/>
    const screenLifeTime = lifecycle.own(new Terminator())
    lifecycle.own(service.layout.screen.catchupAndSubscribe(owner => {
        screenLifeTime.terminate()
        buildScreen(screenLifeTime, service.panelLayout, mainElement, owner.getValue())
    }))
    return (<div className={className}>{mainElement}</div>)
}