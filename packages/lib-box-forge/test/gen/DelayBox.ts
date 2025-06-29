import { Nullish, safeExecute, UUID, Procedure } from "lib-std";
import {
  Box,
  BoxConstruct,
  BoxGraph,
  NoPointers,
  PointerField,
  Int32Field,
  StringField,
  Float32Field,
  Field,
  UnreferenceableType,
} from "lib-box";
import { BoxVisitor } from ".";
import { PointerType } from "../pointers";

//
//   ___          ___
//  | _ ) _____ _| __|__ _ _ __ _ ___
//  | _ \/ _ \ \ / _/ _ \ '_/ _` / -_)
//  |___/\___/_\_\_|\___/_| \__, \___|
//                         |___/
//
//  auto-generated | do not edit | blame andre.michelle@gmail.com
//
export type DelayBoxFields = {
  1: /* network */ PointerField<PointerType.NetworkModule>;
  2: /* x */ Int32Field;
  3: /* y */ Int32Field;
  4: /* label */ StringField;
  10: /* delayTime */ Float32Field<
    PointerType.ParameterModulation | PointerType.ParameterAutomation
  >;
  11: /* feedback */ Float32Field<
    PointerType.ParameterModulation | PointerType.ParameterAutomation
  >;
  12: /* wet */ Float32Field<
    PointerType.ParameterModulation | PointerType.ParameterAutomation
  >;
  13: /* dry */ Float32Field<
    PointerType.ParameterModulation | PointerType.ParameterAutomation
  >;
  30: /* audioInput */ Field<PointerType.AudioInput>;
  31: /* audioOutput */ Field<PointerType.AudioOutput>;
};

export class DelayBox extends Box<UnreferenceableType, DelayBoxFields> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<DelayBox>,
  ): DelayBox {
    return graph.stageBox(
      new DelayBox({ uuid, graph, name: "DelayBox", pointerRules: NoPointers }),
      constructor,
    );
  }

  private constructor(construct: BoxConstruct<UnreferenceableType>) {
    super(construct);
  }

  accept<R>(visitor: BoxVisitor<R>): Nullish<R> {
    return safeExecute(visitor.visitDelayBox, this);
  }

  get network(): PointerField<PointerType.NetworkModule> {
    return this.getField(1);
  }

  get x(): Int32Field {
    return this.getField(2);
  }

  get y(): Int32Field {
    return this.getField(3);
  }

  get label(): StringField {
    return this.getField(4);
  }

  get delayTime(): Float32Field<
    PointerType.ParameterModulation | PointerType.ParameterAutomation
  > {
    return this.getField(10);
  }

  get feedback(): Float32Field<
    PointerType.ParameterModulation | PointerType.ParameterAutomation
  > {
    return this.getField(11);
  }

  get wet(): Float32Field<
    PointerType.ParameterModulation | PointerType.ParameterAutomation
  > {
    return this.getField(12);
  }

  get dry(): Float32Field<
    PointerType.ParameterModulation | PointerType.ParameterAutomation
  > {
    return this.getField(13);
  }

  get audioInput(): Field<PointerType.AudioInput> {
    return this.getField(30);
  }

  get audioOutput(): Field<PointerType.AudioOutput> {
    return this.getField(31);
  }

  initializeFields(): DelayBoxFields {
    return {
      1: PointerField.create(
        {
          parent: this,
          fieldKey: 1,
          fieldName: "network",
          pointerRules: NoPointers,
        },
        PointerType.NetworkModule,
        true,
      ),
      2: Int32Field.create({
        parent: this,
        fieldKey: 2,
        fieldName: "x",
        pointerRules: NoPointers,
      }),
      3: Int32Field.create({
        parent: this,
        fieldKey: 3,
        fieldName: "y",
        pointerRules: NoPointers,
      }),
      4: StringField.create({
        parent: this,
        fieldKey: 4,
        fieldName: "label",
        pointerRules: NoPointers,
      }),
      10: Float32Field.create({
        parent: this,
        fieldKey: 10,
        fieldName: "delayTime",
        pointerRules: {
          accepts: [
            PointerType.ParameterModulation,
            PointerType.ParameterAutomation,
          ],
          mandatory: false,
        },
      }),
      11: Float32Field.create({
        parent: this,
        fieldKey: 11,
        fieldName: "feedback",
        pointerRules: {
          accepts: [
            PointerType.ParameterModulation,
            PointerType.ParameterAutomation,
          ],
          mandatory: false,
        },
      }),
      12: Float32Field.create({
        parent: this,
        fieldKey: 12,
        fieldName: "wet",
        pointerRules: {
          accepts: [
            PointerType.ParameterModulation,
            PointerType.ParameterAutomation,
          ],
          mandatory: false,
        },
      }),
      13: Float32Field.create({
        parent: this,
        fieldKey: 13,
        fieldName: "dry",
        pointerRules: {
          accepts: [
            PointerType.ParameterModulation,
            PointerType.ParameterAutomation,
          ],
          mandatory: false,
        },
      }),
      30: Field.hook({
        parent: this,
        fieldKey: 30,
        fieldName: "audioInput",
        pointerRules: { accepts: [PointerType.AudioInput], mandatory: false },
      }),
      31: Field.hook({
        parent: this,
        fieldKey: 31,
        fieldName: "audioOutput",
        pointerRules: { accepts: [PointerType.AudioOutput], mandatory: false },
      }),
    };
  }
}
