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
export type ReverbDeviceBoxFields = {
  1: /* host */ PointerField<Pointers.AudioEffectHost>;
  2: /* index */ Int32Field;
  3: /* label */ StringField;
  4: /* enabled: true */ BooleanField;
  5: /* minimized: false */ BooleanField;
  10: /* decay: 0.5 */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
  11: /* preDelay: 0 */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
  12: /* damp: 0.5 */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
  13: /* filter: 0 */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
  14: /* wet: -3 */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
  15: /* dry: 0 */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
};

export class ReverbDeviceBox extends Box<
  Pointers.Device | Pointers.Selection,
  ReverbDeviceBoxFields
> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<ReverbDeviceBox>,
  ): ReverbDeviceBox {
    return graph.stageBox(
      new ReverbDeviceBox({
        uuid,
        graph,
        name: "ReverbDeviceBox",
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
    return safeExecute(visitor.visitReverbDeviceBox, this);
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

  get decay(): Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(10);
  }

  get preDelay(): Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(11);
  }

  get damp(): Float32Field<
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

  initializeFields(): ReverbDeviceBoxFields {
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
          fieldName: "decay",
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
      11: Float32Field.create(
        {
          parent: this,
          fieldKey: 11,
          fieldName: "preDelay",
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
      12: Float32Field.create(
        {
          parent: this,
          fieldKey: 12,
          fieldName: "damp",
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
        -3,
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
