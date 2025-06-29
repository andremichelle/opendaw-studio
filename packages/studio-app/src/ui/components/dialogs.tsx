import {createElement, JsxValue} from "opendaw-jsx"
import {Button, Dialog, DialogHandler} from "@/ui/components/Dialog.tsx"
import {Arrays, Exec, isDefined, ObservableValue, Option, Procedure, Provider, Terminator, unitValue} from "opendaw-std"
import {Surface} from "@/ui/surface/Surface.tsx"
import {IconSymbol} from "studio-shared"
import {Box, BoxGraph} from "opendaw-box"
import {BoxDebugView} from "./BoxDebugView"
import {BoxesDebugView} from "@/ui/components/BoxesDebugView.tsx"
import {ProgressBar} from "@/ui/components/ProgressBar.tsx"
import {Colors} from "../Colors"
import EmailBody from "@/ErrorMail.txt?raw"
import {Errors} from "opendaw-dom"

export const showDialog = async ({headline, content, okText, buttons, origin}: {
    headline?: string,
    content: JsxValue,
    okText?: string,
    buttons?: ReadonlyArray<Button>
    origin?: Element
}): Promise<void> => {
    buttons ??= []
    let resolved = false
    const {resolve, reject, promise} = Promise.withResolvers<void>()
    const dialog: HTMLDialogElement = (
        <Dialog headline={headline ?? "Dialog"}
                icon={IconSymbol.System}
                cancelable={true}
                buttons={[...buttons, {
                    text: okText ?? "Ok",
                    primary: true,
                    onClick: handler => {
                        resolved = true
                        handler.close()
                        resolve()
                    }
                }]}>
            <div style={{padding: "1em 0"}}>{content}</div>
        </Dialog>
    )
    Surface.get(origin).body.appendChild(dialog)
    dialog.showModal()
    dialog.addEventListener("close", () => {if (!resolved) {reject()}}, {once: true})
    return promise
}

export const showInfoDialog = async ({headline, message, okText, buttons, origin}: {
    headline?: string,
    message: string,
    okText?: string,
    buttons?: ReadonlyArray<Button>
    origin?: Element
}): Promise<void> => showDialog({headline, content: (<p>{message}</p>), okText, buttons, origin})

type ApproveCreation = {
    headline?: string
    approveText?: string
    cancelText?: string
    reverse?: boolean
    message: string
    origin?: Element
}

export const showApproveDialog =
    ({headline, message, approveText, cancelText, reverse, origin}: ApproveCreation): Promise<void> => {
        reverse ??= false
        const {resolve, reject, promise} = Promise.withResolvers<void>()
        const buttons: Array<Button> = [{
            text: approveText ?? "Yes",
            primary: reverse,
            onClick: handler => {
                handler.close()
                resolve()
            }
        }, {
            text: cancelText ?? "Cancel",
            primary: !reverse,
            onClick: handler => {
                handler.close()
                reject(Errors.AbortError)
            }
        }]
        if (reverse) {buttons.reverse()}
        const dialog: HTMLDialogElement = (
            <Dialog headline={headline ?? "Approve"}
                    icon={IconSymbol.System}
                    cancelable={true}
                    buttons={buttons}>
                <div style={{padding: "1em 0"}}>
                    <p>{message}</p>
                </div>
            </Dialog>
        )
        Surface.get(origin).body.appendChild(dialog)
        dialog.showModal()
        return promise
    }

export const showProcessDialog = (headline: string,
                                  progress: ObservableValue<unitValue>,
                                  cancel?: Exec,
                                  origin?: Element): DialogHandler => {
    const lifecycle = new Terminator()
    const buttons: ReadonlyArray<Button> = isDefined(cancel)
        ? [{
            text: "Cancel",
            primary: true,
            onClick: handler => {
                cancel()
                handler.close()
            }
        }] : Arrays.empty()
    const dialog: HTMLDialogElement = (
        <Dialog headline={headline}
                icon={IconSymbol.System}
                cancelable={true}
                buttons={buttons}>
            <div style={{padding: "1em 0"}}>
                <ProgressBar lifecycle={lifecycle} progress={progress}/>
            </div>
        </Dialog>
    )
    Surface.get(origin).flyout.appendChild(dialog)
    dialog.addEventListener("close", () => lifecycle.terminate(), {once: true})
    dialog.showModal()
    return {close: () => {dialog.close()}}
}

export const showProcessMonolog = (headline: string,
                                   content?: HTMLElement,
                                   cancel?: Exec,
                                   origin?: Element): DialogHandler => {
    const lifecycle = new Terminator()
    const buttons: ReadonlyArray<Button> = isDefined(cancel)
        ? [{
            text: "Cancel",
            primary: true,
            onClick: handler => {
                cancel()
                handler.close()
            }
        }] : Arrays.empty()
    const dialog: HTMLDialogElement = (
        <Dialog headline={headline}
                icon={IconSymbol.System}
                cancelable={true}
                buttons={buttons}>
            {content}
        </Dialog>
    )
    Surface.get(origin).flyout.appendChild(dialog)
    dialog.addEventListener("close", () => lifecycle.terminate(), {once: true})
    dialog.showModal()
    return {close: () => {dialog.close()}}
}

export const showDebugBoxesDialog = (boxGraph: BoxGraph, origin?: Element): void => {
    const dialog: HTMLDialogElement = (
        <Dialog headline="Debug Box"
                icon={IconSymbol.System}
                cancelable={true}
                style={{minWidth: "24rem", minHeight: "24rem"}}
                buttons={[{
                    text: "Ok",
                    primary: true,
                    onClick: handler => handler.close()
                }]}>
            <div style={{padding: "1em 0"}}>
                <BoxesDebugView boxGraph={boxGraph}/>
            </div>
        </Dialog>
    )
    Surface.get(origin).body.appendChild(dialog)
    dialog.showModal()
}

export const showDebugBoxDialog = (box: Box, origin?: Element): void => {
    const dialog: HTMLDialogElement = (
        <Dialog headline="Debug Box"
                icon={IconSymbol.System}
                cancelable={true}
                style={{minWidth: "32rem", minHeight: "32rem"}}
                buttons={[{
                    text: "Ok",
                    primary: true,
                    onClick: handler => handler.close()
                }]}>
            <div style={{padding: "1em 0"}}>
                <BoxDebugView box={box}/>
            </div>
        </Dialog>
    )
    Surface.get(origin).body.appendChild(dialog)
    dialog.showModal()
}

export const showNewItemDialog = (headline: string, suggestion: string, factory: Procedure<string>): void => {
    const input: HTMLInputElement = <input type="text" value={suggestion} autofocus
                                           style={{
                                               width: "100%",
                                               backgroundColor: "rgba(0, 0, 0, 0.2)",
                                               outline: "none",
                                               border: "none"
                                           }}/>
    const dialog: HTMLDialogElement = (
        <Dialog headline={headline}
                icon={IconSymbol.Add}
                cancelable={true}
                buttons={[{
                    text: "Cancel",
                    primary: false,
                    onClick: handler => handler.close()
                }, {
                    text: "Create",
                    primary: true,
                    onClick: handler => {
                        factory(input.value)
                        handler.close()
                    }
                }]}>
            <div style={{padding: "1em 0"}}>{input}</div>
        </Dialog>
    )
    input.onfocus = () => input.select()
    input.onkeydown = event => {
        if (event.code === "Enter") {
            factory(input.value)
            dialog.close()
        }
    }
    document.body.appendChild(dialog)
    dialog.showModal()
}

export const showErrorDialog = (scope: string,
                                name: string,
                                message: string,
                                backupCommand: Option<Provider<Promise<void>>> = Option.None): void => {
    console.debug(`Recovery enabled: ${backupCommand}`)
    const dialog: HTMLDialogElement = (
        <Dialog headline="An error occurred :("
                icon={IconSymbol.Robot}
                buttons={backupCommand.nonEmpty() ? [{
                    text: "Recover",
                    onClick: () => {
                        const command = backupCommand.unwrap()
                        command().then(() => location.reload())
                    }
                }, {
                    text: "Dismiss",
                    onClick: () => location.reload()
                }, {
                    text: "EMail",
                    primary: true,
                    onClick: () => window.location.href =
                        `mailto:support@opendaw.org?subject=${
                            encodeURI("Bug Report - openDAW")}&body=${encodeURI(EmailBody)}`
                }] : Arrays.empty()}
                cancelable={false}
                error>
            <div style={{padding: "1em 0", maxWidth: "50vw"}}>
                <h3>{name}</h3>
                <p>{message}</p>
                {document.scripts.length > 1 &&
                    <p style={{color: Colors.red}}>
                        Something extra is running! A browser extension might be causing issues.<br/>
                        Try disabling extensions for this site.
                    </p>
                }
            </div>
        </Dialog>
    )
    document.body.appendChild(dialog)
    dialog.showModal()
}

export const showCacheDialog = (): void => {
    const dialog: HTMLDialogElement = (
        <Dialog headline="An error occurred :("
                icon={IconSymbol.Robot}
                buttons={[{
                    text: "Reload",
                    onClick: () => location.reload()
                }]}
                cancelable={false}
                error>
            <div style={{padding: "1em 0", maxWidth: "50vw"}}>
                <p>Caching Issue detected. Please clear browser cache and reload!</p>
                {document.scripts.length > 1 &&
                    <p style={{color: Colors.red, fontWeight: "bolder"}}>Browser extensions detected! Please disable
                        before reload!</p>}
            </div>
        </Dialog>
    )
    document.body.appendChild(dialog)
    dialog.showModal()
}