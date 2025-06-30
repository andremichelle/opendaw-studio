import {BoxSchema, FieldRecord, mergeFields, reserveMany} from "lib-box-forge"
import {Pointers} from "studio-enums"
import {Objects} from "lib-std"

const DefaultPointers = [Pointers.Device, Pointers.Selection]

const MidiEffectDeviceAttributes = {
    1: {type: "pointer", name: "host", pointerType: Pointers.MidiEffectHost, mandatory: true},
    2: {type: "int32", name: "index"},
    3: {type: "string", name: "label"},
    4: {type: "boolean", name: "enabled", value: true},
    5: {type: "boolean", name: "minimized", value: false},
    ...reserveMany(6, 7, 8, 9)
} as const satisfies FieldRecord<Pointers>

const InstrumentDeviceAttributes = {
    1: {type: "pointer", name: "host", pointerType: Pointers.InstrumentHost, mandatory: true},
    2: {type: "string", name: "label"},
    3: {type: "string", name: "icon"},
    4: {type: "boolean", name: "enabled", value: true},
    5: {type: "boolean", name: "minimized", value: false},
    ...reserveMany(6, 7, 8, 9)
} as const satisfies FieldRecord<Pointers>

const AudioEffectDeviceAttributes = {
    1: {type: "pointer", name: "host", pointerType: Pointers.AudioEffectHost, mandatory: true},
    2: {type: "int32", name: "index"},
    3: {type: "string", name: "label"},
    4: {type: "boolean", name: "enabled", value: true},
    5: {type: "boolean", name: "minimized", value: false},
    ...reserveMany(6, 7, 8, 9)
} as const satisfies FieldRecord<Pointers>

export const createMidiEffectDevice = <FIELDS extends FieldRecord<Pointers>>(
    name: string, fields: Objects.Disjoint<typeof MidiEffectDeviceAttributes, FIELDS>): BoxSchema<Pointers> => ({
    type: "box",
    class: {name, fields: mergeFields(MidiEffectDeviceAttributes, fields)},
    pointerRules: {accepts: DefaultPointers, mandatory: false}
})

export const createInstrumentDevice = <FIELDS extends FieldRecord<Pointers>>(
    name: string, fields: Objects.Disjoint<typeof InstrumentDeviceAttributes, FIELDS>,
    ...pointers: Array<Pointers>): BoxSchema<Pointers> => ({
    type: "box",
    class: {name, fields: mergeFields(InstrumentDeviceAttributes, fields)},
    pointerRules: {accepts: DefaultPointers.concat(pointers), mandatory: false}
})

export const createAudioEffectDevice = <FIELDS extends FieldRecord<Pointers>>(
    name: string, fields: Objects.Disjoint<typeof AudioEffectDeviceAttributes, FIELDS>): BoxSchema<Pointers> => ({
    type: "box",
    class: {name, fields: mergeFields(AudioEffectDeviceAttributes, fields)},
    pointerRules: {accepts: DefaultPointers, mandatory: false}
})