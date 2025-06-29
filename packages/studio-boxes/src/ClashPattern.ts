import "opendaw-std";
import {
  ObjectField,
  FieldConstruct,
  NoPointers,
  ArrayField,
  Int32Field,
  UnreferenceableType,
} from "opendaw-box";
import { ClashStep } from "./ClashStep";

//
//   ___          ___
//  | _ ) _____ _| __|__ _ _ __ _ ___
//  | _ \/ _ \ \ / _/ _ \ '_/ _` / -_)
//  |___/\___/_\_\_|\___/_| \__, \___|
//                         |___/
//
//  auto-generated | do not edit | blame andre.michelle@gmail.com
//
export type ClashPatternFields = {
  10: /* steps */ ArrayField<ClashStep>;
  11: /* length: 16 */ Int32Field;
  12: /* scale: 960 */ Int32Field;
};

export class ClashPattern extends ObjectField<ClashPatternFields> {
  static create(construct: FieldConstruct<UnreferenceableType>): ClashPattern {
    return new ClashPattern(construct);
  }

  private constructor(construct: FieldConstruct<UnreferenceableType>) {
    super(construct);
  }

  get steps(): ArrayField<ClashStep> {
    return this.getField(10);
  }

  get length(): Int32Field {
    return this.getField(11);
  }

  get scale(): Int32Field {
    return this.getField(12);
  }

  initializeFields(): ClashPatternFields {
    return {
      10: ArrayField.create(
        {
          parent: this,
          fieldKey: 10,
          fieldName: "steps",
          pointerRules: NoPointers,
        },
        (construct) => ClashStep.create(construct),
        128,
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
    };
  }
}
