import { Nullish, safeExecute, UUID, Procedure } from "lib-std";
import {
  Box,
  BoxConstruct,
  BoxGraph,
  NoPointers,
  PointerField,
  Int32Field,
  StringField,
  BooleanField,
} from "lib-box";
import { DeviceUserInterface } from "./DeviceUserInterface";
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
export type ModularDeviceBoxFields = {
  1: /* host */ PointerField<Pointers.AudioEffectHost>;
  2: /* index */ Int32Field;
  3: /* label */ StringField;
  4: /* enabled: true */ BooleanField;
  5: /* minimized: false */ BooleanField;
  10: /* modularSetup */ PointerField<Pointers.ModularSetup>;
  11: /* userInterface */ DeviceUserInterface;
};

export class ModularDeviceBox extends Box<
  Pointers.Device | Pointers.Selection,
  ModularDeviceBoxFields
> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<ModularDeviceBox>,
  ): ModularDeviceBox {
    return graph.stageBox(
      new ModularDeviceBox({
        uuid,
        graph,
        name: "ModularDeviceBox",
        pointerRules: {
          accepts: [Pointers.Device, Pointers.Selection],
          mandatory: false,
        },
      }),
      constructor,
    );
  }

  private constructor(
    construct: BoxConstruct<Pointers.Device | Pointers.Selection>,
  ) {
    super(construct);
  }

  accept<R>(visitor: BoxVisitor<R>): Nullish<R> {
    return safeExecute(visitor.visitModularDeviceBox, this);
  }

  get host(): PointerField<Pointers.AudioEffectHost> {
    return this.getField(1);
  }

  get index(): Int32Field {
    return this.getField(2);
  }

  get label(): StringField {
    return this.getField(3);
  }

  get enabled(): BooleanField {
    return this.getField(4);
  }

  get minimized(): BooleanField {
    return this.getField(5);
  }

  get modularSetup(): PointerField<Pointers.ModularSetup> {
    return this.getField(10);
  }

  get userInterface(): DeviceUserInterface {
    return this.getField(11);
  }

  initializeFields(): ModularDeviceBoxFields {
    return {
      1: PointerField.create(
        {
          parent: this,
          fieldKey: 1,
          fieldName: "host",
          pointerRules: NoPointers,
        },
        Pointers.AudioEffectHost,
        true,
      ),
      2: Int32Field.create({
        parent: this,
        fieldKey: 2,
        fieldName: "index",
        pointerRules: NoPointers,
      }),
      3: StringField.create({
        parent: this,
        fieldKey: 3,
        fieldName: "label",
        pointerRules: NoPointers,
      }),
      4: BooleanField.create(
        {
          parent: this,
          fieldKey: 4,
          fieldName: "enabled",
          pointerRules: NoPointers,
        },
        true,
      ),
      5: BooleanField.create(
        {
          parent: this,
          fieldKey: 5,
          fieldName: "minimized",
          pointerRules: NoPointers,
        },
        false,
      ),
      10: PointerField.create(
        {
          parent: this,
          fieldKey: 10,
          fieldName: "modularSetup",
          pointerRules: NoPointers,
        },
        Pointers.ModularSetup,
        true,
      ),
      11: DeviceUserInterface.create({
        parent: this,
        fieldKey: 11,
        fieldName: "userInterface",
        pointerRules: NoPointers,
      }),
    };
  }
}
