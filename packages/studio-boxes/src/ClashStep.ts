import "opendaw-std";
import {
  ObjectField,
  FieldConstruct,
  BooleanField,
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
export type ClashStepFields = {
  1: /* active */ BooleanField<Pointers.StepAutomation>;
};

export class ClashStep extends ObjectField<ClashStepFields> {
  static create(construct: FieldConstruct<UnreferenceableType>): ClashStep {
    return new ClashStep(construct);
  }

  private constructor(construct: FieldConstruct<UnreferenceableType>) {
    super(construct);
  }

  get active(): BooleanField<Pointers.StepAutomation> {
    return this.getField(1);
  }

  initializeFields(): ClashStepFields {
    return {
      1: BooleanField.create({
        parent: this,
        fieldKey: 1,
        fieldName: "active",
        pointerRules: { accepts: [Pointers.StepAutomation], mandatory: false },
      }),
    };
  }
}
