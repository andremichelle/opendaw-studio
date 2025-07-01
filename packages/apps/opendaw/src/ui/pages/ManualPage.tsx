import css from "./ManualPage.sass?inline"
import {Await, createElement, LocalLink, PageContext, PageFactory} from "lib-jsx"
import {StudioService} from "@/service/StudioService.ts"
import {Nullable} from "lib-std"
import {ThreeDots} from "@/ui/spinner/ThreeDots"
import {BackButton} from "@/ui/pages/BackButton"
import {Markdown} from "@/ui/Markdown"
import {Manuals} from "@/ui/pages/Manuals"
import {Html} from "lib-dom"

const className = Html.adoptStyleSheet(css, "ManualPage")

export const ManualPage: PageFactory<StudioService> = ({service, path}: PageContext<StudioService>) => {
    const extractSecondSegment = (path: string) => {
        const match = path.match(/^\/[^\/]+\/([^\/]+)\/?$/)
        return match ? match[1] : null
    }
    const page: Nullable<string> = extractSecondSegment(path)
    return (
        <div className={className}>
            <aside>
                <BackButton/>
                <nav>
                    {Manuals.map(([name, url]) => (<LocalLink href={url}>{name}</LocalLink>))}
                </nav>
            </aside>
            <div className="manual">
                <Await factory={() => fetch(`${page ?? "index"}.md?uuid=${service.buildInfo.uuid}`).then(x => x.text())}
                       failure={(error) => `Unknown request (${error.reason})`}
                       loading={() => <ThreeDots/>}
                       success={text => <Markdown text={text}/>}
                />
            </div>
        </div>
    )
}