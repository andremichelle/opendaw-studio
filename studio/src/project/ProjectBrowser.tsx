import css from "./ProjectBrowser.sass?inline"
import {StudioService} from "@/service/StudioService"
import {EmptyExec, Procedure, StringComparator, TimeSpan, UUID} from "std"
import {Projects} from "@/project/Projects"
import {Icon} from "@/ui/components/Icon"
import {IconSymbol} from "@core/IconSymbol.ts"
import {showApproveDialog} from "@/ui/components/dialogs"
import {Await, createElement, DomElement, Frag, Group} from "jsx"
import {ProjectMeta} from "@/project/ProjectMeta"
import {Html} from "dom"

const className = Html.adoptStyleSheet(css, "ProjectBrowser")

type Construct = {
    service: StudioService
    select: Procedure<[UUID.Format, ProjectMeta]>
}

export const ProjectBrowser = ({service, select}: Construct) => {
    const now = new Date().getTime()
    return (
        <div className={className}>
            <Await factory={() => Projects.listProjects()}
                   loading={() => <span>loading...</span>}
                   failure={({reason}) => (
                       <span>{reason instanceof DOMException ? reason.name : String(reason)}</span>
                   )}
                   success={projects => (
                       <Frag>
                           <header>
                               <div className="name">Name</div>
                               <div className="time">Modified</div>
                               <div/>
                           </header>
                           <div className="list">
                               {projects
                                   .toSorted((a, b) => -StringComparator(a.meta.modified, b.meta.modified))
                                   .map(({uuid, meta}) => {
                                       const icon: DomElement = <Icon symbol={IconSymbol.Delete}
                                                                      className="delete-icon"/>
                                       const timeString = TimeSpan.millis(new Date(meta.modified).getTime() - now).toUnitString()
                                       const row: HTMLElement = (
                                           <Group>
                                               <div className="labels" onclick={() => select([uuid, meta])}>
                                                   <div className="name">{meta.name}</div>
                                                   <div className="time">{timeString}</div>
                                               </div>
                                               {icon}
                                           </Group>
                                       )
                                       icon.onclick = (event) => {
                                           event.stopPropagation()
                                           showApproveDialog({
                                               headline: "Delete Project?",
                                               message: "Are you sure? This cannot be undone."
                                           }).then(() => service.deleteProject(uuid, meta).then(() => row.remove()), EmptyExec)
                                       }
                                       return row
                                   })}
                           </div>
                       </Frag>
                   )}/>
        </div>
    )
}