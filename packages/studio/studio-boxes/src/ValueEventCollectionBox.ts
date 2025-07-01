import { Nullish, safeExecute, UUID, Procedure } from "lib-std";
import { Box, BoxConstruct, BoxGraph, Field } from "lib-box";
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
export type ValueEventCollectionBoxFields = {
  1: /* events */ Field<Pointers.ValueEvents>;
  2: /* owners */ Field<Pointers.ValueEventCollection>;
};

export class ValueEventCollectionBox extends Box<
  Pointers.Selection,
  ValueEventCollectionBoxFields
> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<ValueEventCollectionBox>,
  ): ValueEventCollectionBox {
    return graph.stageBox(
      new ValueEventCollectionBox({
        uuid,
        graph,
        name: "ValueEventCollectionBox",
        pointerRules: { accepts: [Pointers.Selection], mandatory: false },
      }),
      constructor,
    );
  }

  private constructor(construct: BoxConstruct<Pointers.Selection>) {
    super(construct);
  }

  accept<R>(visitor: BoxVisitor<R>): Nullish<R> {
    return safeExecute(visitor.visitValueEventCollectionBox, this);
  }

  get events(): Field<Pointers.ValueEvents> {
    return this.getField(1);
  }

  get owners(): Field<Pointers.ValueEventCollection> {
    return this.getField(2);
  }

  initializeFields(): ValueEventCollectionBoxFields {
    return {
      1: Field.hook({
        parent: this,
        fieldKey: 1,
        fieldName: "events",
        pointerRules: { accepts: [Pointers.ValueEvents], mandatory: false },
      }),
      2: Field.hook({
        parent: this,
        fieldKey: 2,
        fieldName: "owners",
        pointerRules: {
          accepts: [Pointers.ValueEventCollection],
          mandatory: true,
        },
      }),
    };
  }
}
