import {
    assert,
    DefaultObservableValue,
    ObservableValue,
    Observer,
    Option,
    StringMapping,
    Subscription,
    Terminable,
    Terminator,
    unitValue,
    ValueMapping
} from "lib-std"
import {ValueAssignment} from "@/ui/timeline/editors/value/ValueAssignment.tsx"
import {PointerField, PrimitiveValues} from "lib-box"
import {TrackBoxAdapter} from "studio-adapters"
import {TrackType} from "studio-adapters"
import {Pointers} from "studio-enums"
import {Project} from "@/project/Project.ts"

export class ValueEditingContext implements Terminable {
    static readonly FallbackStringMapping = StringMapping.percent()

    readonly #terminator = new Terminator()

    readonly #anchorValue: DefaultObservableValue<unitValue>
    readonly #assignmentLifecycle = new Terminator()
    readonly #assignment: DefaultObservableValue<Option<ValueAssignment>>

    constructor(project: Project, collection: PointerField<Pointers.RegionCollection | Pointers.ClipCollection>) {
        this.#anchorValue = new DefaultObservableValue<unitValue>(0.0)
        this.#assignmentLifecycle = this.#terminator.own(new Terminator())
        this.#assignment = this.#terminator.own(new DefaultObservableValue<Option<ValueAssignment>>(Option.None))
        this.#terminator.own(collection.catchupAndSubscribe(({targetVertex}) => {
            this.#assignmentLifecycle.terminate()
            if (targetVertex.isEmpty()) {
                this.#assignment.setValue(Option.None)
                return // No track assigned
            }
            const boxAdapters = project.boxAdapters
            const trackBoxAdapter = boxAdapters.adapterFor(targetVertex.unwrap().box, TrackBoxAdapter)
            assert(trackBoxAdapter.type === TrackType.Value, "ValueEditorHeader only accepts value tracks")
            this.#assignmentLifecycle.own(trackBoxAdapter.target.catchupAndSubscribe((pointer) =>
                this.#assignment.setValue(pointer.targetVertex.map(target => {
                    const address = target.address
                    const adapter = project.parameterFieldAdapters.get(address)
                    this.#anchorValue.setValue(adapter.anchor)
                    return {device: undefined, adapter} // TODO Find, observe name
                }))))
        }))
    }

    catchupAndSubscribeAssignment(observer: Observer<ObservableValue<Option<ValueAssignment>>>): Subscription {
        return this.#assignment.catchupAndSubscribe(observer)
    }

    get assignment(): DefaultObservableValue<Option<ValueAssignment>> {return this.#assignment}

    get anchorModel(): ObservableValue<unitValue> {
        const scope = this
        return new class implements ObservableValue<unitValue> {
            getValue(): unitValue {return scope.#assignment.getValue().mapOr(assignment => assignment.adapter.anchor, 0.0)}
            subscribe(observer: Observer<ObservableValue<unitValue>>): Subscription {return scope.#anchorValue.subscribe(observer)}
            catchupAndSubscribe(observer: Observer<ObservableValue<unitValue>>): Subscription {
                observer(this)
                return this.subscribe(observer)
            }
        }
    }

    get valueMapping(): ValueMapping<PrimitiveValues> {
        return this.#assignment.getValue().match({
            none: () => ValueMapping.unipolar(),
            some: assignment => assignment.adapter.valueMapping
        })
    }

    get stringMapping(): StringMapping<PrimitiveValues> {
        return this.#assignment.getValue().match({
            none: () => ValueEditingContext.FallbackStringMapping,
            some: assignment => assignment.adapter.stringMapping
        })
    }

    terminate(): void {this.#terminator.terminate()}
}