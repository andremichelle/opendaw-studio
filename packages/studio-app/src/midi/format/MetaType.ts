import {Event} from "./Event"
import {MidiFileDecoder} from "./MidiFileDecoder"

export const enum MetaType {
    SEQUENCE_NUMBER = 0x00,
    TEXT_EVENT = 0x01,
    COPYRIGHT_NOTICE = 0x02,
    SEQUENCE_TRACK_NAME = 0x03,
    INSTRUMENT_NAME = 0x04,
    LYRICS = 0x05,
    MARKER = 0x06,
    CUE_POINT = 0x07,
    CHANNEL_PREFIX = 0x20,
    SET_TEMPO = 0x51,
    SMPTE_OFFSET = 0x54,
    TIME_SIGNATURE = 0x58,
    KEY_SIGNATURE = 0x59,
    SEQUENCER_SPECIFIC = 0x7f,
    PREFIX_PORT = 0x21,
    END_OF_TRACK = 0x2f,
}

export class MetaEvent implements Event<MetaType> {
    private constructor(readonly ticks: number,
                        readonly type: MetaType,
                        readonly value: unknown) {}

    static decode(decoder: MidiFileDecoder, ticks: number): MetaEvent | null {
        const type = decoder.readByte() & 0xff
        const length = decoder.readVarLen()
        switch (type) {
            case MetaType.SET_TEMPO:
                return new MetaEvent(ticks, type, decoder.readTempo())
            case MetaType.TIME_SIGNATURE:
                return new MetaEvent(ticks, type, decoder.readSignature())
            case MetaType.END_OF_TRACK:
                return new MetaEvent(ticks, type, null)
            case MetaType.TEXT_EVENT:
            case MetaType.COPYRIGHT_NOTICE:
            case MetaType.SEQUENCE_TRACK_NAME:
            case MetaType.INSTRUMENT_NAME:
            case MetaType.LYRICS:
            case MetaType.MARKER:
            case MetaType.CUE_POINT:
            case MetaType.SEQUENCE_NUMBER:
            case MetaType.CHANNEL_PREFIX:
            case MetaType.KEY_SIGNATURE:
            case MetaType.SEQUENCER_SPECIFIC:
            case MetaType.PREFIX_PORT:
            case MetaType.SMPTE_OFFSET:
            default:
                decoder.skip(length)
        }
        return null
    }

    toString(): string {
        return `MetaEvent{ticks: ${this.ticks}, type: ${this.type}, value: ${this.value}}`
    }
}