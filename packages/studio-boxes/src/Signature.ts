import "opendaw-std";
import {
  ObjectField,
  FieldConstruct,
  NoPointers,
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
export type SignatureFields = {
  1: /* nominator: 4 */ Int32Field;
  2: /* denominator: 4 */ Int32Field;
};

export class Signature extends ObjectField<SignatureFields> {
  static create(construct: FieldConstruct<UnreferenceableType>): Signature {
    return new Signature(construct);
  }

  private constructor(construct: FieldConstruct<UnreferenceableType>) {
    super(construct);
  }

  get nominator(): Int32Field {
    return this.getField(1);
  }

  get denominator(): Int32Field {
    return this.getField(2);
  }

  initializeFields(): SignatureFields {
    return {
      1: Int32Field.create(
        {
          parent: this,
          fieldKey: 1,
          fieldName: "nominator",
          pointerRules: NoPointers,
        },
        4,
      ),
      2: Int32Field.create(
        {
          parent: this,
          fieldKey: 2,
          fieldName: "denominator",
          pointerRules: NoPointers,
        },
        4,
      ),
    };
  }
}
