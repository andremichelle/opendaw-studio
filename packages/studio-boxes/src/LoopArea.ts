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
export type LoopAreaFields = {
  1: /* enabled: true */ BooleanField;
  2: /* from: 0 */ Int32Field;
  3: /* to: 15360 */ Int32Field;
};

export class LoopArea extends ObjectField<LoopAreaFields> {
  static create(construct: FieldConstruct<UnreferenceableType>): LoopArea {
    return new LoopArea(construct);
  }

  private constructor(construct: FieldConstruct<UnreferenceableType>) {
    super(construct);
  }

  get enabled(): BooleanField {
    return this.getField(1);
  }

  get from(): Int32Field {
    return this.getField(2);
  }

  get to(): Int32Field {
    return this.getField(3);
  }

  initializeFields(): LoopAreaFields {
    return {
      1: BooleanField.create(
        {
          parent: this,
          fieldKey: 1,
          fieldName: "enabled",
          pointerRules: NoPointers,
        },
        true,
      ),
      2: Int32Field.create(
        {
          parent: this,
          fieldKey: 2,
          fieldName: "from",
          pointerRules: NoPointers,
        },
        0,
      ),
      3: Int32Field.create(
        {
          parent: this,
          fieldKey: 3,
          fieldName: "to",
          pointerRules: NoPointers,
        },
        15360,
      ),
    };
  }
}
