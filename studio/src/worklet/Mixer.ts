import {ChannelStripProcessor} from "@/worklet/ChannelStripProcessor.ts"
import {asDefined, SortedSet, Terminable, UUID} from "std"
import {Pointers} from "@core/data/pointers"
import {AudioUnitBox, AuxSendBox, BoxVisitor} from "@core/data/boxes"

export class Mixer {
    readonly #channelStrips: SortedSet<UUID.Format, ChannelStripProcessor>
    readonly #solo: Set<ChannelStripProcessor>
    readonly #virtualSolo: Set<ChannelStripProcessor>

    #needsUpdate: boolean = false

    constructor() {
        this.#channelStrips = UUID.newSet(processor => processor.adapter.uuid)
        this.#solo = new Set<ChannelStripProcessor>()
        this.#virtualSolo = new Set<ChannelStripProcessor>()
    }

    attachChannelStrip(channelStrip: ChannelStripProcessor): Terminable {
        this.#channelStrips.add(channelStrip)
        return Terminable.many(
            channelStrip.adapter.input.subscribe(() => this.#requestUpdateSolo()),
            channelStrip.adapter.output.subscribe(() => this.#requestUpdateSolo()),
            {
                terminate: () => {
                    this.#solo.delete(channelStrip)
                    this.#channelStrips.removeByValue(channelStrip)
                    this.#requestUpdateSolo()
                }
            }
        )
    }

    onChannelStripSoloChanged(channelStrip: ChannelStripProcessor): void {
        if (channelStrip.isSolo) {
            this.#solo.add(channelStrip)
        } else {
            this.#solo.delete(channelStrip)
        }
        this.#requestUpdateSolo()
    }

    hasChannelSolo() {return this.#solo.size > 0}

    isVirtualSolo(channelStrip: ChannelStripProcessor): boolean {
        return this.#virtualSolo.has(channelStrip)
    }

    #requestUpdateSolo(): void {
        if (this.#needsUpdate) {return}
        this.#needsUpdate = true
        this.#channelStrips.forEach(channelStrip => channelStrip.requestSoloUpdate())
    }

    // called by Channelstrip when moving on
    updateSolo(): void {
        if (!this.#needsUpdate) {return}
        this.#virtualSolo.clear()
        const touched = new Set<ChannelStripProcessor>()
        const visitChannelStrip = (channelStrip: ChannelStripProcessor) => {
            if (touched.has(channelStrip)) {return}
            touched.add(channelStrip)
            channelStrip.adapter.input.getValue().ifSome(input => {
                if (input.type === "bus") {
                    input.box.input.pointerHub
                        .filter(Pointers.AudioOutput)
                        .map(pointer => asDefined(pointer.box.accept<BoxVisitor<ChannelStripProcessor>>({
                            visitAudioUnitBox: ({address: {uuid}}: AudioUnitBox) =>
                                this.#channelStrips.get(uuid),
                            visitAuxSendBox: ({audioUnit: {targetVertex}}: AuxSendBox) =>
                                this.#channelStrips.get(targetVertex.unwrap().address.uuid)
                        }), "Could not resolve channel-strip"))
                        .forEach(channelStrip => {
                            if (!channelStrip.isSolo) {this.#virtualSolo.add(channelStrip)}
                            visitChannelStrip(channelStrip)
                        })
                }
            })
        }
        this.#channelStrips.forEach((channelStrip) => {if (channelStrip.isSolo) {visitChannelStrip(channelStrip)}})
        this.#needsUpdate = false
    }
}