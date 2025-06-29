import { Nullish, safeExecute, UUID, Procedure } from "opendaw-std";
import {
  Box,
  BoxConstruct,
  BoxGraph,
  NoPointers,
  Field,
  Float32Field,
} from "opendaw-box";
import { ModuleAttributes } from "./ModuleAttributes";
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
export type ModuleMultiplierBoxFields = {
  1: /* attributes */ ModuleAttributes;
  10: /* voltageInputX */ Field<Pointers.VoltageConnection>;
  11: /* voltageInputY */ Field<Pointers.VoltageConnection>;
  12: /* voltageOutput */ Field<Pointers.VoltageConnection>;
  20: /* multiplier */ Float32Field;
};

export class ModuleMultiplierBox extends Box<
  Pointers.Selection,
  ModuleMultiplierBoxFields
> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<ModuleMultiplierBox>,
  ): ModuleMultiplierBox {
    return graph.stageBox(
      new ModuleMultiplierBox({
        uuid,
        graph,
        name: "ModuleMultiplierBox",
        pointerRules: { accepts: [Pointers.Selection], mandatory: false },
      }),
      constructor,
    );
  }

  private constructor(construct: BoxConstruct<Pointers.Selection>) {
    super(construct);
  }

  accept<R>(visitor: BoxVisitor<R>): Nullish<R> {
    return safeExecute(visitor.visitModuleMultiplierBox, this);
  }

  get attributes(): ModuleAttributes {
    return this.getField(1);
  }

  get voltageInputX(): Field<Pointers.VoltageConnection> {
    return this.getField(10);
  }

  get voltageInputY(): Field<Pointers.VoltageConnection> {
    return this.getField(11);
  }

  get voltageOutput(): Field<Pointers.VoltageConnection> {
    return this.getField(12);
  }

  get multiplier(): Float32Field {
    return this.getField(20);
  }

  initializeFields(): ModuleMultiplierBoxFields {
    return {
      1: ModuleAttributes.create({
        parent: this,
        fieldKey: 1,
        fieldName: "attributes",
        pointerRules: NoPointers,
      }),
      10: Field.hook({
        parent: this,
        fieldKey: 10,
        fieldName: "voltageInputX",
        pointerRules: {
          accepts: [Pointers.VoltageConnection],
          mandatory: false,
        },
      }),
      11: Field.hook({
        parent: this,
        fieldKey: 11,
        fieldName: "voltageInputY",
        pointerRules: {
          accepts: [Pointers.VoltageConnection],
          mandatory: false,
        },
      }),
      12: Field.hook({
        parent: this,
        fieldKey: 12,
        fieldName: "voltageOutput",
        pointerRules: {
          accepts: [Pointers.VoltageConnection],
          mandatory: false,
        },
      }),
      20: Float32Field.create({
        parent: this,
        fieldKey: 20,
        fieldName: "multiplier",
        pointerRules: NoPointers,
      }),
    };
  }
}
