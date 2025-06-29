import {BoxGraph} from "./graph"
import {Arrays, assert, int, Nullish, Option, Provider} from "lib-std"
import {Update} from "./updates"

class EditingStep {
    constructor(readonly updates: ReadonlyArray<Update>) {}
    undo(graph: BoxGraph): void {
        for (const update of this.updates.toReversed()) {
            update.inverse(graph)
        }
    }
    redo(graph: BoxGraph): void {
        for (const update of this.updates) {
            update.forward(graph)
        }
    }
}

export interface ModificationProcess {
    approve(): void
    revert(): void
}

export class Editing {
    readonly #graph: BoxGraph
    readonly #pending: Array<Update> = []
    readonly #history: Array<EditingStep> = []

    #modifying: boolean = false

    #historyIndex: int = 0

    constructor(graph: BoxGraph) {
        this.#graph = graph
    }

    get graph(): BoxGraph {return this.#graph}

    isEmpty(): boolean {return this.#history.length === 0 && this.#pending.length === 0}

    clear(): void {
        assert(!this.#modifying, "Already modifying")
        Arrays.clear(this.#pending)
        Arrays.clear(this.#history)
        this.#historyIndex = 0
    }

    undo(): boolean {
        if (this.#pending.length > 0) {this.mark()}
        if (this.#historyIndex === 0) {return false}
        this.#graph.beginTransaction()
        const editingStep = this.#history[--this.#historyIndex]
        editingStep.undo(this.#graph)
        this.#graph.endTransaction()
        this.#graph.edges().validateRequirements()
        return true
    }

    redo(): boolean {
        if (this.#historyIndex === this.#history.length) {return false}
        if (this.#pending.length > 0) {
            console.warn("redo while having pending updates?")
            return false
        }
        this.#graph.beginTransaction()
        this.#history[this.#historyIndex++].redo(this.#graph)
        this.#graph.endTransaction()
        this.#graph.edges().validateRequirements()
        return true
    }

    // TODO This is an option to clarify, if user actions meant to be run by a modifier or not.
    //  See ParameterWrapper. Not the nicest solution. Probably coming back to this sooner or later.
    canModify(): boolean {return !this.#graph.inTransaction()}

    modify<R>(modifier: Provider<Nullish<R>>, mark: boolean = true): Option<R> {
        if (this.#modifying) {
            // we just keep adding new updates to the running modifier
            return Option.wrap(modifier())
        }
        if (mark && this.#pending.length > 0) {this.mark()}
        const result = Option.wrap(this.#modify(modifier))
        if (mark) {this.mark()}
        return result
    }

    beginModification(): ModificationProcess {
        this.#graph.beginTransaction()
        this.#modifying = true
        const subscription = this.#graph.subscribeToAllUpdates({
            onUpdate: (update: Update) => this.#pending.push(update)
        })
        const complete = () => {
            this.#graph.endTransaction()
            subscription.terminate()
            this.#modifying = false
            this.#graph.edges().validateRequirements()
        }
        return {
            approve: () => {complete()},
            revert: () => {
                this.clearPending()
                complete()
            }
        }
    }

    #modify<R>(modifier: Provider<Nullish<R>>): Nullish<R> {
        assert(!this.#modifying, "Already modifying")
        this.#modifying = true
        const subscription = this.#graph.subscribeToAllUpdates({
            onUpdate: (update: Update) => this.#pending.push(update)
        })
        this.#graph.beginTransaction()
        const result = modifier()
        this.#graph.endTransaction()
        subscription.terminate()
        this.#modifying = false
        this.#graph.edges().validateRequirements()
        return result
    }

    mark(): void {
        if (this.#pending.length === 0) {return}
        if (this.#history.length - this.#historyIndex > 0) {this.#history.splice(this.#historyIndex)}
        this.#history.push(new EditingStep(this.#pending.splice(0)))
        this.#historyIndex = this.#history.length
    }

    clearPending(): void {
        if (this.#pending.length === 0) {return}
        this.#pending.reverse().forEach(update => update.inverse(this.#graph))
        this.#pending.length = 0
    }
}