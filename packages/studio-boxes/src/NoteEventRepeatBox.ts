import { Nullish, safeExecute, UUID, Procedure } from "lib-std";
import {
  Box,
  BoxConstruct,
  BoxGraph,
  NoPointers,
  PointerField,
  Int32Field,
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
export type NoteEventRepeatBoxFields = {
  1: /* event */ PointerField<Pointers.NoteEventFeature>;
  2: /* count: 1 */ Int32Field;
  3: /* curve: 0 */ Float32Field;
  4: /* length: 1 */ Float32Field;
};

export class NoteEventRepeatBox extends Box<
  UnreferenceableType,
  NoteEventRepeatBoxFields
> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<NoteEventRepeatBox>,
  ): NoteEventRepeatBox {
    return graph.stageBox(
      new NoteEventRepeatBox({
        uuid,
        graph,
        name: "NoteEventRepeatBox",
        pointerRules: NoPointers,
      }),
      constructor,
    );
  }

  private constructor(construct: BoxConstruct<UnreferenceableType>) {
    super(construct);
  }

  accept<R>(visitor: BoxVisitor<R>): Nullish<R> {
    return safeExecute(visitor.visitNoteEventRepeatBox, this);
  }

  get event(): PointerField<Pointers.NoteEventFeature> {
    return this.getField(1);
  }

  get count(): Int32Field {
    return this.getField(2);
  }

  get curve(): Float32Field {
    return this.getField(3);
  }

  get length(): Float32Field {
    return this.getField(4);
  }

  initializeFields(): NoteEventRepeatBoxFields {
    return {
      1: PointerField.create(
        {
          parent: this,
          fieldKey: 1,
          fieldName: "event",
          pointerRules: NoPointers,
        },
        Pointers.NoteEventFeature,
        true,
      ),
      2: Int32Field.create(
        {
          parent: this,
          fieldKey: 2,
          fieldName: "count",
          pointerRules: NoPointers,
        },
        1,
      ),
      3: Float32Field.create(
        {
          parent: this,
          fieldKey: 3,
          fieldName: "curve",
          pointerRules: NoPointers,
        },
        0,
      ),
      4: Float32Field.create(
        {
          parent: this,
          fieldKey: 4,
          fieldName: "length",
          pointerRules: NoPointers,
        },
        1,
      ),
    };
  }
}
