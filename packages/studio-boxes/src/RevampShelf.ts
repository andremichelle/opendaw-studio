import "opendaw-std";
import {
  ObjectField,
  FieldConstruct,
  BooleanField,
  Float32Field,
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
export type RevampShelfFields = {
  1: /* enabled */ BooleanField<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
  10: /* frequency */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
  11: /* gain */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
};

export class RevampShelf extends ObjectField<RevampShelfFields> {
  static create(construct: FieldConstruct<UnreferenceableType>): RevampShelf {
    return new RevampShelf(construct);
  }

  private constructor(construct: FieldConstruct<UnreferenceableType>) {
    super(construct);
  }

  get enabled(): BooleanField<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(1);
  }

  get frequency(): Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(10);
  }

  get gain(): Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(11);
  }

  initializeFields(): RevampShelfFields {
    return {
      1: BooleanField.create({
        parent: this,
        fieldKey: 1,
        fieldName: "enabled",
        pointerRules: {
          accepts: [
            Pointers.Modulation,
            Pointers.Automation,
            Pointers.MidiControl,
          ],
          mandatory: false,
        },
      }),
      10: Float32Field.create({
        parent: this,
        fieldKey: 10,
        fieldName: "frequency",
        pointerRules: {
          accepts: [
            Pointers.Modulation,
            Pointers.Automation,
            Pointers.MidiControl,
          ],
          mandatory: false,
        },
      }),
      11: Float32Field.create({
        parent: this,
        fieldKey: 11,
        fieldName: "gain",
        pointerRules: {
          accepts: [
            Pointers.Modulation,
            Pointers.Automation,
            Pointers.MidiControl,
          ],
          mandatory: false,
        },
      }),
    };
  }
}
