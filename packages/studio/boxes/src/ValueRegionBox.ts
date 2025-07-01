import { Nullish, safeExecute, UUID, Procedure } from "lib-std";
import {
  Box,
  BoxConstruct,
  BoxGraph,
  NoPointers,
  PointerField,
  Int32Field,
  BooleanField,
  StringField,
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
export type ValueRegionBoxFields = {
  1: /* regions */ PointerField<Pointers.RegionCollection>;
  2: /* events */ PointerField<Pointers.ValueEventCollection>;
  10: /* position */ Int32Field;
  11: /* duration */ Int32Field;
  12: /* loopOffset */ Int32Field;
  13: /* loopDuration */ Int32Field;
  14: /* mute */ BooleanField;
  15: /* label */ StringField;
  16: /* hue */ Int32Field;
};

export class ValueRegionBox extends Box<
  Pointers.Selection | Pointers.Editing,
  ValueRegionBoxFields
> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<ValueRegionBox>,
  ): ValueRegionBox {
    return graph.stageBox(
      new ValueRegionBox({
        uuid,
        graph,
        name: "ValueRegionBox",
        pointerRules: {
          accepts: [Pointers.Selection, Pointers.Editing],
          mandatory: false,
        },
      }),
      constructor,
    );
  }

  private constructor(
    construct: BoxConstruct<Pointers.Selection | Pointers.Editing>,
  ) {
    super(construct);
  }

  accept<R>(visitor: BoxVisitor<R>): Nullish<R> {
    return safeExecute(visitor.visitValueRegionBox, this);
  }

  get regions(): PointerField<Pointers.RegionCollection> {
    return this.getField(1);
  }

  get events(): PointerField<Pointers.ValueEventCollection> {
    return this.getField(2);
  }

  get position(): Int32Field {
    return this.getField(10);
  }

  get duration(): Int32Field {
    return this.getField(11);
  }

  get loopOffset(): Int32Field {
    return this.getField(12);
  }

  get loopDuration(): Int32Field {
    return this.getField(13);
  }

  get mute(): BooleanField {
    return this.getField(14);
  }

  get label(): StringField {
    return this.getField(15);
  }

  get hue(): Int32Field {
    return this.getField(16);
  }

  initializeFields(): ValueRegionBoxFields {
    return {
      1: PointerField.create(
        {
          parent: this,
          fieldKey: 1,
          fieldName: "regions",
          pointerRules: NoPointers,
        },
        Pointers.RegionCollection,
        true,
      ),
      2: PointerField.create(
        {
          parent: this,
          fieldKey: 2,
          fieldName: "events",
          pointerRules: NoPointers,
        },
        Pointers.ValueEventCollection,
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
        fieldName: "duration",
        pointerRules: NoPointers,
      }),
      12: Int32Field.create({
        parent: this,
        fieldKey: 12,
        fieldName: "loopOffset",
        pointerRules: NoPointers,
      }),
      13: Int32Field.create({
        parent: this,
        fieldKey: 13,
        fieldName: "loopDuration",
        pointerRules: NoPointers,
      }),
      14: BooleanField.create({
        parent: this,
        fieldKey: 14,
        fieldName: "mute",
        pointerRules: NoPointers,
      }),
      15: StringField.create({
        parent: this,
        fieldKey: 15,
        fieldName: "label",
        pointerRules: NoPointers,
      }),
      16: Int32Field.create({
        parent: this,
        fieldKey: 16,
        fieldName: "hue",
        pointerRules: NoPointers,
      }),
    };
  }
}
