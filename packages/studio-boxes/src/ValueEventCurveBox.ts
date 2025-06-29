import { Nullish, safeExecute, UUID, Procedure } from "opendaw-std";
import {
  Box,
  BoxConstruct,
  BoxGraph,
  NoPointers,
  PointerField,
  Float32Field,
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
export type ValueEventCurveBoxFields = {
  1: /* event */ PointerField<Pointers.ValueInterpolation>;
  2: /* slope: 0.5 */ Float32Field;
};

export class ValueEventCurveBox extends Box<
  UnreferenceableType,
  ValueEventCurveBoxFields
> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<ValueEventCurveBox>,
  ): ValueEventCurveBox {
    return graph.stageBox(
      new ValueEventCurveBox({
        uuid,
        graph,
        name: "ValueEventCurveBox",
        pointerRules: NoPointers,
      }),
      constructor,
    );
  }

  private constructor(construct: BoxConstruct<UnreferenceableType>) {
    super(construct);
  }

  accept<R>(visitor: BoxVisitor<R>): Nullish<R> {
    return safeExecute(visitor.visitValueEventCurveBox, this);
  }

  get event(): PointerField<Pointers.ValueInterpolation> {
    return this.getField(1);
  }

  get slope(): Float32Field {
    return this.getField(2);
  }

  initializeFields(): ValueEventCurveBoxFields {
    return {
      1: PointerField.create(
        {
          parent: this,
          fieldKey: 1,
          fieldName: "event",
          pointerRules: NoPointers,
        },
        Pointers.ValueInterpolation,
        true,
      ),
      2: Float32Field.create(
        {
          parent: this,
          fieldKey: 2,
          fieldName: "slope",
          pointerRules: NoPointers,
        },
        0.5,
      ),
    };
  }
}
