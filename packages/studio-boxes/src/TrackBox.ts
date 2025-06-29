import { Nullish, safeExecute, UUID, Procedure } from "opendaw-std";
import {
  Box,
  BoxConstruct,
  BoxGraph,
  NoPointers,
  PointerField,
  Field,
  Int32Field,
  BooleanField,
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
export type TrackBoxFields = {
  1: /* tracks */ PointerField<Pointers.TrackCollection>;
  2: /* target */ PointerField<Pointers.Automation>;
  3: /* regions */ Field<Pointers.RegionCollection>;
  4: /* clips */ Field<Pointers.ClipCollection>;
  10: /* index */ Int32Field;
  11: /* type */ Int32Field;
  20: /* enabled: true */ BooleanField;
  30: /* excludePianoMode: false */ BooleanField;
};

export class TrackBox extends Box<
  Pointers.Selection | Pointers.PianoMode,
  TrackBoxFields
> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<TrackBox>,
  ): TrackBox {
    return graph.stageBox(
      new TrackBox({
        uuid,
        graph,
        name: "TrackBox",
        pointerRules: {
          accepts: [Pointers.Selection, Pointers.PianoMode],
          mandatory: false,
        },
      }),
      constructor,
    );
  }

  private constructor(
    construct: BoxConstruct<Pointers.Selection | Pointers.PianoMode>,
  ) {
    super(construct);
  }

  accept<R>(visitor: BoxVisitor<R>): Nullish<R> {
    return safeExecute(visitor.visitTrackBox, this);
  }

  get tracks(): PointerField<Pointers.TrackCollection> {
    return this.getField(1);
  }

  get target(): PointerField<Pointers.Automation> {
    return this.getField(2);
  }

  get regions(): Field<Pointers.RegionCollection> {
    return this.getField(3);
  }

  get clips(): Field<Pointers.ClipCollection> {
    return this.getField(4);
  }

  get index(): Int32Field {
    return this.getField(10);
  }

  get type(): Int32Field {
    return this.getField(11);
  }

  get enabled(): BooleanField {
    return this.getField(20);
  }

  get excludePianoMode(): BooleanField {
    return this.getField(30);
  }

  initializeFields(): TrackBoxFields {
    return {
      1: PointerField.create(
        {
          parent: this,
          fieldKey: 1,
          fieldName: "tracks",
          pointerRules: NoPointers,
        },
        Pointers.TrackCollection,
        true,
      ),
      2: PointerField.create(
        {
          parent: this,
          fieldKey: 2,
          fieldName: "target",
          pointerRules: NoPointers,
        },
        Pointers.Automation,
        true,
      ),
      3: Field.hook({
        parent: this,
        fieldKey: 3,
        fieldName: "regions",
        pointerRules: {
          accepts: [Pointers.RegionCollection],
          mandatory: false,
        },
      }),
      4: Field.hook({
        parent: this,
        fieldKey: 4,
        fieldName: "clips",
        pointerRules: { accepts: [Pointers.ClipCollection], mandatory: false },
      }),
      10: Int32Field.create({
        parent: this,
        fieldKey: 10,
        fieldName: "index",
        pointerRules: NoPointers,
      }),
      11: Int32Field.create({
        parent: this,
        fieldKey: 11,
        fieldName: "type",
        pointerRules: NoPointers,
      }),
      20: BooleanField.create(
        {
          parent: this,
          fieldKey: 20,
          fieldName: "enabled",
          pointerRules: NoPointers,
        },
        true,
      ),
      30: BooleanField.create(
        {
          parent: this,
          fieldKey: 30,
          fieldName: "excludePianoMode",
          pointerRules: NoPointers,
        },
        false,
      ),
    };
  }
}
