import {Func, Provider} from "./lang"
import {Option} from "./option"

export interface Attempt<RESULT, FAILURE = unknown> {
    isFailure(): boolean
    isSuccess(): boolean
    result(): RESULT
    failureReason(): FAILURE
    asOption(): Option<RESULT>
    map<U>(map: Func<RESULT, U>): Attempt<U, FAILURE>
    flatMap<U, R>(map: Func<RESULT, Attempt<U, R>>): Attempt<U, FAILURE | R>
    match<RETURN>(matchable: Attempts.Matchable<RESULT, FAILURE, RETURN>): RETURN
    toVoid(): Attempt<void, FAILURE>
    failure<NOT>(): Attempt<NOT, FAILURE>
    toString(): string
}

export namespace Attempts {
    export interface Matchable<RESULT, FAILURE, RETURN> {
        ok: Func<RESULT, RETURN>
        err: Func<FAILURE, RETURN>
    }

    export const async = <RESULT, FAILURE>(promise: Promise<RESULT>): Promise<Attempt<RESULT, FAILURE>> =>
        promise.then(value => Attempts.ok(value), reason => Attempts.err(reason))

    export const tryGet = <RESULT, FAILURE>(provider: Provider<RESULT>): Attempt<RESULT, FAILURE> => {
        try {return Attempts.ok(provider())} catch (reason) {return Attempts.err(reason as FAILURE)}
    }

    export const ok = <RESULT>(result: RESULT): Attempt<RESULT, never> => new class implements Attempt<RESULT, never> {
        constructor(private readonly value: RESULT) {}
        readonly asOption = (): Option<RESULT> => Option.wrap(this.value)
        readonly failureReason = (): never => {throw new Error("Attempt was successful.")}
        readonly isFailure = (): boolean => false
        readonly isSuccess = (): boolean => true
        readonly result = (): RESULT => this.value
        readonly map = <U, R>(map: Func<RESULT, U>): Attempt<U, R> => {
            try {return ok(map(this.value))} catch (reason) {return err(reason as R)}
        }
        readonly flatMap = <U, R>(map: Func<RESULT, Attempt<U, R>>): Attempt<U, R> => map(this.value)
        readonly match = <RETURN>(matchable: Matchable<RESULT, never, RETURN>): RETURN => matchable.ok(this.value)
        readonly toVoid = (): Attempt<void, never> => Attempts.ok(undefined)
        readonly failure = <NOT>(): Attempt<NOT, never> => {throw new Error("Attempt was successful.")}
        readonly toString = (): string => `{Success: ${this.value}`
        get [Symbol.toStringTag]() {return "Success"}
    }(result)

    export const Ok = new class implements Attempt<void, never> {
        constructor() {}
        readonly asOption = (): Option<never> => Option.None
        readonly failureReason = (): never => {throw new Error("Attempt was successful.")}
        readonly isFailure = (): boolean => false
        readonly isSuccess = (): boolean => true
        readonly result = (): void => undefined
        readonly map = <U>(map: Func<void, U>): Attempt<U, never> => ok(map())
        readonly flatMap = <U, R>(map: Func<void, Attempt<U, R>>): Attempt<U, R> => map()
        readonly match = <RETURN>(matchable: Matchable<void, never, RETURN>): RETURN => matchable.ok()
        readonly toVoid = (): Attempt<void, never> => Attempts.ok(undefined)
        readonly failure = <NOT>(): Attempt<NOT, never> => {throw new Error("Attempt was successful.")}
        readonly toString = (): string => `{Success: Ok`
        get [Symbol.toStringTag](): string {return "Success"}
    }()

    export const err = <RESULT = never, FAILURE = unknown>(reason: FAILURE): Attempt<RESULT, FAILURE> =>
        new class implements Attempt<never, FAILURE> {
            constructor(private readonly reason: FAILURE) {}
            readonly asOption = (): Option<never> => Option.None
            readonly failureReason = (): FAILURE => this.reason
            readonly isFailure = (): boolean => true
            readonly isSuccess = (): boolean => false
            readonly result = (): never => {throw new Error(`No result because '${this.reason}'`)}
            readonly map = (): Attempt<never, FAILURE> => this
            readonly flatMap = <_, R>(): Attempt<never, FAILURE | R> => this
            readonly match = <RETURN>(matchable: Matchable<never, FAILURE, RETURN>): RETURN => matchable.err(this.reason)
            readonly toVoid = (): Attempt<void, FAILURE> => Attempts.err(this.reason)
            readonly failure = <NOT>(): Attempt<NOT, FAILURE> => this
            readonly toString = (): string => `{Failure: ${this.reason}`
            get [Symbol.toStringTag](): string {return "Failure"}
        }(reason)
}