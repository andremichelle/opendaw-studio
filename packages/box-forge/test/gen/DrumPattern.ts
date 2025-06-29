import "std";
import {
  ObjectField,
  FieldConstruct,
  NoPointers,
  PointerField,
  Int32Field,
  ArrayField,
  UnreferenceableType,
} from "opendaw-box";
import { DrumStep } from "./DrumStep";
import { PointerType } from "../pointers";

//
//   ___          ___
//  | _ ) _____ _| __|__ _ _ __ _ ___
//  | _ \/ _ \ \ / _/ _ \ '_/ _` / -_)
//  |___/\___/_\_\_|\___/_| \__, \___|
//                         |___/
//
//  auto-generated | do not edit | blame andre.michelle@gmail.com
//
export type DrumPatternFields = {
  10: /* groove */ PointerField<PointerType.Groove>;
  11: /* length: 16 */ Int32Field;
  12: /* scale: 960 */ Int32Field;
  13: /* steps */ ArrayField<DrumStep>;
};

export class DrumPattern extends ObjectField<DrumPatternFields> {
  static create(construct: FieldConstruct<UnreferenceableType>): DrumPattern {
    return new DrumPattern(construct);
  }

  private constructor(construct: FieldConstruct<UnreferenceableType>) {
    super(construct);
  }

  get groove(): PointerField<PointerType.Groove> {
    return this.getField(10);
  }

  get length(): Int32Field {
    return this.getField(11);
  }

  get scale(): Int32Field {
    return this.getField(12);
  }

  get steps(): ArrayField<DrumStep> {
    return this.getField(13);
  }

  initializeFields(): DrumPatternFields {
    return {
      10: PointerField.create(
        {
          parent: this,
          fieldKey: 10,
          fieldName: "groove",
          pointerRules: NoPointers,
        },
        PointerType.Groove,
        false,
      ),
      11: Int32Field.create(
        {
          parent: this,
          fieldKey: 11,
          fieldName: "length",
          pointerRules: NoPointers,
        },
        16,
      ),
      12: Int32Field.create(
        {
          parent: this,
          fieldKey: 12,
          fieldName: "scale",
          pointerRules: NoPointers,
        },
        960,
      ),
      13: ArrayField.create(
        {
          parent: this,
          fieldKey: 13,
          fieldName: "steps",
          pointerRules: NoPointers,
        },
        (construct) => DrumStep.create(construct),
        64,
      ),
    };
  }
}
