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
export type ModuleDelayBoxFields = {
  1: /* attributes */ ModuleAttributes;
  10: /* voltageInput */ Field<Pointers.VoltageConnection>;
  11: /* voltageOutput */ Field<Pointers.VoltageConnection>;
  20: /* time: 500 */ Float32Field<Pointers.ParameterController>;
};

export class ModuleDelayBox extends Box<
  Pointers.Selection,
  ModuleDelayBoxFields
> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<ModuleDelayBox>,
  ): ModuleDelayBox {
    return graph.stageBox(
      new ModuleDelayBox({
        uuid,
        graph,
        name: "ModuleDelayBox",
        pointerRules: { accepts: [Pointers.Selection], mandatory: false },
      }),
      constructor,
    );
  }

  private constructor(construct: BoxConstruct<Pointers.Selection>) {
    super(construct);
  }

  accept<R>(visitor: BoxVisitor<R>): Nullish<R> {
    return safeExecute(visitor.visitModuleDelayBox, this);
  }

  get attributes(): ModuleAttributes {
    return this.getField(1);
  }

  get voltageInput(): Field<Pointers.VoltageConnection> {
    return this.getField(10);
  }

  get voltageOutput(): Field<Pointers.VoltageConnection> {
    return this.getField(11);
  }

  get time(): Float32Field<Pointers.ParameterController> {
    return this.getField(20);
  }

  initializeFields(): ModuleDelayBoxFields {
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
        fieldName: "voltageInput",
        pointerRules: {
          accepts: [Pointers.VoltageConnection],
          mandatory: false,
        },
      }),
      11: Field.hook({
        parent: this,
        fieldKey: 11,
        fieldName: "voltageOutput",
        pointerRules: {
          accepts: [Pointers.VoltageConnection],
          mandatory: false,
        },
      }),
      20: Float32Field.create(
        {
          parent: this,
          fieldKey: 20,
          fieldName: "time",
          pointerRules: {
            accepts: [Pointers.ParameterController],
            mandatory: false,
          },
        },
        500,
      ),
    };
  }
}
