import css from "./ErrorsPage.sass?inline"
import {Await, createElement, Group, PageContext, PageFactory} from "opendaw-jsx"
import {StudioService} from "@/service/StudioService.ts"
import {Html} from "opendaw-dom"
import {ThreeDots} from "@/ui/spinner/ThreeDots.tsx"
import {EmptyExec, Strings, TimeSpan} from "opendaw-std"
import {showDialog} from "@/ui/components/dialogs.tsx"
import {LogBuffer} from "@/errors/LogBuffer.ts"
import {Logs} from "@/ui/pages/errors/Logs.tsx"
import {Stack} from "@/ui/pages/errors/Stack.tsx"

const className = Html.adoptStyleSheet(css, "ErrorsPage")

type Entry = {
    id: string
    date: string
    user_agent: string
    build_uuid: string
    build_env: string
    build_date: string
    script_tags: string
    error_name: string
    error_message: string
    error_stack: string
    logs: string
}

export const ErrorsPage: PageFactory<StudioService> = ({}: PageContext<StudioService>) => {
    return (
        <div className={className}>
            <h1>Errors</h1>
            <p>This page shows all errors reported from users running openDAW in production, helping us identify and fix issues.</p>
            <Await factory={() => fetch(`https://logs.opendaw.studio/list.php`).then(x => x.json())}
                   failure={(error) => `Unknown request (${error.reason})`}
                   loading={() => <p>loading...</p>}
                   success={(json: ReadonlyArray<Entry>) => (
                       <div className="list">
                           <Group>
                               <h4>#</h4>
                               <h4>Time</h4>
                               <h4>Build</h4>
                               <h4>Type</h4>
                               <h4>Message</h4>
                               <h4>JS</h4>
                               <h4>Browser</h4>
                               <h4>Stack</h4>
                               <h4>Logs</h4>
                           </Group>
                           {json.map((log) => {
                                   const nowTime = new Date().getTime()
                                   const errorTime = new Date(log.date).getTime()
                                   const errorTimeString = TimeSpan.millis(errorTime - nowTime).toUnitString()
                                   const buildTimeString = TimeSpan.millis(new Date(log.build_date).getTime() - nowTime).toUnitString()
                               const userAgent = log.user_agent.replace(/^Mozilla\/[\d.]+\s*/, "")
                               const errorMessage = Strings.fallback(log.error_message, "No message")
                               return (
                                       <Group>
                                           <div>{log.id}</div>
                                           <div>{errorTimeString}</div>
                                           <div>{buildTimeString}</div>
                                           <div>{log.error_name}</div>
                                           <div className="error-message" title={errorMessage}>{errorMessage}</div>
                                           <div>{log.script_tags}</div>
                                           <div className="browser" title={userAgent}>{userAgent}</div>
                                           <div style={{cursor: "pointer"}}
                                                onclick={() => showDialog({
                                                    headline: "Error Stack",
                                                    content: (<Stack stack={log.error_stack}/>)
                                                }).catch(EmptyExec)}>
                                               📂
                                           </div>
                                           <div style={{cursor: "pointer"}}
                                                onclick={() => {
                                                    const entries = JSON.parse(log.logs) as Array<LogBuffer.Entry>
                                                    return showDialog({
                                                        headline: "Logs",
                                                        content: (
                                                            <Logs errorTime={errorTime}
                                                                  entries={entries.reverse()}/>
                                                        )
                                                    }).catch(EmptyExec)
                                                }}>
                                               📂
                                           </div>
                                       </Group>
                                   )
                               }
                           )}
                       </div>
                   )}/>
        </div>
    )
}