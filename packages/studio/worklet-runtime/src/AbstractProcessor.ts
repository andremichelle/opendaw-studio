import {Arrays, Option, panic, Terminable, TerminableOwner, Terminator} from "lib-std"
import {PointerField, PrimitiveValues} from "lib-box"
import {AutomatableParameter} from "./AutomatableParameter"
import {Pointers} from "studio-enums"
import {ProcessInfo, Processor} from "./processing"
import {EngineContext} from "./EngineContext"
import {EventBuffer} from "./EventBuffer"
import {AutomatableParameterFieldAdapter} from "studio-adapters"

export abstract class AbstractProcessor implements Processor, TerminableOwner, Terminable {
    readonly #terminator = new Terminator()
    readonly #context: EngineContext
    readonly #eventInput: EventBuffer
    readonly #parameters: Array<AutomatableParameter>
    readonly #automatedParameters: Array<AutomatableParameter>

    #updateClockConnection: Option<Terminable> = Option.None

    constructor(context: EngineContext) {
        this.#context = context
        this.#eventInput = new EventBuffer()
        this.#parameters = []
        this.#automatedParameters = []
    }

    abstract reset(): void
    abstract process(processInfo: ProcessInfo): void

    parameterChanged(parameter: AutomatableParameter): void {
        return panic(`Got update event for ${parameter}, but has no parameter change method`)
    }

    get context(): EngineContext {return this.#context}
    get eventInput(): EventBuffer {return this.#eventInput}

    bindParameter<T extends PrimitiveValues>(adapter: AutomatableParameterFieldAdapter<T>): AutomatableParameter<T> {
        const parameter = new AutomatableParameter<T>(this.#context, adapter)
        parameter.ownAll(
            adapter.field.pointerHub.catchupAndSubscribeTransactual({
                onAdd: (_pointer: PointerField) => {
                    if (this.#updateClockConnection.isEmpty()) {
                        this.#updateClockConnection = Option.wrap(this.#context.updateClock.addEventOutput(this.#eventInput))
                    }
                    this.#automatedParameters.push(parameter)
                    parameter.onStartAutomation()
                },
                onRemove: (_pointer: PointerField) => {
                    Arrays.remove(this.#automatedParameters, parameter)
                    if (this.#automatedParameters.length === 0) {
                        this.#updateClockConnection.ifSome(connection => connection.terminate())
                        this.#updateClockConnection = Option.None
                    }
                    parameter.onStopAutomation()
                }
            }, Pointers.Automation),
            parameter.subscribe(() => this.parameterChanged(parameter))
        )
        this.#parameters.push(parameter)
        return parameter
    }

    updateParameter(position: number): void {
        this.#automatedParameters.forEach((parameter: AutomatableParameter) => {
            if (parameter.updateAutomation(position)) {
                this.parameterChanged(parameter)
            }
        })
    }

    readAllParameters(): void {this.#parameters.forEach(parameter => this.parameterChanged(parameter))}

    own<T extends Terminable>(terminable: T): T {return this.#terminator.own(terminable)}
    ownAll<T extends Terminable>(...terminables: T[]): void {return this.#terminator.ownAll(...terminables)}
    spawn(): Terminator {return this.#terminator.spawn()}

    terminate(): void {
        this.#updateClockConnection.ifSome(connection => connection.terminate())
        this.#updateClockConnection = Option.None
        this.#parameters.length = 0
        this.#terminator.terminate()
    }

    toString(): string {return `{${this.constructor.name}}`}
}