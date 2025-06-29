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
  BooleanField,
  ArrayField,
  Field,
  UnreferenceableType,
} from "lib-box";
import { DrumPattern } from "./DrumPattern";
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
export type DrumBoxFields = {
  1: /* network */ PointerField<PointerType.NetworkModule>;
  2: /* x */ Int32Field;
  3: /* y */ Int32Field;
  4: /* label */ StringField;
  10: /* gain: 0 */ Float32Field<
    PointerType.ParameterModulation | PointerType.ParameterAutomation
  >;
  11: /* cutoff: 18000 */ Float32Field<
    PointerType.ParameterModulation | PointerType.ParameterAutomation
  >;
  12: /* resonance */ Float32Field<
    PointerType.ParameterModulation | PointerType.ParameterAutomation
  >;
  13: /* compressor */ BooleanField<
    PointerType.ParameterModulation | PointerType.ParameterAutomation
  >;
  20: /* patternIndex */ Int32Field;
  21: /* patterns */ ArrayField<DrumPattern>;
  30: /* audioOutput */ Field<PointerType.AudioOutput>;
};

export class DrumBox extends Box<UnreferenceableType, DrumBoxFields> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<DrumBox>,
  ): DrumBox {
    return graph.stageBox(
      new DrumBox({ uuid, graph, name: "DrumBox", pointerRules: NoPointers }),
      constructor,
    );
  }

  private constructor(construct: BoxConstruct<UnreferenceableType>) {
    super(construct);
  }

  accept<R>(visitor: BoxVisitor<R>): Nullish<R> {
    return safeExecute(visitor.visitDrumBox, this);
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

  get gain(): Float32Field<
    PointerType.ParameterModulation | PointerType.ParameterAutomation
  > {
    return this.getField(10);
  }

  get cutoff(): Float32Field<
    PointerType.ParameterModulation | PointerType.ParameterAutomation
  > {
    return this.getField(11);
  }

  get resonance(): Float32Field<
    PointerType.ParameterModulation | PointerType.ParameterAutomation
  > {
    return this.getField(12);
  }

  get compressor(): BooleanField<
    PointerType.ParameterModulation | PointerType.ParameterAutomation
  > {
    return this.getField(13);
  }

  get patternIndex(): Int32Field {
    return this.getField(20);
  }

  get patterns(): ArrayField<DrumPattern> {
    return this.getField(21);
  }

  get audioOutput(): Field<PointerType.AudioOutput> {
    return this.getField(30);
  }

  initializeFields(): DrumBoxFields {
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
      10: Float32Field.create(
        {
          parent: this,
          fieldKey: 10,
          fieldName: "gain",
          pointerRules: {
            accepts: [
              PointerType.ParameterModulation,
              PointerType.ParameterAutomation,
            ],
            mandatory: false,
          },
        },
        0,
      ),
      11: Float32Field.create(
        {
          parent: this,
          fieldKey: 11,
          fieldName: "cutoff",
          pointerRules: {
            accepts: [
              PointerType.ParameterModulation,
              PointerType.ParameterAutomation,
            ],
            mandatory: false,
          },
        },
        18000,
      ),
      12: Float32Field.create({
        parent: this,
        fieldKey: 12,
        fieldName: "resonance",
        pointerRules: {
          accepts: [
            PointerType.ParameterModulation,
            PointerType.ParameterAutomation,
          ],
          mandatory: false,
        },
      }),
      13: BooleanField.create({
        parent: this,
        fieldKey: 13,
        fieldName: "compressor",
        pointerRules: {
          accepts: [
            PointerType.ParameterModulation,
            PointerType.ParameterAutomation,
          ],
          mandatory: false,
        },
      }),
      20: Int32Field.create({
        parent: this,
        fieldKey: 20,
        fieldName: "patternIndex",
        pointerRules: NoPointers,
      }),
      21: ArrayField.create(
        {
          parent: this,
          fieldKey: 21,
          fieldName: "patterns",
          pointerRules: NoPointers,
        },
        (construct) => DrumPattern.create(construct),
        28,
      ),
      30: Field.hook({
        parent: this,
        fieldKey: 30,
        fieldName: "audioOutput",
        pointerRules: { accepts: [PointerType.AudioOutput], mandatory: false },
      }),
    };
  }
}
