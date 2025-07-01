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
export type NoteEventCollectionBoxFields = {
  1: /* events */ Field<Pointers.NoteEvents>;
  2: /* owners */ Field<Pointers.NoteEventCollection>;
};

export class NoteEventCollectionBox extends Box<
  Pointers.Selection,
  NoteEventCollectionBoxFields
> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<NoteEventCollectionBox>,
  ): NoteEventCollectionBox {
    return graph.stageBox(
      new NoteEventCollectionBox({
        uuid,
        graph,
        name: "NoteEventCollectionBox",
        pointerRules: { accepts: [Pointers.Selection], mandatory: false },
      }),
      constructor,
    );
  }

  private constructor(construct: BoxConstruct<Pointers.Selection>) {
    super(construct);
  }

  accept<R>(visitor: BoxVisitor<R>): Nullish<R> {
    return safeExecute(visitor.visitNoteEventCollectionBox, this);
  }

  get events(): Field<Pointers.NoteEvents> {
    return this.getField(1);
  }

  get owners(): Field<Pointers.NoteEventCollection> {
    return this.getField(2);
  }

  initializeFields(): NoteEventCollectionBoxFields {
    return {
      1: Field.hook({
        parent: this,
        fieldKey: 1,
        fieldName: "events",
        pointerRules: { accepts: [Pointers.NoteEvents], mandatory: false },
      }),
      2: Field.hook({
        parent: this,
        fieldKey: 2,
        fieldName: "owners",
        pointerRules: {
          accepts: [Pointers.NoteEventCollection],
          mandatory: true,
        },
      }),
    };
  }
}
