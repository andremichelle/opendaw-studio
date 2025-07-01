import { Nullish, safeExecute, UUID, Procedure } from "lib-std";
import {
  Box,
  BoxConstruct,
  BoxGraph,
  NoPointers,
  PointerField,
  Field,
  Int32Field,
  StringField,
  BooleanField,
  Float32Field,
} from "lib-box";
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
export type PlayfieldSampleBoxFields = {
  10: /* device */ PointerField<Pointers.Sample>;
  11: /* file */ PointerField<Pointers.AudioFile>;
  12: /* midiEffects */ Field<Pointers.MidiEffectHost>;
  13: /* audioEffects */ Field<Pointers.AudioEffectHost>;
  15: /* index: 60 */ Int32Field;
  20: /* label */ StringField;
  21: /* icon */ StringField;
  22: /* enabled: true */ BooleanField;
  23: /* minimized: false */ BooleanField;
  40: /* mute */ BooleanField;
  41: /* solo */ BooleanField;
  42: /* exclude */ BooleanField;
  43: /* polyphone */ BooleanField;
  44: /* gate: 0 */ Int32Field;
  45: /* pitch */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
  46: /* sampleStart: 0 */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
  47: /* sampleEnd: 1 */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
  48: /* attack: 0.001 */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
  49: /* release: 0.02 */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
};

export class PlayfieldSampleBox extends Box<
  Pointers.Editing,
  PlayfieldSampleBoxFields
> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<PlayfieldSampleBox>,
  ): PlayfieldSampleBox {
    return graph.stageBox(
      new PlayfieldSampleBox({
        uuid,
        graph,
        name: "PlayfieldSampleBox",
        pointerRules: { accepts: [Pointers.Editing], mandatory: false },
      }),
      constructor,
    );
  }

  private constructor(construct: BoxConstruct<Pointers.Editing>) {
    super(construct);
  }

  accept<R>(visitor: BoxVisitor<R>): Nullish<R> {
    return safeExecute(visitor.visitPlayfieldSampleBox, this);
  }

  get device(): PointerField<Pointers.Sample> {
    return this.getField(10);
  }

  get file(): PointerField<Pointers.AudioFile> {
    return this.getField(11);
  }

  get midiEffects(): Field<Pointers.MidiEffectHost> {
    return this.getField(12);
  }

  get audioEffects(): Field<Pointers.AudioEffectHost> {
    return this.getField(13);
  }

  get index(): Int32Field {
    return this.getField(15);
  }

  get label(): StringField {
    return this.getField(20);
  }

  get icon(): StringField {
    return this.getField(21);
  }

  get enabled(): BooleanField {
    return this.getField(22);
  }

  get minimized(): BooleanField {
    return this.getField(23);
  }

  get mute(): BooleanField {
    return this.getField(40);
  }

  get solo(): BooleanField {
    return this.getField(41);
  }

  get exclude(): BooleanField {
    return this.getField(42);
  }

  get polyphone(): BooleanField {
    return this.getField(43);
  }

  get gate(): Int32Field {
    return this.getField(44);
  }

  get pitch(): Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(45);
  }

  get sampleStart(): Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(46);
  }

  get sampleEnd(): Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(47);
  }

  get attack(): Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(48);
  }

  get release(): Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(49);
  }

  initializeFields(): PlayfieldSampleBoxFields {
    return {
      10: PointerField.create(
        {
          parent: this,
          fieldKey: 10,
          fieldName: "device",
          pointerRules: NoPointers,
        },
        Pointers.Sample,
        true,
      ),
      11: PointerField.create(
        {
          parent: this,
          fieldKey: 11,
          fieldName: "file",
          pointerRules: NoPointers,
        },
        Pointers.AudioFile,
        true,
      ),
      12: Field.hook({
        parent: this,
        fieldKey: 12,
        fieldName: "midiEffects",
        pointerRules: { accepts: [Pointers.MidiEffectHost], mandatory: false },
      }),
      13: Field.hook({
        parent: this,
        fieldKey: 13,
        fieldName: "audioEffects",
        pointerRules: { accepts: [Pointers.AudioEffectHost], mandatory: false },
      }),
      15: Int32Field.create(
        {
          parent: this,
          fieldKey: 15,
          fieldName: "index",
          pointerRules: NoPointers,
        },
        60,
      ),
      20: StringField.create({
        parent: this,
        fieldKey: 20,
        fieldName: "label",
        pointerRules: NoPointers,
      }),
      21: StringField.create({
        parent: this,
        fieldKey: 21,
        fieldName: "icon",
        pointerRules: NoPointers,
      }),
      22: BooleanField.create(
        {
          parent: this,
          fieldKey: 22,
          fieldName: "enabled",
          pointerRules: NoPointers,
        },
        true,
      ),
      23: BooleanField.create(
        {
          parent: this,
          fieldKey: 23,
          fieldName: "minimized",
          pointerRules: NoPointers,
        },
        false,
      ),
      40: BooleanField.create({
        parent: this,
        fieldKey: 40,
        fieldName: "mute",
        pointerRules: NoPointers,
      }),
      41: BooleanField.create({
        parent: this,
        fieldKey: 41,
        fieldName: "solo",
        pointerRules: NoPointers,
      }),
      42: BooleanField.create({
        parent: this,
        fieldKey: 42,
        fieldName: "exclude",
        pointerRules: NoPointers,
      }),
      43: BooleanField.create({
        parent: this,
        fieldKey: 43,
        fieldName: "polyphone",
        pointerRules: NoPointers,
      }),
      44: Int32Field.create(
        {
          parent: this,
          fieldKey: 44,
          fieldName: "gate",
          pointerRules: NoPointers,
        },
        0,
      ),
      45: Float32Field.create({
        parent: this,
        fieldKey: 45,
        fieldName: "pitch",
        pointerRules: {
          accepts: [
            Pointers.Modulation,
            Pointers.Automation,
            Pointers.MidiControl,
          ],
          mandatory: false,
        },
      }),
      46: Float32Field.create(
        {
          parent: this,
          fieldKey: 46,
          fieldName: "sampleStart",
          pointerRules: {
            accepts: [
              Pointers.Modulation,
              Pointers.Automation,
              Pointers.MidiControl,
            ],
            mandatory: false,
          },
        },
        0,
      ),
      47: Float32Field.create(
        {
          parent: this,
          fieldKey: 47,
          fieldName: "sampleEnd",
          pointerRules: {
            accepts: [
              Pointers.Modulation,
              Pointers.Automation,
              Pointers.MidiControl,
            ],
            mandatory: false,
          },
        },
        1,
      ),
      48: Float32Field.create(
        {
          parent: this,
          fieldKey: 48,
          fieldName: "attack",
          pointerRules: {
            accepts: [
              Pointers.Modulation,
              Pointers.Automation,
              Pointers.MidiControl,
            ],
            mandatory: false,
          },
        },
        0.001,
      ),
      49: Float32Field.create(
        {
          parent: this,
          fieldKey: 49,
          fieldName: "release",
          pointerRules: {
            accepts: [
              Pointers.Modulation,
              Pointers.Automation,
              Pointers.MidiControl,
            ],
            mandatory: false,
          },
        },
        0.02,
      ),
    };
  }
}
