import {
    assert,
    Exec,
    InaccessibleProperty,
    int,
    Option,
    Provider,
    safeExecute,
    Terminable,
    TerminableOwner,
    TimeSpan
} from "opendaw-std"

export type Resolve<T> = (value: T) => void
export type Reject = (reason?: unknown) => void
export type ExecutorTuple<T> = { resolve: Resolve<T>; reject: Reject }
export type PromiseExecutor<T> = (resolve: Resolve<T>, reject: Reject) => void
export type RetryOption = { retry(reason: unknown, exec: Exec): boolean }

export class IntervalRetryOption implements RetryOption {
    #count: int = 0 | 0
    constructor(readonly maxRetry: int, readonly timeSpan: TimeSpan) {}
    retry(reason: unknown, exec: Exec): boolean {
        if (++this.#count === this.maxRetry) {return false}
        console.debug(`${reason} > will retry in ${this.timeSpan.toString()}`)
        setTimeout(exec, this.timeSpan.millis())
        return true
    }
}

export namespace Promises {
    class ResolveResult<T> {
        readonly status = "resolved"
        constructor(readonly value: T) {}
        error = InaccessibleProperty("Cannot access error when promise is resolved")
    }

    class RejectedResult {
        readonly status = "rejected"
        constructor(readonly error: unknown) {}
        value = InaccessibleProperty("Cannot access value when promise is rejected")
    }

    export const makeAbortable = async <T>(owner: TerminableOwner, promise: Promise<T>): Promise<T> => {
        let running = true
        owner.own(Terminable.create(() => running = false))
        return new Promise<T>((resolve, reject) =>
            promise.then(value => {if (running) {resolve(value)}}, reason => {if (running) {reject(reason)}}))
    }

    export const tryCatch = <T>(promise: Promise<T>): Promise<ResolveResult<T> | RejectedResult> =>
        promise.then(value => new ResolveResult(value), error => new RejectedResult(error))

    export const retry = <T>(
        call: Provider<Promise<T>>,
        retryOption: RetryOption = new IntervalRetryOption(3, TimeSpan.seconds(3))): Promise<T> =>
        call().catch(reason => new Promise<T>((resolve, reject) => {
            const onFailure = (reason: unknown) => {
                if (!retryOption.retry(reason, () => call().then((value: T) => resolve(value), onFailure))) {
                    reject(reason)
                }
            }
            onFailure(reason)
        }))

    // this is for testing the catch branch
    export const fail = <T>(after: TimeSpan, thenUse: Provider<Promise<T>>): Provider<Promise<T>> => {
        let use: Provider<Promise<T>> = () =>
            new Promise<T>((_, reject) => setTimeout(() => reject("fails first"), after.millis()))
        return () => {
            const promise: Promise<T> = use()
            use = thenUse
            return promise
        }
    }

    export const timeout = <T>(promise: Promise<T>, timeSpan: TimeSpan, fail?: string): Promise<T> => {
        return new Promise<T>((resolve, reject) => {
            let running: boolean = true
            const timeout = setTimeout(() => {
                running = false
                reject(new Error(fail ?? "timeout"))
            }, timeSpan.millis())
            promise
                .then((value) => {if (running) {resolve(value)}}, reason => {if (running) {reject(reason)}})
                .finally(() => clearTimeout(timeout))
        })
    }

    export const sequential = <T, R>(fn: (arg: T) => Promise<R>): (arg: T) => Promise<R> => {
        let lastPromise: Promise<any> = Promise.resolve(null)
        return (arg: T) => lastPromise = lastPromise.then(() => fn(arg))
    }

    export class Limit<T> {
        readonly #waiting: Array<[Provider<Promise<T>>, PromiseWithResolvers<T>]>

        #running: int = 0 | 0

        constructor(readonly max: int = 1) {
            this.#waiting = []
        }

        async add(provider: Provider<Promise<T>>): Promise<T> {
            if (this.#running < this.max) {
                this.#running++
                return provider().finally(() => this.#continue())
            } else {
                const resolvers: PromiseWithResolvers<T> = Promise.withResolvers<T>()
                this.#waiting.push([provider, resolvers])
                return resolvers.promise.finally(() => this.#continue())
            }
        }

        #continue(): void {
            assert(this.#running > 0, "Internal Error in Promises.Limit")
            if (--this.#running < this.max) {
                if (this.#waiting.length > 0) {
                    const [provider, {resolve, reject}] = this.#waiting.shift()!
                    this.#running++
                    provider().then(resolve, reject)
                }
            }
        }
    }

    export class Latest<T> implements Terminable {
        readonly #onResolve: Resolve<T>
        readonly #onReject: Reject
        readonly #onFinally?: Exec

        #latest: Option<Promise<T>> = Option.None

        constructor(onResolve: Resolve<T>, onReject: Reject, onFinally?: Exec) {
            this.#onResolve = onResolve
            this.#onReject = onReject
            this.#onFinally = onFinally
        }

        update(promise: Promise<T>): void {
            this.#latest = Option.wrap(promise)
            promise
                .then(value => {if (this.#latest.contains(promise)) {this.#onResolve(value)}})
                .catch(reason => {if (this.#latest.contains(promise)) {this.#onReject(reason)}})
                .finally(() => {
                    if (this.#latest.contains(promise)) {
                        this.terminate()
                        safeExecute(this.#onFinally)
                    }
                })
        }

        terminate(): void {this.#latest = Option.None}
    }
}