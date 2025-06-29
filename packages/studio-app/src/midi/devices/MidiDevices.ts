import {
    Arrays,
    byte,
    isDefined,
    isInstanceOf,
    JSONValue,
    Nullish,
    Observer,
    Provider,
    SortedSet,
    Terminable,
    Terminator,
    tryCatch
} from "opendaw-std"
import {Project} from "@/project/Project"
import {AudioUnitBoxAdapter} from "studio-shared"
import {MidiDeviceAccess} from "@/midi/devices/MidiDeviceAccess"
import {MidiData} from "@/midi/MidiData"
import {MidiDialogs} from "@/midi/devices/MidiDialogs"
import {Engine} from "@/audio-engine/Engine"
import {Address, AddressJSON, PrimitiveField, PrimitiveValues} from "opendaw-box"
import {Pointers} from "studio-enums"
import {AutomatableParameterFieldAdapter} from "studio-shared"

export type MidiConnectionJSON = (
    | {
    type: "key"
} | {
    type: "control"
    controlId: byte
}) & JSONValue & {
    address: AddressJSON
    channel: byte
}

export interface MidiConnection extends Terminable {
    address: Address
    label: Provider<string>
    toJSON(): MidiConnectionJSON
}

interface MidiObserver extends Terminable {
    observer: Observer<MIDIMessageEvent>
}

const createMidiKeysObserver = (engine: Engine, adapter: AudioUnitBoxAdapter): MidiObserver => {
    const uuid = adapter.uuid
    const activeNotes = Arrays.create(() => 0, 127)
    return {
        observer: (event: MIDIMessageEvent) => {
            const data = event.data
            if (data === null) {return}
            if (MidiData.isNoteOff(data) || (MidiData.isNoteOn(data) && MidiData.readVelocity(data) === 0)) {
                const pitch = MidiData.readPitch(data)
                engine.noteOff(uuid, pitch)
                if (activeNotes[pitch] > 0) {
                    activeNotes[pitch]--
                }
            } else if (MidiData.isNoteOn(data)) {
                const pitch = MidiData.readPitch(data)
                engine.noteOn(uuid, pitch, MidiData.readVelocity(data))
                activeNotes[pitch]++
            }
        },
        terminate: () => {
            activeNotes.forEach((count, pitch) => {
                if (count > 0) {
                    engine.noteOff(uuid, pitch)
                }
            })
        }
    }
}

const createMidiControlObserver = (project: Project, adapter: AutomatableParameterFieldAdapter, controlId: byte): MidiObserver => {
    const registration = adapter.registerMidiControl()
    return {
        observer: (event: MIDIMessageEvent) => {
            const data = event.data
            if (data === null) {return}
            if (MidiData.isController(data) && MidiData.readParam1(data) === controlId) {
                project.editing.modify(() => adapter.setValue(adapter.valueMapping.y(MidiData.asValue(data))), false)
            }
        },
        terminate: () => registration.terminate()
    }
}

export class MidiDevices implements Terminable {
    readonly #terminator = new Terminator()

    readonly #project: Project
    readonly #connections: SortedSet<Address, MidiConnection>

    constructor(project: Project) {
        this.#project = project
        this.#connections = Address.newSet<MidiConnection>(connection => connection.address)
    }

    hasMidiConnection(address: Address): boolean {return this.#connections.hasKey(address)}
    forgetMidiConnection(address: Address) {this.#connections.removeByKey(address).terminate()}

    async learnMidiKeys(adapter: AudioUnitBoxAdapter) {
        if (!MidiDeviceAccess.canRequestMidiAccess()) {return}
        MidiDeviceAccess.available().setValue(true)
        const learnLifecycle = this.#terminator.spawn()
        const dialog = MidiDialogs.showInfoDialog(() => learnLifecycle.terminate())
        learnLifecycle.own(MidiDeviceAccess.subscribeMessageEvents((event: MIDIMessageEvent) => {
            const data = event.data
            if (data === null) {return}
            if (MidiData.isNoteOn(data)) {
                learnLifecycle.terminate()
                dialog.close()
                this.#startListeningKeys(adapter, MidiData.readChannel(data), event)
            }
        }))
    }

    async learnMidiControls(field: PrimitiveField<PrimitiveValues, Pointers.MidiControl | Pointers>) {
        if (!MidiDeviceAccess.canRequestMidiAccess()) {return}
        MidiDeviceAccess.available().setValue(true)
        const learnLifecycle = this.#terminator.spawn()
        const dialog = MidiDialogs.showInfoDialog(() => learnLifecycle.terminate())
        learnLifecycle.own(MidiDeviceAccess.subscribeMessageEvents((event: MIDIMessageEvent) => {
            const data = event.data
            if (data === null) {return}
            if (MidiData.isController(data)) {
                learnLifecycle.terminate()
                dialog.close()
                return this.#startListeningControl(field, MidiData.readChannel(data), MidiData.readParam1(data), event)
            }
        }))
    }

    saveToLocalStorage(key: string): void {
        localStorage.setItem(key, JSON.stringify(this.#project.midiDevices.toJSON()))
    }

    loadFromLocalStorage(key: string): boolean {
        const {status, value} =
            tryCatch(() => JSON.parse(localStorage.getItem(key) ?? "[]") as ReadonlyArray<MidiConnectionJSON>)
        if (status === "failure") {return false}
        const hasData = value.length > 0
        if (hasData) {
            console.debug(`load ${value.length} midi-connections`)
        }
        this.fromJSON(value)
        return hasData
    }

    toJSON(): ReadonlyArray<MidiConnectionJSON> {
        return this.#connections.values().map(connection => connection.toJSON())
    }

    fromJSON(json: ReadonlyArray<MidiConnectionJSON>): void {
        this.#killAllConnections()
        this.#connections.addMany(json
            .map<Nullish<MidiConnection>>((json) => {
                const {type, address: addressAsJson, channel} = json
                const address = Address.compose(Uint8Array.from(addressAsJson.uuid), ...addressAsJson.fields)
                switch (type) {
                    case "key": {
                        return this.#project.boxGraph.findBox(address.uuid)
                                .ifSome(box => this.#startListeningKeys(this.#project.boxAdapters
                                    .adapterFor(box, AudioUnitBoxAdapter), channel))
                            ?? undefined
                    }
                    case "control": {
                        return this.#project.boxGraph.findVertex(address)
                                .ifSome(field => {
                                    if (!field.isField() || !isInstanceOf(field, PrimitiveField)) {return undefined}
                                    return this.#startListeningControl(field, channel, json?.controlId ?? 1)
                                })
                            ?? undefined
                    }
                }
            })
            .filter(x => isDefined(x)))
    }

    terminate(): void {
        this.#killAllConnections()
        this.#terminator.terminate()
    }

    #startListeningKeys(adapter: AudioUnitBoxAdapter,
                        channel: byte,
                        event?: MIDIMessageEvent): void {
        console.debug(`startListeningKeys channel: ${channel}`)
        const engine = this.#project.service.engine
        const {observer, terminate} = createMidiKeysObserver(engine, adapter)
        const subscription = MidiDeviceAccess.subscribeMessageEvents(observer, channel)
        this.#connections.add({
            address: adapter.address,
            label: () => adapter.input.label.unwrapOrElse("N/A"),
            toJSON: (): MidiConnectionJSON => ({
                type: "key",
                address: adapter.address.toJSON(),
                channel
            }),
            terminate: () => {
                terminate()
                subscription.terminate()
            }
        })
        if (isDefined(event)) {observer(event)}
    }
    #startListeningControl(field: PrimitiveField<PrimitiveValues, Pointers.MidiControl | Pointers>,
                           channel: byte,
                           controlId: byte,
                           event?: MIDIMessageEvent): void {
        console.debug(`startListeningControl channel: ${channel}, controlId: ${controlId}`)
        const {observer, terminate} =
            createMidiControlObserver(this.#project, this.#project.parameterFieldAdapters.get(field.address), controlId)
        if (isDefined(event)) {observer(event)}
        const subscription = MidiDeviceAccess.subscribeMessageEvents(observer, channel)
        this.#connections.add({
            address: field.address,
            toJSON: (): MidiConnectionJSON => ({
                type: "control",
                address: field.address.toJSON(),
                channel,
                controlId
            }),
            label: () => this.#project.parameterFieldAdapters.get(field.address).name,
            terminate: () => {
                terminate()
                subscription.terminate()
            }
        })
    }

    #killAllConnections() {
        this.#connections.forEach(({terminate}) => terminate())
        this.#connections.clear()
    }
}