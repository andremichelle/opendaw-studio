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
  ArrayField,
} from "opendaw-box";
import { ClashPattern } from "./ClashPattern";
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
export type DeviceClashBoxFields = {
  1: /* host */ PointerField<Pointers.InstrumentHost>;
  2: /* label */ StringField;
  3: /* icon */ StringField;
  4: /* enabled: true */ BooleanField;
  5: /* minimized: false */ BooleanField;
  10: /* delay: 0.5 */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.StepAutomation
  >;
  11: /* feedback: 0.9 */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.StepAutomation
  >;
  12: /* cross: 0 */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.StepAutomation
  >;
  13: /* filter: 0 */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.StepAutomation
  >;
  14: /* wet: -3 */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.StepAutomation
  >;
  15: /* dry: -3 */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.StepAutomation
  >;
  30: /* patterns */ ArrayField<ClashPattern>;
};

export class DeviceClashBox extends Box<
  Pointers.Device | Pointers.Selection,
  DeviceClashBoxFields
> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<DeviceClashBox>,
  ): DeviceClashBox {
    return graph.stageBox(
      new DeviceClashBox({
        uuid,
        graph,
        name: "DeviceClashBox",
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
    return safeExecute(visitor.visitDeviceClashBox, this);
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

  get delay(): Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.StepAutomation
  > {
    return this.getField(10);
  }

  get feedback(): Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.StepAutomation
  > {
    return this.getField(11);
  }

  get cross(): Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.StepAutomation
  > {
    return this.getField(12);
  }

  get filter(): Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.StepAutomation
  > {
    return this.getField(13);
  }

  get wet(): Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.StepAutomation
  > {
    return this.getField(14);
  }

  get dry(): Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.StepAutomation
  > {
    return this.getField(15);
  }

  get patterns(): ArrayField<ClashPattern> {
    return this.getField(30);
  }

  initializeFields(): DeviceClashBoxFields {
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
      10: Float32Field.create(
        {
          parent: this,
          fieldKey: 10,
          fieldName: "delay",
          pointerRules: {
            accepts: [
              Pointers.Modulation,
              Pointers.Automation,
              Pointers.StepAutomation,
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
          fieldName: "feedback",
          pointerRules: {
            accepts: [
              Pointers.Modulation,
              Pointers.Automation,
              Pointers.StepAutomation,
            ],
            mandatory: false,
          },
        },
        0.9,
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
              Pointers.StepAutomation,
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
              Pointers.StepAutomation,
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
              Pointers.StepAutomation,
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
              Pointers.StepAutomation,
            ],
            mandatory: false,
          },
        },
        -3,
      ),
      30: ArrayField.create(
        {
          parent: this,
          fieldKey: 30,
          fieldName: "patterns",
          pointerRules: NoPointers,
        },
        (construct) => ClashPattern.create(construct),
        16,
      ),
    };
  }
}
