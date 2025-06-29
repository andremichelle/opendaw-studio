import "opendaw-std";
import {
  ObjectField,
  FieldConstruct,
  Field,
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
export type DeviceUserInterfaceFields = {
  1: /* elements */ Field<Pointers.DeviceUserInterface>;
};

export class DeviceUserInterface extends ObjectField<DeviceUserInterfaceFields> {
  static create(
    construct: FieldConstruct<UnreferenceableType>,
  ): DeviceUserInterface {
    return new DeviceUserInterface(construct);
  }

  private constructor(construct: FieldConstruct<UnreferenceableType>) {
    super(construct);
  }

  get elements(): Field<Pointers.DeviceUserInterface> {
    return this.getField(1);
  }

  initializeFields(): DeviceUserInterfaceFields {
    return {
      1: Field.hook({
        parent: this,
        fieldKey: 1,
        fieldName: "elements",
        pointerRules: {
          accepts: [Pointers.DeviceUserInterface],
          mandatory: false,
        },
      }),
    };
  }
}
