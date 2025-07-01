import "lib-std";
import {
  ObjectField,
  FieldConstruct,
  NoPointers,
  PointerField,
  StringField,
  Int32Field,
  BooleanField,
  UnreferenceableType,
} from "lib-box";
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
export type ModuleAttributesFields = {
  1: /* collection */ PointerField<Pointers.ModuleCollection>;
  2: /* label */ StringField;
  3: /* x */ Int32Field;
  4: /* y */ Int32Field;
  5: /* collapsed: false */ BooleanField;
  6: /* removable: true */ BooleanField;
};

export class ModuleAttributes extends ObjectField<ModuleAttributesFields> {
  static create(
    construct: FieldConstruct<UnreferenceableType>,
  ): ModuleAttributes {
    return new ModuleAttributes(construct);
  }

  private constructor(construct: FieldConstruct<UnreferenceableType>) {
    super(construct);
  }

  get collection(): PointerField<Pointers.ModuleCollection> {
    return this.getField(1);
  }

  get label(): StringField {
    return this.getField(2);
  }

  get x(): Int32Field {
    return this.getField(3);
  }

  get y(): Int32Field {
    return this.getField(4);
  }

  get collapsed(): BooleanField {
    return this.getField(5);
  }

  get removable(): BooleanField {
    return this.getField(6);
  }

  initializeFields(): ModuleAttributesFields {
    return {
      1: PointerField.create(
        {
          parent: this,
          fieldKey: 1,
          fieldName: "collection",
          pointerRules: NoPointers,
        },
        Pointers.ModuleCollection,
        true,
      ),
      2: StringField.create({
        parent: this,
        fieldKey: 2,
        fieldName: "label",
        pointerRules: NoPointers,
      }),
      3: Int32Field.create({
        parent: this,
        fieldKey: 3,
        fieldName: "x",
        pointerRules: NoPointers,
      }),
      4: Int32Field.create({
        parent: this,
        fieldKey: 4,
        fieldName: "y",
        pointerRules: NoPointers,
      }),
      5: BooleanField.create(
        {
          parent: this,
          fieldKey: 5,
          fieldName: "collapsed",
          pointerRules: NoPointers,
        },
        false,
      ),
      6: BooleanField.create(
        {
          parent: this,
          fieldKey: 6,
          fieldName: "removable",
          pointerRules: NoPointers,
        },
        true,
      ),
    };
  }
}
