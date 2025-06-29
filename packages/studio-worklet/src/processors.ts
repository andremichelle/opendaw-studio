import {int, Option, Terminable, UUID} from "opendaw-std"
import {AudioGenerator, AudioInput, Processor} from "./processing.ts"
import {AudioEffectDeviceBoxAdapter, MidiEffectDeviceAdapter} from "studio-shared"
import {NoteEventSource, NoteEventTarget} from "./NoteEventSource.ts"

export interface DeviceProcessor extends Terminable {
    get uuid(): UUID.Format
    get incoming(): Processor
    get outgoing(): Processor
}

export interface MidiEffectProcessor extends Processor, NoteEventSource, NoteEventTarget, Terminable {
    get uuid(): UUID.Format

    index(): int
    adapter(): MidiEffectDeviceAdapter
}

export interface InstrumentDeviceProcessor extends AudioDeviceProcessor {
    get noteEventTarget(): Option<NoteEventTarget & DeviceProcessor>
}

export interface AudioDeviceProcessor extends DeviceProcessor, AudioGenerator {}

export interface AudioEffectDeviceProcessor extends AudioDeviceProcessor, AudioInput {
    index(): int
    adapter(): AudioEffectDeviceBoxAdapter
}