import { Nullish, safeExecute, UUID, Procedure } from "lib-std";
import {
  Box,
  BoxConstruct,
  BoxGraph,
  NoPointers,
  PointerField,
  Int32Field,
  StringField,
  BooleanField,
  Float32Field,
} from "lib-box";
import { RevampPass } from "./RevampPass";
import { RevampShelf } from "./RevampShelf";
import { RevampBell } from "./RevampBell";
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
export type RevampDeviceBoxFields = {
  1: /* host */ PointerField<Pointers.AudioEffectHost>;
  2: /* index */ Int32Field;
  3: /* label */ StringField;
  4: /* enabled: true */ BooleanField;
  5: /* minimized: false */ BooleanField;
  10: /* highPass */ RevampPass;
  11: /* lowShelf */ RevampShelf;
  12: /* lowBell */ RevampBell;
  13: /* midBell */ RevampBell;
  14: /* highBell */ RevampBell;
  15: /* highShelf */ RevampShelf;
  16: /* lowPass */ RevampPass;
  17: /* gain */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
};

export class RevampDeviceBox extends Box<
  Pointers.Device | Pointers.Selection,
  RevampDeviceBoxFields
> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<RevampDeviceBox>,
  ): RevampDeviceBox {
    return graph.stageBox(
      new RevampDeviceBox({
        uuid,
        graph,
        name: "RevampDeviceBox",
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
    return safeExecute(visitor.visitRevampDeviceBox, this);
  }

  get host(): PointerField<Pointers.AudioEffectHost> {
    return this.getField(1);
  }

  get index(): Int32Field {
    return this.getField(2);
  }

  get label(): StringField {
    return this.getField(3);
  }

  get enabled(): BooleanField {
    return this.getField(4);
  }

  get minimized(): BooleanField {
    return this.getField(5);
  }

  get highPass(): RevampPass {
    return this.getField(10);
  }

  get lowShelf(): RevampShelf {
    return this.getField(11);
  }

  get lowBell(): RevampBell {
    return this.getField(12);
  }

  get midBell(): RevampBell {
    return this.getField(13);
  }

  get highBell(): RevampBell {
    return this.getField(14);
  }

  get highShelf(): RevampShelf {
    return this.getField(15);
  }

  get lowPass(): RevampPass {
    return this.getField(16);
  }

  get gain(): Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(17);
  }

  initializeFields(): RevampDeviceBoxFields {
    return {
      1: PointerField.create(
        {
          parent: this,
          fieldKey: 1,
          fieldName: "host",
          pointerRules: NoPointers,
        },
        Pointers.AudioEffectHost,
        true,
      ),
      2: Int32Field.create({
        parent: this,
        fieldKey: 2,
        fieldName: "index",
        pointerRules: NoPointers,
      }),
      3: StringField.create({
        parent: this,
        fieldKey: 3,
        fieldName: "label",
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
      10: RevampPass.create({
        parent: this,
        fieldKey: 10,
        fieldName: "highPass",
        pointerRules: NoPointers,
      }),
      11: RevampShelf.create({
        parent: this,
        fieldKey: 11,
        fieldName: "lowShelf",
        pointerRules: NoPointers,
      }),
      12: RevampBell.create({
        parent: this,
        fieldKey: 12,
        fieldName: "lowBell",
        pointerRules: NoPointers,
      }),
      13: RevampBell.create({
        parent: this,
        fieldKey: 13,
        fieldName: "midBell",
        pointerRules: NoPointers,
      }),
      14: RevampBell.create({
        parent: this,
        fieldKey: 14,
        fieldName: "highBell",
        pointerRules: NoPointers,
      }),
      15: RevampShelf.create({
        parent: this,
        fieldKey: 15,
        fieldName: "highShelf",
        pointerRules: NoPointers,
      }),
      16: RevampPass.create({
        parent: this,
        fieldKey: 16,
        fieldName: "lowPass",
        pointerRules: NoPointers,
      }),
      17: Float32Field.create({
        parent: this,
        fieldKey: 17,
        fieldName: "gain",
        pointerRules: {
          accepts: [
            Pointers.Modulation,
            Pointers.Automation,
            Pointers.MidiControl,
          ],
          mandatory: false,
        },
      }),
    };
  }
}
