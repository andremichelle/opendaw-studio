import { Nullish, safeExecute, UUID, Procedure } from "lib-std";
import { Box, BoxConstruct, BoxGraph, NoPointers, Field } from "lib-box";
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
export type ModularAudioOutputBoxFields = {
  1: /* attributes */ ModuleAttributes;
  10: /* input */ Field<Pointers.VoltageConnection>;
};

export class ModularAudioOutputBox extends Box<
  Pointers.Selection,
  ModularAudioOutputBoxFields
> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<ModularAudioOutputBox>,
  ): ModularAudioOutputBox {
    return graph.stageBox(
      new ModularAudioOutputBox({
        uuid,
        graph,
        name: "ModularAudioOutputBox",
        pointerRules: { accepts: [Pointers.Selection], mandatory: false },
      }),
      constructor,
    );
  }

  private constructor(construct: BoxConstruct<Pointers.Selection>) {
    super(construct);
  }

  accept<R>(visitor: BoxVisitor<R>): Nullish<R> {
    return safeExecute(visitor.visitModularAudioOutputBox, this);
  }

  get attributes(): ModuleAttributes {
    return this.getField(1);
  }

  get input(): Field<Pointers.VoltageConnection> {
    return this.getField(10);
  }

  initializeFields(): ModularAudioOutputBoxFields {
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
        fieldName: "input",
        pointerRules: {
          accepts: [Pointers.VoltageConnection],
          mandatory: false,
        },
      }),
    };
  }
}
