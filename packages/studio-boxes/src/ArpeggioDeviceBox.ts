import { Nullish, safeExecute, UUID, Procedure } from "opendaw-std";
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
export type ArpeggioDeviceBoxFields = {
  1: /* host */ PointerField<Pointers.MidiEffectHost>;
  2: /* index */ Int32Field;
  3: /* label */ StringField;
  4: /* enabled: true */ BooleanField;
  5: /* minimized: false */ BooleanField;
  10: /* modeIndex */ Int32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
  11: /* numOctaves: 1 */ Int32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
  12: /* rateIndex: 9 */ Int32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
  13: /* gate: 1 */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
  14: /* repeat: 1 */ Int32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
  15: /* velocity */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
};

export class ArpeggioDeviceBox extends Box<
  Pointers.Device | Pointers.Selection,
  ArpeggioDeviceBoxFields
> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<ArpeggioDeviceBox>,
  ): ArpeggioDeviceBox {
    return graph.stageBox(
      new ArpeggioDeviceBox({
        uuid,
        graph,
        name: "ArpeggioDeviceBox",
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
    return safeExecute(visitor.visitArpeggioDeviceBox, this);
  }

  get host(): PointerField<Pointers.MidiEffectHost> {
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

  get modeIndex(): Int32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(10);
  }

  get numOctaves(): Int32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(11);
  }

  get rateIndex(): Int32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(12);
  }

  get gate(): Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(13);
  }

  get repeat(): Int32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(14);
  }

  get velocity(): Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(15);
  }

  initializeFields(): ArpeggioDeviceBoxFields {
    return {
      1: PointerField.create(
        {
          parent: this,
          fieldKey: 1,
          fieldName: "host",
          pointerRules: NoPointers,
        },
        Pointers.MidiEffectHost,
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
      10: Int32Field.create({
        parent: this,
        fieldKey: 10,
        fieldName: "modeIndex",
        pointerRules: {
          accepts: [
            Pointers.Modulation,
            Pointers.Automation,
            Pointers.MidiControl,
          ],
          mandatory: false,
        },
      }),
      11: Int32Field.create(
        {
          parent: this,
          fieldKey: 11,
          fieldName: "numOctaves",
          pointerRules: {
            accepts: [
              Pointers.Modulation,
              Pointers.Automation,
              Pointers.MidiControl,
            ],
            mandatory: false,
          },
        },
        1,
      ),
      12: Int32Field.create(
        {
          parent: this,
          fieldKey: 12,
          fieldName: "rateIndex",
          pointerRules: {
            accepts: [
              Pointers.Modulation,
              Pointers.Automation,
              Pointers.MidiControl,
            ],
            mandatory: false,
          },
        },
        9,
      ),
      13: Float32Field.create(
        {
          parent: this,
          fieldKey: 13,
          fieldName: "gate",
          pointerRules: {
            accepts: [
              Pointers.Modulation,
              Pointers.Automation,
              Pointers.MidiControl,
            ],
            mandatory: false,
          },
        },
        1,
      ),
      14: Int32Field.create(
        {
          parent: this,
          fieldKey: 14,
          fieldName: "repeat",
          pointerRules: {
            accepts: [
              Pointers.Modulation,
              Pointers.Automation,
              Pointers.MidiControl,
            ],
            mandatory: false,
          },
        },
        1,
      ),
      15: Float32Field.create({
        parent: this,
        fieldKey: 15,
        fieldName: "velocity",
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
