import {
    assert,
    byte,
    isDefined,
    isInstanceOf,
    Lazy,
    MutableObservableValue,
    Notifier,
    Nullable,
    ObservableValue,
    Observer,
    Option,
    Subscription,
    Terminable,
    Terminator
} from "lib-std"
import {showInfoDialog} from "@/ui/components/dialogs"
import {MidiData} from "@/midi/MidiData"
import {RouteLocation} from "lib-jsx"
import {AnimationFrame, Browser, ConsoleCommands, Events} from "lib-dom"

export class MidiDeviceAccess {
    static get(): Option<MidiDeviceAccess> {return this.#instance}

    static canRequestMidiAccess(): boolean {return "requestMIDIAccess" in navigator}

    static panic(): void {
        this.get().ifSome(midi => {
            for (let note = 0; note < 128; note++) {
                for (let channel = 0; channel < 16; channel++) {
                    const data = MidiData.noteOff(channel, note)
                    const event = new MessageEvent("midimessage", {data: data})
                    for (let input of midi.#access.inputs.values()) {
                        input.dispatchEvent(event)
                    }
                    for (let output of midi.#access.outputs.values()) {
                        output.send(data)
                    }
                }
            }
        })
    }

    @Lazy
    static available(): MutableObservableValue<boolean> {
        const notifier = new Notifier<ObservableValue<boolean>>()
        return new class implements MutableObservableValue<boolean> {
            setValue(value: boolean): void {
                if (this.getValue()) {return}
                assert(value, "Internal Error")
                if (MidiDeviceAccess.canRequestMidiAccess()) {
                    MidiDeviceAccess.#isRequesting = (() => {
                        const promise = navigator.requestMIDIAccess({sysex: false})
                        promise
                            .then(access => MidiDeviceAccess.#instance = Option.wrap(new MidiDeviceAccess(access)))
                            .catch(reason => { // do not use the dialog promise as a return > will skip finally statement below
                                showInfoDialog({
                                    headline: "Cannot Access Midi Devices",
                                    message: isInstanceOf(reason, Error) ? reason.message : String(reason),
                                    buttons: Browser.isFirefox() ? [{
                                        text: "Manual",
                                        primary: true,
                                        onClick: (handler) => {
                                            handler.close()
                                            RouteLocation.get().navigateTo("manuals/firefox-midi")
                                        }
                                    }] : undefined
                                })
                            })
                            .finally(() => {
                                MidiDeviceAccess.#isRequesting = Option.None
                                AnimationFrame.once(() => notifier.notify(this)) // This helps prevent Firefox from freezing
                            })
                        return Option.wrap(promise)
                    })()
                } else {
                    showInfoDialog({
                        headline: "Cannot Access Midi Devices",
                        message: "This browser does not support the WebMidiApi (Hint: Chrome does)."
                    })
                }
            }
            getValue(): boolean {return MidiDeviceAccess.#instance.nonEmpty() || MidiDeviceAccess.#isRequesting.nonEmpty()}
            subscribe(observer: Observer<ObservableValue<boolean>>): Subscription {return notifier.subscribe(observer)}
            catchupAndSubscribe(observer: Observer<ObservableValue<boolean>>): Subscription {
                observer(this)
                return this.subscribe(observer)
            }
        }
    }

    static subscribeMessageEvents(observer: Observer<MIDIMessageEvent>, channel?: byte): Subscription {
        return this.#instance.match({
            none: () => {
                const terminator = new Terminator()
                terminator.own(this.available().subscribe(() => terminator.own(this.subscribeMessageEvents(observer, channel))))
                return terminator
            },
            some: midi => midi.subscribeMessageEvents(observer, channel)
        })
    }

    static #instance: Option<MidiDeviceAccess> = Option.None
    static #isRequesting: Option<Promise<MIDIAccess>> = Option.None

    readonly #access: MIDIAccess

    constructor(access: MIDIAccess) {
        this.#access = access

        let subscription: Subscription = Terminable.Empty
        ConsoleCommands.exportMethod("midi.listen.all",
            (bool: string) => {
                subscription.terminate()
                const listen = bool === undefined ? true : Boolean(bool)
                if (listen) {
                    subscription = this.subscribeMessageEvents(event => console.debug(MidiData.debug(event.data)))
                }
                return listen
            })
    }

    subscribeMessageEvents(observer: Observer<MIDIMessageEvent>, channel?: byte): Subscription {
        const listen = (input: MIDIInput) => isDefined(channel)
            ? Events.subscribeAny(input, "midimessage", (event: MIDIMessageEvent) => {
                if (event.data === null || MidiData.readChannel(event.data) !== channel) {return}
                observer(event)
            }) : Events.subscribeAny(input, "midimessage", observer)
        const connections: Array<[MIDIInput, Subscription]> = Array.from(this.#access.inputs.values())
            .map(input => ([input, listen(input)]))
        const stateSubscription = Events.subscribeAny(this.#access, "statechange", (event: MIDIConnectionEvent) => {
            const port: Nullable<MIDIPort> = event.port
            if (!isInstanceOf(port, MIDIInput)) {return}
            for (const [input, subscription] of connections) {
                if (input === port) {
                    // Well, this is strange, but if you start listening to a midi-input initially,
                    // it will change its state to connected, so we clean up first old subscriptions.
                    subscription.terminate()
                    break
                }
            }
            if (port.state === "connected") {
                connections.push([port, listen(port)])
            }
        })
        return {
            terminate: () => {
                stateSubscription.terminate()
                connections.forEach(([_, subscription]) => subscription.terminate())
                connections.length = 0
            }
        }
    }
}