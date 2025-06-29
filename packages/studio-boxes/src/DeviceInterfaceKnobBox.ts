import { Nullish, safeExecute, UUID, Procedure } from "opendaw-std";
import {
  Box,
  BoxConstruct,
  BoxGraph,
  NoPointers,
  PointerField,
  Int32Field,
  Float32Field,
  StringField,
  UnreferenceableType,
} from "opendaw-box";
import { BoxVisitor } from ".";
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
export type DeviceInterfaceKnobBoxFields = {
  1: /* userInterface */ PointerField<Pointers.DeviceUserInterface>;
  2: /* parameter */ PointerField<Pointers.ParameterController>;
  3: /* index */ Int32Field;
  10: /* anchor */ Float32Field;
  11: /* color */ StringField;
};

export class DeviceInterfaceKnobBox extends Box<
  UnreferenceableType,
  DeviceInterfaceKnobBoxFields
> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<DeviceInterfaceKnobBox>,
  ): DeviceInterfaceKnobBox {
    return graph.stageBox(
      new DeviceInterfaceKnobBox({
        uuid,
        graph,
        name: "DeviceInterfaceKnobBox",
        pointerRules: NoPointers,
      }),
      constructor,
    );
  }

  private constructor(construct: BoxConstruct<UnreferenceableType>) {
    super(construct);
  }

  accept<R>(visitor: BoxVisitor<R>): Nullish<R> {
    return safeExecute(visitor.visitDeviceInterfaceKnobBox, this);
  }

  get userInterface(): PointerField<Pointers.DeviceUserInterface> {
    return this.getField(1);
  }

  get parameter(): PointerField<Pointers.ParameterController> {
    return this.getField(2);
  }

  get index(): Int32Field {
    return this.getField(3);
  }

  get anchor(): Float32Field {
    return this.getField(10);
  }

  get color(): StringField {
    return this.getField(11);
  }

  initializeFields(): DeviceInterfaceKnobBoxFields {
    return {
      1: PointerField.create(
        {
          parent: this,
          fieldKey: 1,
          fieldName: "userInterface",
          pointerRules: NoPointers,
        },
        Pointers.DeviceUserInterface,
        true,
      ),
      2: PointerField.create(
        {
          parent: this,
          fieldKey: 2,
          fieldName: "parameter",
          pointerRules: NoPointers,
        },
        Pointers.ParameterController,
        true,
      ),
      3: Int32Field.create({
        parent: this,
        fieldKey: 3,
        fieldName: "index",
        pointerRules: NoPointers,
      }),
      10: Float32Field.create({
        parent: this,
        fieldKey: 10,
        fieldName: "anchor",
        pointerRules: NoPointers,
      }),
      11: StringField.create({
        parent: this,
        fieldKey: 11,
        fieldName: "color",
        pointerRules: NoPointers,
      }),
    };
  }
}
