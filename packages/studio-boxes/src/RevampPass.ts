import "opendaw-std";
import {
  ObjectField,
  FieldConstruct,
  BooleanField,
  Float32Field,
  Int32Field,
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
export type RevampPassFields = {
  1: /* enabled */ BooleanField<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
  10: /* frequency */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
  11: /* order */ Int32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
  12: /* q */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
};

export class RevampPass extends ObjectField<RevampPassFields> {
  static create(construct: FieldConstruct<UnreferenceableType>): RevampPass {
    return new RevampPass(construct);
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

  get order(): Int32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(11);
  }

  get q(): Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(12);
  }

  initializeFields(): RevampPassFields {
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
      11: Int32Field.create({
        parent: this,
        fieldKey: 11,
        fieldName: "order",
        pointerRules: {
          accepts: [
            Pointers.Modulation,
            Pointers.Automation,
            Pointers.MidiControl,
          ],
          mandatory: false,
        },
      }),
      12: Float32Field.create({
        parent: this,
        fieldKey: 12,
        fieldName: "q",
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
