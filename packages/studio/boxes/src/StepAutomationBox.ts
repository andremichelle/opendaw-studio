import { Nullish, safeExecute, UUID, Procedure } from "lib-std";
import {
  Box,
  BoxConstruct,
  BoxGraph,
  NoPointers,
  PointerField,
  Float32Field,
  UnreferenceableType,
} from "lib-box";
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
export type StepAutomationBoxFields = {
  1: /* step */ PointerField<Pointers.StepAutomation>;
  2: /* parameter */ PointerField<Pointers.StepAutomation>;
  3: /* value */ Float32Field;
};

export class StepAutomationBox extends Box<
  UnreferenceableType,
  StepAutomationBoxFields
> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<StepAutomationBox>,
  ): StepAutomationBox {
    return graph.stageBox(
      new StepAutomationBox({
        uuid,
        graph,
        name: "StepAutomationBox",
        pointerRules: NoPointers,
      }),
      constructor,
    );
  }

  private constructor(construct: BoxConstruct<UnreferenceableType>) {
    super(construct);
  }

  accept<R>(visitor: BoxVisitor<R>): Nullish<R> {
    return safeExecute(visitor.visitStepAutomationBox, this);
  }

  get step(): PointerField<Pointers.StepAutomation> {
    return this.getField(1);
  }

  get parameter(): PointerField<Pointers.StepAutomation> {
    return this.getField(2);
  }

  get value(): Float32Field {
    return this.getField(3);
  }

  initializeFields(): StepAutomationBoxFields {
    return {
      1: PointerField.create(
        {
          parent: this,
          fieldKey: 1,
          fieldName: "step",
          pointerRules: NoPointers,
        },
        Pointers.StepAutomation,
        true,
      ),
      2: PointerField.create(
        {
          parent: this,
          fieldKey: 2,
          fieldName: "parameter",
          pointerRules: NoPointers,
        },
        Pointers.StepAutomation,
        true,
      ),
      3: Float32Field.create({
        parent: this,
        fieldKey: 3,
        fieldName: "value",
        pointerRules: NoPointers,
      }),
    };
  }
}
