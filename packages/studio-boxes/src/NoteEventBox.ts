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
export type NoteEventBoxFields = {
  1: /* events */ PointerField<Pointers.NoteEvents>;
  10: /* position */ Int32Field;
  11: /* duration: 240 */ Int32Field;
  20: /* pitch: 60 */ Int32Field;
  21: /* velocity: 0.7874015748031497 */ Float32Field;
  22: /* playCount: 1 */ Int32Field;
  23: /* playCurve: 0 */ Float32Field;
  24: /* cent: 0 */ Float32Field;
  25: /* chance: 100 */ Int32Field;
};

export class NoteEventBox extends Box<
  Pointers.Selection | Pointers.NoteEventFeature,
  NoteEventBoxFields
> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<NoteEventBox>,
  ): NoteEventBox {
    return graph.stageBox(
      new NoteEventBox({
        uuid,
        graph,
        name: "NoteEventBox",
        pointerRules: {
          accepts: [Pointers.Selection, Pointers.NoteEventFeature],
          mandatory: false,
        },
      }),
      constructor,
    );
  }

  private constructor(
    construct: BoxConstruct<Pointers.Selection | Pointers.NoteEventFeature>,
  ) {
    super(construct);
  }

  accept<R>(visitor: BoxVisitor<R>): Nullish<R> {
    return safeExecute(visitor.visitNoteEventBox, this);
  }

  get events(): PointerField<Pointers.NoteEvents> {
    return this.getField(1);
  }

  get position(): Int32Field {
    return this.getField(10);
  }

  get duration(): Int32Field {
    return this.getField(11);
  }

  get pitch(): Int32Field {
    return this.getField(20);
  }

  get velocity(): Float32Field {
    return this.getField(21);
  }

  get playCount(): Int32Field {
    return this.getField(22);
  }

  get playCurve(): Float32Field {
    return this.getField(23);
  }

  get cent(): Float32Field {
    return this.getField(24);
  }

  get chance(): Int32Field {
    return this.getField(25);
  }

  initializeFields(): NoteEventBoxFields {
    return {
      1: PointerField.create(
        {
          parent: this,
          fieldKey: 1,
          fieldName: "events",
          pointerRules: NoPointers,
        },
        Pointers.NoteEvents,
        true,
      ),
      10: Int32Field.create({
        parent: this,
        fieldKey: 10,
        fieldName: "position",
        pointerRules: NoPointers,
      }),
      11: Int32Field.create(
        {
          parent: this,
          fieldKey: 11,
          fieldName: "duration",
          pointerRules: NoPointers,
        },
        240,
      ),
      20: Int32Field.create(
        {
          parent: this,
          fieldKey: 20,
          fieldName: "pitch",
          pointerRules: NoPointers,
        },
        60,
      ),
      21: Float32Field.create(
        {
          parent: this,
          fieldKey: 21,
          fieldName: "velocity",
          pointerRules: NoPointers,
        },
        0.7874015748031497,
      ),
      22: Int32Field.create(
        {
          parent: this,
          fieldKey: 22,
          fieldName: "playCount",
          pointerRules: NoPointers,
        },
        1,
      ),
      23: Float32Field.create(
        {
          parent: this,
          fieldKey: 23,
          fieldName: "playCurve",
          pointerRules: NoPointers,
        },
        0,
      ),
      24: Float32Field.create(
        {
          parent: this,
          fieldKey: 24,
          fieldName: "cent",
          pointerRules: NoPointers,
        },
        0,
      ),
      25: Int32Field.create(
        {
          parent: this,
          fieldKey: 25,
          fieldName: "chance",
          pointerRules: NoPointers,
        },
        100,
      ),
    };
  }
}
