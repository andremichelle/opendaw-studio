import { Nullish, safeExecute, UUID, Procedure } from "opendaw-std";
import { Box, BoxConstruct, BoxGraph, NoPointers, Field } from "opendaw-box";
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
export type ModularAudioInputBoxFields = {
  1: /* attributes */ ModuleAttributes;
  10: /* output */ Field<Pointers.VoltageConnection>;
};

export class ModularAudioInputBox extends Box<
  Pointers.Selection,
  ModularAudioInputBoxFields
> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<ModularAudioInputBox>,
  ): ModularAudioInputBox {
    return graph.stageBox(
      new ModularAudioInputBox({
        uuid,
        graph,
        name: "ModularAudioInputBox",
        pointerRules: { accepts: [Pointers.Selection], mandatory: false },
      }),
      constructor,
    );
  }

  private constructor(construct: BoxConstruct<Pointers.Selection>) {
    super(construct);
  }

  accept<R>(visitor: BoxVisitor<R>): Nullish<R> {
    return safeExecute(visitor.visitModularAudioInputBox, this);
  }

  get attributes(): ModuleAttributes {
    return this.getField(1);
  }

  get output(): Field<Pointers.VoltageConnection> {
    return this.getField(10);
  }

  initializeFields(): ModularAudioInputBoxFields {
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
        fieldName: "output",
        pointerRules: {
          accepts: [Pointers.VoltageConnection],
          mandatory: false,
        },
      }),
    };
  }
}
