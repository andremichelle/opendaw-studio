import { Nullish, safeExecute, UUID, Procedure } from "opendaw-std";
import {
  Box,
  BoxConstruct,
  BoxGraph,
  NoPointers,
  PointerField,
  StringField,
  BooleanField,
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
export type TapeDeviceBoxFields = {
  1: /* host */ PointerField<Pointers.InstrumentHost>;
  2: /* label */ StringField;
  3: /* icon */ StringField;
  4: /* enabled: true */ BooleanField;
  5: /* minimized: false */ BooleanField;
  10: /* flutter */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
  11: /* wow */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
  12: /* noise */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
  13: /* saturation */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
};

export class TapeDeviceBox extends Box<
  Pointers.Device | Pointers.Selection | Pointers.Automation,
  TapeDeviceBoxFields
> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<TapeDeviceBox>,
  ): TapeDeviceBox {
    return graph.stageBox(
      new TapeDeviceBox({
        uuid,
        graph,
        name: "TapeDeviceBox",
        pointerRules: {
          accepts: [Pointers.Device, Pointers.Selection, Pointers.Automation],
          mandatory: false,
        },
      }),
      constructor,
    );
  }

  private constructor(
    construct: BoxConstruct<
      Pointers.Device | Pointers.Selection | Pointers.Automation
    >,
  ) {
    super(construct);
  }

  accept<R>(visitor: BoxVisitor<R>): Nullish<R> {
    return safeExecute(visitor.visitTapeDeviceBox, this);
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

  get flutter(): Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(10);
  }

  get wow(): Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(11);
  }

  get noise(): Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(12);
  }

  get saturation(): Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(13);
  }

  initializeFields(): TapeDeviceBoxFields {
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
      10: Float32Field.create({
        parent: this,
        fieldKey: 10,
        fieldName: "flutter",
        pointerRules: {
          accepts: [
            Pointers.Modulation,
            Pointers.Automation,
            Pointers.MidiControl,
          ],
          mandatory: false,
        },
      }),
      11: Float32Field.create({
        parent: this,
        fieldKey: 11,
        fieldName: "wow",
        pointerRules: {
          accepts: [
            Pointers.Modulation,
            Pointers.Automation,
            Pointers.MidiControl,
          ],
          mandatory: false,
        },
      }),
      12: Float32Field.create({
        parent: this,
        fieldKey: 12,
        fieldName: "noise",
        pointerRules: {
          accepts: [
            Pointers.Modulation,
            Pointers.Automation,
            Pointers.MidiControl,
          ],
          mandatory: false,
        },
      }),
      13: Float32Field.create({
        parent: this,
        fieldKey: 13,
        fieldName: "saturation",
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
