import "opendaw-std";
import {
  ObjectField,
  FieldConstruct,
  NoPointers,
  Int32Field,
  Float32Field,
  BooleanField,
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
export type PianoModeFields = {
  1: /* keyboard: 0 */ Int32Field;
  2: /* timeRangeInQuarters: 8 */ Float32Field;
  3: /* noteScale: 1.5 */ Float32Field;
  4: /* noteLabels: true */ BooleanField;
  5: /* transpose: 0 */ Int32Field;
};

export class PianoMode extends ObjectField<PianoModeFields> {
  static create(construct: FieldConstruct<UnreferenceableType>): PianoMode {
    return new PianoMode(construct);
  }

  private constructor(construct: FieldConstruct<UnreferenceableType>) {
    super(construct);
  }

  get keyboard(): Int32Field {
    return this.getField(1);
  }

  get timeRangeInQuarters(): Float32Field {
    return this.getField(2);
  }

  get noteScale(): Float32Field {
    return this.getField(3);
  }

  get noteLabels(): BooleanField {
    return this.getField(4);
  }

  get transpose(): Int32Field {
    return this.getField(5);
  }

  initializeFields(): PianoModeFields {
    return {
      1: Int32Field.create(
        {
          parent: this,
          fieldKey: 1,
          fieldName: "keyboard",
          pointerRules: NoPointers,
        },
        0,
      ),
      2: Float32Field.create(
        {
          parent: this,
          fieldKey: 2,
          fieldName: "timeRangeInQuarters",
          pointerRules: NoPointers,
        },
        8,
      ),
      3: Float32Field.create(
        {
          parent: this,
          fieldKey: 3,
          fieldName: "noteScale",
          pointerRules: NoPointers,
        },
        1.5,
      ),
      4: BooleanField.create(
        {
          parent: this,
          fieldKey: 4,
          fieldName: "noteLabels",
          pointerRules: NoPointers,
        },
        true,
      ),
      5: Int32Field.create(
        {
          parent: this,
          fieldKey: 5,
          fieldName: "transpose",
          pointerRules: NoPointers,
        },
        0,
      ),
    };
  }
}
