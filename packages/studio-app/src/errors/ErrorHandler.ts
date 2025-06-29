import {Terminable, Terminator} from "opendaw-std"
import {AnimationFrame, Browser, Events} from "opendaw-dom"
import {LogBuffer} from "@/errors/LogBuffer.ts"
import {ErrorLog} from "@/errors/ErrorLog.ts"
import {ErrorInfo} from "@/errors/ErrorInfo.ts"
import {Surface} from "@/ui/surface/Surface.tsx"
import {StudioService} from "@/service/StudioService.ts"
import {showErrorDialog} from "@/ui/components/dialogs.tsx"

export class ErrorHandler {
    readonly terminator = new Terminator()
    readonly #service: StudioService

    #errorThrown: boolean = false

    constructor(service: StudioService) {this.#service = service}

    processError(scope: string, event: Event) {
        console.debug("processError", scope, event)
        if (this.#errorThrown) {return}
        this.#errorThrown = true
        AnimationFrame.terminate()
        const error = ErrorInfo.extract(event)
        console.debug("ErrorInfo", error.name, error.message)
        const body = JSON.stringify({
            date: new Date().toISOString(),
            agent: Browser.userAgent,
            build: this.#service.buildInfo,
            scripts: document.scripts.length,
            error,
            logs: LogBuffer.get()
        } satisfies ErrorLog)
        if (import.meta.env.PROD) {
            fetch("https://logs.opendaw.studio/log.php", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body
            }).then(console.info, console.warn)
        }
        console.error(scope, error.name, error.message, error.stack)
        if (Surface.isAvailable()) {
            showErrorDialog(scope, error.name, error.message, this.#service.recovery.createBackupCommand())
        } else {
            alert(`Boot Error in '${scope}': ${error.name}`)
        }
    }

    install(owner: WindowProxy | Worker | AudioWorkletNode, scope: string): Terminable {
        if (this.#errorThrown) {return Terminable.Empty}
        const lifetime = this.terminator.own(new Terminator())
        lifetime.ownAll(
            Events.subscribe(owner, "error", event => {
                lifetime.terminate()
                this.processError(scope, event)
            }),
            Events.subscribe(owner, "unhandledrejection", event => {
                lifetime.terminate()
                this.processError(scope, event)
            }),
            Events.subscribe(owner, "messageerror", event => {
                lifetime.terminate()
                this.processError(scope, event)
            }),
            Events.subscribe(owner, "processorerror" as any, event => {
                lifetime.terminate()
                this.processError(scope, event)
            }),
            Events.subscribe(owner, "securitypolicyviolation", (event: SecurityPolicyViolationEvent) => {
                lifetime.terminate()
                this.processError(scope, event)
            })
        )
        return lifetime
    }
}