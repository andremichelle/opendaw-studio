import "opendaw-std";
import {
  ObjectField,
  FieldConstruct,
  NoPointers,
  BooleanField,
  Int32Field,
  UnreferenceableType,
} from "opendaw-box";

//
//   ___          ___
//  | _ ) _____ _| __|__ _ _ __ _ ___
//  | _ \/ _ \ \ / _/ _ \ '_/ _` / -_)
//  |___/\___/_\_\_|\___/_| \__, \___|
//                         |___/
//
//  auto-generated | do not edit | blame andre.michelle@gmail.com
//
export type ClipPlaybackFieldsFields = {
  1: /* loop: true */ BooleanField;
  2: /* reverse */ BooleanField;
  3: /* mute */ BooleanField;
  4: /* speed */ Int32Field;
  5: /* quantise */ Int32Field;
  6: /* trigger */ Int32Field;
};

export class ClipPlaybackFields extends ObjectField<ClipPlaybackFieldsFields> {
  static create(
    construct: FieldConstruct<UnreferenceableType>,
  ): ClipPlaybackFields {
    return new ClipPlaybackFields(construct);
  }

  private constructor(construct: FieldConstruct<UnreferenceableType>) {
    super(construct);
  }

  get loop(): BooleanField {
    return this.getField(1);
  }

  get reverse(): BooleanField {
    return this.getField(2);
  }

  get mute(): BooleanField {
    return this.getField(3);
  }

  get speed(): Int32Field {
    return this.getField(4);
  }

  get quantise(): Int32Field {
    return this.getField(5);
  }

  get trigger(): Int32Field {
    return this.getField(6);
  }

  initializeFields(): ClipPlaybackFieldsFields {
    return {
      1: BooleanField.create(
        {
          parent: this,
          fieldKey: 1,
          fieldName: "loop",
          pointerRules: NoPointers,
        },
        true,
      ),
      2: BooleanField.create({
        parent: this,
        fieldKey: 2,
        fieldName: "reverse",
        pointerRules: NoPointers,
      }),
      3: BooleanField.create({
        parent: this,
        fieldKey: 3,
        fieldName: "mute",
        pointerRules: NoPointers,
      }),
      4: Int32Field.create({
        parent: this,
        fieldKey: 4,
        fieldName: "speed",
        pointerRules: NoPointers,
      }),
      5: Int32Field.create({
        parent: this,
        fieldKey: 5,
        fieldName: "quantise",
        pointerRules: NoPointers,
      }),
      6: Int32Field.create({
        parent: this,
        fieldKey: 6,
        fieldName: "trigger",
        pointerRules: NoPointers,
      }),
    };
  }
}
