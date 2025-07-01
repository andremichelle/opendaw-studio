import { Nullish, safeExecute, UUID, Procedure } from "lib-std";
import {
  Box,
  BoxConstruct,
  BoxGraph,
  NoPointers,
  PointerField,
  StringField,
  BooleanField,
  Field,
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
export type PlayfieldDeviceBoxFields = {
  1: /* host */ PointerField<Pointers.InstrumentHost>;
  2: /* label */ StringField;
  3: /* icon */ StringField;
  4: /* enabled: true */ BooleanField;
  5: /* minimized: false */ BooleanField;
  10: /* samples */ Field<Pointers.Sample>;
};

export class PlayfieldDeviceBox extends Box<
  Pointers.Device | Pointers.Selection,
  PlayfieldDeviceBoxFields
> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<PlayfieldDeviceBox>,
  ): PlayfieldDeviceBox {
    return graph.stageBox(
      new PlayfieldDeviceBox({
        uuid,
        graph,
        name: "PlayfieldDeviceBox",
        pointerRules: {
          accepts: [Pointers.Device, Pointers.Selection],
          mandatory: false,
        },
      }),
      constructor,
    );
  }

  private constructor(
    construct: BoxConstruct<Pointers.Device | Pointers.Selection>,
  ) {
    super(construct);
  }

  accept<R>(visitor: BoxVisitor<R>): Nullish<R> {
    return safeExecute(visitor.visitPlayfieldDeviceBox, this);
  }

  get host(): PointerField<Pointers.InstrumentHost> {
    return this.getField(1);
  }

  get label(): StringField {
    return this.getField(2);
  }

  get icon(): StringField {
    return this.getField(3);
  }

  get enabled(): BooleanField {
    return this.getField(4);
  }

  get minimized(): BooleanField {
    return this.getField(5);
  }

  get samples(): Field<Pointers.Sample> {
    return this.getField(10);
  }

  initializeFields(): PlayfieldDeviceBoxFields {
    return {
      1: PointerField.create(
        {
          parent: this,
          fieldKey: 1,
          fieldName: "host",
          pointerRules: NoPointers,
        },
        Pointers.InstrumentHost,
        true,
      ),
      2: StringField.create({
        parent: this,
        fieldKey: 2,
        fieldName: "label",
        pointerRules: NoPointers,
      }),
      3: StringField.create({
        parent: this,
        fieldKey: 3,
        fieldName: "icon",
        pointerRules: NoPointers,
      }),
      4: BooleanField.create(
        {
          parent: this,
          fieldKey: 4,
          fieldName: "enabled",
          pointerRules: NoPointers,
        },
        true,
      ),
      5: BooleanField.create(
        {
          parent: this,
          fieldKey: 5,
          fieldName: "minimized",
          pointerRules: NoPointers,
        },
        false,
      ),
      10: Field.hook({
        parent: this,
        fieldKey: 10,
        fieldName: "samples",
        pointerRules: { accepts: [Pointers.Sample], mandatory: false },
      }),
    };
  }
}
