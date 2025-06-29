import { Nullish, safeExecute, UUID, Procedure } from "opendaw-std";
import {
  Box,
  BoxConstruct,
  BoxGraph,
  NoPointers,
  PointerField,
  Int32Field,
  StringField,
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
export type MarkerBoxFields = {
  1: /* track */ PointerField<Pointers.MarkerTrack>;
  2: /* position */ Int32Field;
  3: /* plays: 1 */ Int32Field;
  4: /* label */ StringField;
  5: /* hue */ Int32Field;
};

export class MarkerBox extends Box<Pointers.Selection, MarkerBoxFields> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<MarkerBox>,
  ): MarkerBox {
    return graph.stageBox(
      new MarkerBox({
        uuid,
        graph,
        name: "MarkerBox",
        pointerRules: { accepts: [Pointers.Selection], mandatory: false },
      }),
      constructor,
    );
  }

  private constructor(construct: BoxConstruct<Pointers.Selection>) {
    super(construct);
  }

  accept<R>(visitor: BoxVisitor<R>): Nullish<R> {
    return safeExecute(visitor.visitMarkerBox, this);
  }

  get track(): PointerField<Pointers.MarkerTrack> {
    return this.getField(1);
  }

  get position(): Int32Field {
    return this.getField(2);
  }

  get plays(): Int32Field {
    return this.getField(3);
  }

  get label(): StringField {
    return this.getField(4);
  }

  get hue(): Int32Field {
    return this.getField(5);
  }

  initializeFields(): MarkerBoxFields {
    return {
      1: PointerField.create(
        {
          parent: this,
          fieldKey: 1,
          fieldName: "track",
          pointerRules: NoPointers,
        },
        Pointers.MarkerTrack,
        true,
      ),
      2: Int32Field.create({
        parent: this,
        fieldKey: 2,
        fieldName: "position",
        pointerRules: NoPointers,
      }),
      3: Int32Field.create(
        {
          parent: this,
          fieldKey: 3,
          fieldName: "plays",
          pointerRules: NoPointers,
        },
        1,
      ),
      4: StringField.create({
        parent: this,
        fieldKey: 4,
        fieldName: "label",
        pointerRules: NoPointers,
      }),
      5: Int32Field.create({
        parent: this,
        fieldKey: 5,
        fieldName: "hue",
        pointerRules: NoPointers,
      }),
    };
  }
}
