import {BoxVisitor, NoteEventBox, NoteEventCollectionBox} from "studio-boxes"
import {
    asDefined,
    Coordinates,
    float,
    int,
    Intervals,
    Iterables,
    Notifier,
    Observer,
    SelectableLocator,
    SortedSet,
    Subscription,
    Terminator,
    UUID
} from "lib-std"
import {Address, Box} from "lib-box"
import {EventCollection, NoteEvent, ppqn} from "lib-dsp"
import {Pointers} from "studio-enums"
import {BoxAdapter} from "../../../BoxAdapter"
import {NoteEventBoxAdapter} from "../event/NoteEventBoxAdapter"
import {BoxAdaptersContext} from "../../../BoxAdaptersContext"

type CreateEventParams = {
    position: ppqn
    duration: ppqn
    pitch: int
    cent: number
    velocity: float
    chance: int
    playCount: int
}

export class NoteEventCollectionBoxAdapter implements BoxAdapter, SelectableLocator<NoteEventBoxAdapter, ppqn, int> {
    readonly #terminator: Terminator = new Terminator()

    readonly #context: BoxAdaptersContext
    readonly #box: NoteEventCollectionBox

    readonly #changeNotifier: Notifier<this>
    readonly #adapters: SortedSet<UUID.Format, NoteEventBoxAdapter>
    readonly #events: EventCollection<NoteEventBoxAdapter>

    #minPitch: int = 60
    #maxPitch: int = 60
    #maxDuration: ppqn = 0
    #computedExtremas: boolean = false

    constructor(context: BoxAdaptersContext, box: NoteEventCollectionBox) {
        this.#context = context
        this.#box = box

        this.#changeNotifier = new Notifier<this>()
        this.#adapters = UUID.newSet(adapter => adapter.uuid)
        this.#events = EventCollection.create<NoteEventBoxAdapter>(NoteEvent.Comparator)

        const addNoteProcedure = (box: Box) => {
            const adapter = asDefined(box.accept<BoxVisitor<NoteEventBoxAdapter>>({
                visitNoteEventBox: (box: NoteEventBox) => this.#context.boxAdapters.adapterFor(box, NoteEventBoxAdapter)
            }), `Could not find adapter for ${box}`)
            if (this.#adapters.add(adapter)) {
                this.#events.add(adapter)
                this.#onEventsChanged()
            }
        }
        this.#box.events.pointerHub.incoming().forEach(({box}) => addNoteProcedure(box))
        this.#terminator.own(this.#box.events.pointerHub.subscribeTransactual({
            onAdd: ({box}) => addNoteProcedure(box),
            onRemove: ({box: {address: {uuid}}}) => {
                this.#events.remove(this.#adapters.removeByKey(uuid))
                this.#onEventsChanged()
            }
        }))
        this.#terminator.own(this.#box.owners.pointerHub.subscribeTransactual({
            onAdd: () => this.#changeNotifier.notify(this),
            onRemove: () => this.#changeNotifier.notify(this)
        }))
    }

    copy(): NoteEventCollectionBoxAdapter {
        const graph = this.#context.boxGraph
        const boxCopy = NoteEventCollectionBox.create(graph, UUID.generate())
        this.#events.asArray().forEach(source => source.copyTo({events: boxCopy.events}))
        return this.#context.boxAdapters.adapterFor(boxCopy, NoteEventCollectionBoxAdapter)
    }

    createEvent(
        {position, duration, velocity, pitch, chance, playCount, cent}: CreateEventParams): NoteEventBoxAdapter {
        return this.#context.boxAdapters.adapterFor(NoteEventBox.create(this.#context.boxGraph, UUID.generate(), box => {
            box.position.setValue(position)
            box.duration.setValue(duration)
            box.velocity.setValue(velocity)
            box.pitch.setValue(pitch)
            box.chance.setValue(chance)
            box.playCount.setValue(playCount)
            box.cent.setValue(cent)
            box.events.refer(this.#box.events)
        }), NoteEventBoxAdapter)
    }

    subscribeChange(observer: Observer<this>): Subscription {return this.#changeNotifier.subscribe(observer)}

    selectable(): Iterable<NoteEventBoxAdapter> {return this.#events.asArray()}

    selectableAt(coordinates: Coordinates<ppqn, int>): Iterable<NoteEventBoxAdapter> {
        for (const element of this.#events.asArray()) { // TODO Optimise
            if (element.position <= coordinates.u && coordinates.u < element.complete && element.pitch === coordinates.v) {
                return Iterables.one(element)
            }
        }
        return Iterables.empty()
    }

    selectablesBetween(begin: Coordinates<ppqn, int>, end: Coordinates<ppqn, int>): Iterable<NoteEventBoxAdapter> {
        const events: Array<NoteEventBoxAdapter> = []
        for (const element of this.#events.asArray()) { // TODO Optimise
            if (Intervals.intersect1D(element.position, element.complete, begin.u, end.u)
                && Intervals.intersect1D(element.pitch, element.pitch, begin.v, end.v)) {
                events.push(element)
            }
        }
        return events
    }

    requestSorting(): void {
        this.#events.onIndexingChanged()
        this.onEventPropertyChanged()
    }

    onEventPropertyChanged(): void {this.#onEventsChanged()}

    terminate() {this.#terminator.terminate()}

    get box(): NoteEventCollectionBox {return this.#box}
    get uuid(): UUID.Format {return this.#box.address.uuid}
    get address(): Address {return this.#box.address}
    get numOwners(): int {return this.#box.owners.pointerHub.filter(Pointers.NoteEventCollection).length}
    get events(): EventCollection<NoteEventBoxAdapter> {
        if (!this.#computedExtremas) {
            this.#computeExtremas()
        }
        return this.#events
    }

    get minPitch(): int {
        if (!this.#computedExtremas) {this.#computeExtremas()}
        return this.#minPitch
    }
    get maxPitch(): int {
        if (!this.#computedExtremas) {this.#computeExtremas()}
        return this.#maxPitch
    }
    get maxDuration(): number {
        if (!this.#computedExtremas) {this.#computeExtremas()}
        return this.#maxDuration
    }

    toString(): string {return `{NoteEventCollectionBox ${UUID.toString(this.#box.address.uuid)}}`}

    #onEventsChanged(): void {
        this.#computedExtremas = false
        this.#changeNotifier.notify(this)
    }

    #computeExtremas(): void {
        let min: int = 127 | 0
        let max: int = 0 | 0
        let maxDuration = 0
        this.#events.asArray().forEach(({pitch, duration}) => {
            min = Math.min(min, pitch)
            max = Math.max(max, pitch)
            maxDuration = Math.max(maxDuration, duration)
        })
        this.#minPitch = min
        this.#maxPitch = max
        this.#maxDuration = maxDuration
        this.#computedExtremas = true
    }
}