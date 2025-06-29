import { Nullish, safeExecute, UUID, Procedure } from "opendaw-std";
import {
  Box,
  BoxConstruct,
  BoxGraph,
  NoPointers,
  StringField,
  PointerField,
  Field,
  Int32Field,
  Float32Field,
  BooleanField,
} from "opendaw-box";
import { BoxVisitor } from ".";
import { Pointers } from "studio-enums";

//
//   ___          ___
//  | _ ) _____ _| __|__ _ _ __ _ ___
//  | _ \/ _ \ \ / _/ _ \ '_/ _` / -_)
//  |___/\___/_\_\_|\___/_| \__, \___|
//                         |___/
//
//  auto-generated | do not edit | blame andre.michelle@gmail.com
//
export type AudioUnitBoxFields = {
  1: /* type: instrument */ StringField;
  2: /* collection */ PointerField<Pointers.AudioUnits>;
  3: /* editing */ Field<Pointers.Editing>;
  11: /* index */ Int32Field;
  12: /* volume */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
  13: /* panning */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
  14: /* mute */ BooleanField<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
  15: /* solo */ BooleanField<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
  20: /* tracks */ Field<Pointers.TrackCollection>;
  21: /* midiEffects */ Field<Pointers.MidiEffectHost>;
  22: /* input */ Field<Pointers.InstrumentHost | Pointers.AudioOutput>;
  23: /* audioEffects */ Field<Pointers.AudioEffectHost>;
  24: /* auxSends */ Field<Pointers.AuxSend>;
  25: /* output */ PointerField<Pointers.AudioOutput>;
};

export class AudioUnitBox extends Box<
  Pointers.Selection | Pointers.Automation,
  AudioUnitBoxFields
> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<AudioUnitBox>,
  ): AudioUnitBox {
    return graph.stageBox(
      new AudioUnitBox({
        uuid,
        graph,
        name: "AudioUnitBox",
        pointerRules: {
          accepts: [Pointers.Selection, Pointers.Automation],
          mandatory: false,
        },
      }),
      constructor,
    );
  }

  private constructor(
    construct: BoxConstruct<Pointers.Selection | Pointers.Automation>,
  ) {
    super(construct);
  }

  accept<R>(visitor: BoxVisitor<R>): Nullish<R> {
    return safeExecute(visitor.visitAudioUnitBox, this);
  }

  get type(): StringField {
    return this.getField(1);
  }

  get collection(): PointerField<Pointers.AudioUnits> {
    return this.getField(2);
  }

  get editing(): Field<Pointers.Editing> {
    return this.getField(3);
  }

  get index(): Int32Field {
    return this.getField(11);
  }

  get volume(): Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(12);
  }

  get panning(): Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(13);
  }

  get mute(): BooleanField<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(14);
  }

  get solo(): BooleanField<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(15);
  }

  get tracks(): Field<Pointers.TrackCollection> {
    return this.getField(20);
  }

  get midiEffects(): Field<Pointers.MidiEffectHost> {
    return this.getField(21);
  }

  get input(): Field<Pointers.InstrumentHost | Pointers.AudioOutput> {
    return this.getField(22);
  }

  get audioEffects(): Field<Pointers.AudioEffectHost> {
    return this.getField(23);
  }

  get auxSends(): Field<Pointers.AuxSend> {
    return this.getField(24);
  }

  get output(): PointerField<Pointers.AudioOutput> {
    return this.getField(25);
  }

  initializeFields(): AudioUnitBoxFields {
    return {
      1: StringField.create(
        {
          parent: this,
          fieldKey: 1,
          fieldName: "type",
          pointerRules: NoPointers,
        },
        "instrument",
      ),
      2: PointerField.create(
        {
          parent: this,
          fieldKey: 2,
          fieldName: "collection",
          pointerRules: NoPointers,
        },
        Pointers.AudioUnits,
        true,
      ),
      3: Field.hook({
        parent: this,
        fieldKey: 3,
        fieldName: "editing",
        pointerRules: { accepts: [Pointers.Editing], mandatory: false },
      }),
      11: Int32Field.create({
        parent: this,
        fieldKey: 11,
        fieldName: "index",
        pointerRules: NoPointers,
      }),
      12: Float32Field.create({
        parent: this,
        fieldKey: 12,
        fieldName: "volume",
        pointerRules: {
          accepts: [
            Pointers.Modulation,
            Pointers.Automation,
            Pointers.MidiControl,
          ],
          mandatory: false,
        },
      }),
      13: Float32Field.create({
        parent: this,
        fieldKey: 13,
        fieldName: "panning",
        pointerRules: {
          accepts: [
            Pointers.Modulation,
            Pointers.Automation,
            Pointers.MidiControl,
          ],
          mandatory: false,
        },
      }),
      14: BooleanField.create({
        parent: this,
        fieldKey: 14,
        fieldName: "mute",
        pointerRules: {
          accepts: [
            Pointers.Modulation,
            Pointers.Automation,
            Pointers.MidiControl,
          ],
          mandatory: false,
        },
      }),
      15: BooleanField.create({
        parent: this,
        fieldKey: 15,
        fieldName: "solo",
        pointerRules: {
          accepts: [
            Pointers.Modulation,
            Pointers.Automation,
            Pointers.MidiControl,
          ],
          mandatory: false,
        },
      }),
      20: Field.hook({
        parent: this,
        fieldKey: 20,
        fieldName: "tracks",
        pointerRules: { accepts: [Pointers.TrackCollection], mandatory: false },
      }),
      21: Field.hook({
        parent: this,
        fieldKey: 21,
        fieldName: "midiEffects",
        pointerRules: { accepts: [Pointers.MidiEffectHost], mandatory: false },
      }),
      22: Field.hook({
        parent: this,
        fieldKey: 22,
        fieldName: "input",
        pointerRules: {
          accepts: [Pointers.InstrumentHost, Pointers.AudioOutput],
          mandatory: false,
        },
      }),
      23: Field.hook({
        parent: this,
        fieldKey: 23,
        fieldName: "audioEffects",
        pointerRules: { accepts: [Pointers.AudioEffectHost], mandatory: false },
      }),
      24: Field.hook({
        parent: this,
        fieldKey: 24,
        fieldName: "auxSends",
        pointerRules: { accepts: [Pointers.AuxSend], mandatory: false },
      }),
      25: PointerField.create(
        {
          parent: this,
          fieldKey: 25,
          fieldName: "output",
          pointerRules: NoPointers,
        },
        Pointers.AudioOutput,
        false,
      ),
    };
  }
}
