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
export type DelayDeviceBoxFields = {
  1: /* host */ PointerField<Pointers.AudioEffectHost>;
  2: /* index */ Int32Field;
  3: /* label */ StringField;
  4: /* enabled: true */ BooleanField;
  5: /* minimized: false */ BooleanField;
  10: /* delay: 4 */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
  11: /* feedback: 0.5 */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
  12: /* cross: 0 */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
  13: /* filter: 0 */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
  14: /* wet: -6 */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
  15: /* dry: 0 */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
};

export class DelayDeviceBox extends Box<
  Pointers.Device | Pointers.Selection,
  DelayDeviceBoxFields
> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<DelayDeviceBox>,
  ): DelayDeviceBox {
    return graph.stageBox(
      new DelayDeviceBox({
        uuid,
        graph,
        name: "DelayDeviceBox",
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
    return safeExecute(visitor.visitDelayDeviceBox, this);
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

  get delay(): Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(10);
  }

  get feedback(): Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(11);
  }

  get cross(): Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(12);
  }

  get filter(): Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(13);
  }

  get wet(): Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(14);
  }

  get dry(): Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(15);
  }

  initializeFields(): DelayDeviceBoxFields {
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
      10: Float32Field.create(
        {
          parent: this,
          fieldKey: 10,
          fieldName: "delay",
          pointerRules: {
            accepts: [
              Pointers.Modulation,
              Pointers.Automation,
              Pointers.MidiControl,
            ],
            mandatory: false,
          },
        },
        4,
      ),
      11: Float32Field.create(
        {
          parent: this,
          fieldKey: 11,
          fieldName: "feedback",
          pointerRules: {
            accepts: [
              Pointers.Modulation,
              Pointers.Automation,
              Pointers.MidiControl,
            ],
            mandatory: false,
          },
        },
        0.5,
      ),
      12: Float32Field.create(
        {
          parent: this,
          fieldKey: 12,
          fieldName: "cross",
          pointerRules: {
            accepts: [
              Pointers.Modulation,
              Pointers.Automation,
              Pointers.MidiControl,
            ],
            mandatory: false,
          },
        },
        0,
      ),
      13: Float32Field.create(
        {
          parent: this,
          fieldKey: 13,
          fieldName: "filter",
          pointerRules: {
            accepts: [
              Pointers.Modulation,
              Pointers.Automation,
              Pointers.MidiControl,
            ],
            mandatory: false,
          },
        },
        0,
      ),
      14: Float32Field.create(
        {
          parent: this,
          fieldKey: 14,
          fieldName: "wet",
          pointerRules: {
            accepts: [
              Pointers.Modulation,
              Pointers.Automation,
              Pointers.MidiControl,
            ],
            mandatory: false,
          },
        },
        -6,
      ),
      15: Float32Field.create(
        {
          parent: this,
          fieldKey: 15,
          fieldName: "dry",
          pointerRules: {
            accepts: [
              Pointers.Modulation,
              Pointers.Automation,
              Pointers.MidiControl,
            ],
            mandatory: false,
          },
        },
        0,
      ),
    };
  }
}
