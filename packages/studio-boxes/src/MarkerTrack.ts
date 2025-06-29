import "opendaw-std";
import {
  ObjectField,
  FieldConstruct,
  NoPointers,
  Field,
  Int32Field,
  BooleanField,
  UnreferenceableType,
} from "opendaw-box";
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
export type MarkerTrackFields = {
  1: /* markers */ Field<Pointers.MarkerTrack>;
  10: /* index */ Int32Field;
  20: /* enabled: true */ BooleanField;
};

export class MarkerTrack extends ObjectField<MarkerTrackFields> {
  static create(construct: FieldConstruct<UnreferenceableType>): MarkerTrack {
    return new MarkerTrack(construct);
  }

  private constructor(construct: FieldConstruct<UnreferenceableType>) {
    super(construct);
  }

  get markers(): Field<Pointers.MarkerTrack> {
    return this.getField(1);
  }

  get index(): Int32Field {
    return this.getField(10);
  }

  get enabled(): BooleanField {
    return this.getField(20);
  }

  initializeFields(): MarkerTrackFields {
    return {
      1: Field.hook({
        parent: this,
        fieldKey: 1,
        fieldName: "markers",
        pointerRules: { accepts: [Pointers.MarkerTrack], mandatory: false },
      }),
      10: Int32Field.create({
        parent: this,
        fieldKey: 10,
        fieldName: "index",
        pointerRules: NoPointers,
      }),
      20: BooleanField.create(
        {
          parent: this,
          fieldKey: 20,
          fieldName: "enabled",
          pointerRules: NoPointers,
        },
        true,
      ),
    };
  }
}
