import { Nullish, safeExecute, UUID, Procedure } from "opendaw-std";
import {
  Box,
  BoxConstruct,
  BoxGraph,
  NoPointers,
  PointerField,
  Int32Field,
  Float32Field,
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
export type ValueEventBoxFields = {
  1: /* events */ PointerField<Pointers.ValueEvents>;
  10: /* position */ Int32Field;
  11: /* index */ Int32Field;
  12: /* interpolation: 1 */ Int32Field<Pointers.ValueInterpolation>;
  13: /* value */ Float32Field;
  14: /* slope */ Float32Field;
};

export class ValueEventBox extends Box<
  Pointers.Selection,
  ValueEventBoxFields
> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<ValueEventBox>,
  ): ValueEventBox {
    return graph.stageBox(
      new ValueEventBox({
        uuid,
        graph,
        name: "ValueEventBox",
        pointerRules: { accepts: [Pointers.Selection], mandatory: false },
      }),
      constructor,
    );
  }

  private constructor(construct: BoxConstruct<Pointers.Selection>) {
    super(construct);
  }

  accept<R>(visitor: BoxVisitor<R>): Nullish<R> {
    return safeExecute(visitor.visitValueEventBox, this);
  }

  get events(): PointerField<Pointers.ValueEvents> {
    return this.getField(1);
  }

  get position(): Int32Field {
    return this.getField(10);
  }

  get index(): Int32Field {
    return this.getField(11);
  }

  get interpolation(): Int32Field<Pointers.ValueInterpolation> {
    return this.getField(12);
  }

  get value(): Float32Field {
    return this.getField(13);
  }

  get slope(): Float32Field {
    return this.getField(14);
  }

  initializeFields(): ValueEventBoxFields {
    return {
      1: PointerField.create(
        {
          parent: this,
          fieldKey: 1,
          fieldName: "events",
          pointerRules: NoPointers,
        },
        Pointers.ValueEvents,
        true,
      ),
      10: Int32Field.create({
        parent: this,
        fieldKey: 10,
        fieldName: "position",
        pointerRules: NoPointers,
      }),
      11: Int32Field.create({
        parent: this,
        fieldKey: 11,
        fieldName: "index",
        pointerRules: NoPointers,
      }),
      12: Int32Field.create(
        {
          parent: this,
          fieldKey: 12,
          fieldName: "interpolation",
          pointerRules: {
            accepts: [Pointers.ValueInterpolation],
            mandatory: false,
          },
        },
        1,
      ),
      13: Float32Field.create({
        parent: this,
        fieldKey: 13,
        fieldName: "value",
        pointerRules: NoPointers,
      }),
      14: Float32Field.create({
        parent: this,
        fieldKey: 14,
        fieldName: "slope",
        pointerRules: NoPointers,
      }),
    };
  }
}
