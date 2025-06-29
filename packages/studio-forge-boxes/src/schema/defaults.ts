import {PointerRules, UnreferenceableType} from "lib-box"
import {FieldName, FieldSchema, PointerFieldSchema, PrimitiveFieldSchema} from "lib-box-forge"
import {Pointers} from "studio-enums"

export const DefaultParameterPointerRules = {
    accepts: [Pointers.Modulation, Pointers.Automation, Pointers.MidiControl],
    mandatory: false
} satisfies PointerRules<Pointers>

export const DefaultLabel = {
    type: "string",
    name: "label"
} satisfies PrimitiveFieldSchema<UnreferenceableType> & FieldName

export const DefaultAudioOutput = {
    type: "pointer", name: "audio-output", pointerType: Pointers.AudioConnection, mandatory: false
} satisfies PointerFieldSchema<Pointers.AudioConnection> & FieldName

export const DefaultAudioInput = {
    type: "field", name: "audio-input", pointerRules: {mandatory: false, accepts: [Pointers.AudioConnection]}
} satisfies FieldSchema<Pointers.AudioConnection> & FieldName

export const DefaultMandatoryAudioOutput = {
    type: "pointer", name: "audio-output", pointerType: Pointers.AudioConnection, mandatory: true
} satisfies PointerFieldSchema<Pointers.AudioConnection> & FieldName

export const DefaultMandatoryAudioInput = {
    type: "field", name: "audio-input", pointerRules: {mandatory: true, accepts: [Pointers.AudioConnection]}
} satisfies FieldSchema<Pointers.AudioConnection> & FieldName

export const DefaultMandatoryVoltageOutput = {
    type: "pointer", name: "voltage-output", pointerType: Pointers.VoltageConnection, mandatory: true
} satisfies PointerFieldSchema<Pointers.VoltageConnection> & FieldName

export const DefaultMandatoryVoltageInput = {
    type: "field", name: "voltage-input", pointerRules: {mandatory: true, accepts: [Pointers.VoltageConnection]}
} satisfies FieldSchema<Pointers.VoltageConnection> & FieldName

export const DefaultNotesOutput = {
    type: "pointer", name: "notes-output", pointerType: Pointers.NotesConnection, mandatory: false
} satisfies PointerFieldSchema<Pointers.NotesConnection> & FieldName

export const DefaultNotesInput = {
    type: "field", name: "notes-input", pointerRules: {mandatory: false, accepts: [Pointers.NotesConnection]}
} satisfies FieldSchema<Pointers.NotesConnection> & FieldName