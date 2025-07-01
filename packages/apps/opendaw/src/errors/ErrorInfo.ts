import {isDefined} from "lib-std"

export type ErrorInfo = {
    name: string
    message: string
    stack?: string
}

export namespace ErrorInfo {
    export const extract = (event: Event): ErrorInfo => {
        if (event instanceof ErrorEvent && event.error instanceof Error) {
            return {name: event.error.name || "Error", message: event.error.message, stack: event.error.stack}
        } else if (event instanceof PromiseRejectionEvent) {
            const reason = event.reason
            if (reason instanceof Error) {
                if (!isDefined(reason.stack)) {
                    try {
                        // noinspection ExceptionCaughtLocallyJS
                        throw reason
                    } catch (error) {
                        if (error instanceof Error) {
                            reason.stack = error.stack
                        }
                    }
                }
                return {
                    name: reason.name || "UnhandledRejection",
                    message: reason.message,
                    stack: reason.stack
                }
            } else {
                return {
                    name: "UnhandledRejection",
                    message: typeof reason === "string" ? reason : JSON.stringify(reason)
                }
            }
        } else if (event instanceof MessageEvent) {
            return {
                name: "MessageError",
                message: typeof event.data === "string" ? event.data : JSON.stringify(event.data)
            }
        } else if (event.type === "processorerror") {
            return {name: "ProcessorError", message: "N/A"}
        } else if (event instanceof SecurityPolicyViolationEvent) {
            return {name: "SecurityPolicyViolation", message: `${event.violatedDirective} blocked ${event.blockedURI}`}
        } else {
            return {name: "UnknownError", message: "Unknown error"}
        }
    }
}