import { Nullish, safeExecute, UUID, Procedure } from "lib-std";
import {
  Box,
  BoxConstruct,
  BoxGraph,
  NoPointers,
  PointerField,
  Field,
  BooleanField,
  StringField,
  UnreferenceableType,
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
export type AudioBusBoxFields = {
  1: /* collection */ PointerField<Pointers.AudioBusses>;
  2: /* output */ PointerField<Pointers.AudioOutput>;
  3: /* input */ Field<Pointers.AudioOutput>;
  4: /* enabled: true */ BooleanField;
  5: /* icon */ StringField;
  6: /* label */ StringField;
  7: /* color: red */ StringField;
  8: /* minimized */ BooleanField;
};

export class AudioBusBox extends Box<UnreferenceableType, AudioBusBoxFields> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<AudioBusBox>,
  ): AudioBusBox {
    return graph.stageBox(
      new AudioBusBox({
        uuid,
        graph,
        name: "AudioBusBox",
        pointerRules: NoPointers,
      }),
      constructor,
    );
  }

  private constructor(construct: BoxConstruct<UnreferenceableType>) {
    super(construct);
  }

  accept<R>(visitor: BoxVisitor<R>): Nullish<R> {
    return safeExecute(visitor.visitAudioBusBox, this);
  }

  get collection(): PointerField<Pointers.AudioBusses> {
    return this.getField(1);
  }

  get output(): PointerField<Pointers.AudioOutput> {
    return this.getField(2);
  }

  get input(): Field<Pointers.AudioOutput> {
    return this.getField(3);
  }

  get enabled(): BooleanField {
    return this.getField(4);
  }

  get icon(): StringField {
    return this.getField(5);
  }

  get label(): StringField {
    return this.getField(6);
  }

  get color(): StringField {
    return this.getField(7);
  }

  get minimized(): BooleanField {
    return this.getField(8);
  }

  initializeFields(): AudioBusBoxFields {
    return {
      1: PointerField.create(
        {
          parent: this,
          fieldKey: 1,
          fieldName: "collection",
          pointerRules: NoPointers,
        },
        Pointers.AudioBusses,
        true,
      ),
      2: PointerField.create(
        {
          parent: this,
          fieldKey: 2,
          fieldName: "output",
          pointerRules: NoPointers,
        },
        Pointers.AudioOutput,
        true,
      ),
      3: Field.hook({
        parent: this,
        fieldKey: 3,
        fieldName: "input",
        pointerRules: { accepts: [Pointers.AudioOutput], mandatory: false },
      }),
      4: BooleanField.create(
        {
          parent: this,
          fieldKey: 4,
          fieldName: "enabled",
          pointerRules: NoPointers,
        },
        true,
      ),
      5: StringField.create({
        parent: this,
        fieldKey: 5,
        fieldName: "icon",
        pointerRules: NoPointers,
      }),
      6: StringField.create({
        parent: this,
        fieldKey: 6,
        fieldName: "label",
        pointerRules: NoPointers,
      }),
      7: StringField.create(
        {
          parent: this,
          fieldKey: 7,
          fieldName: "color",
          pointerRules: NoPointers,
        },
        "red",
      ),
      8: BooleanField.create({
        parent: this,
        fieldKey: 8,
        fieldName: "minimized",
        pointerRules: NoPointers,
      }),
    };
  }
}
