import { Nullish, safeExecute, UUID, Procedure } from "lib-std";
import {
  Box,
  BoxConstruct,
  BoxGraph,
  NoPointers,
  StringField,
  Float32Field,
  Int32Field,
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
export type GrooveShuffleBoxFields = {
  1: /* label */ StringField;
  10: /* amount: 0.6 */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
  11: /* duration: 480 */ Int32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
};

export class GrooveShuffleBox extends Box<
  Pointers.Groove,
  GrooveShuffleBoxFields
> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<GrooveShuffleBox>,
  ): GrooveShuffleBox {
    return graph.stageBox(
      new GrooveShuffleBox({
        uuid,
        graph,
        name: "GrooveShuffleBox",
        pointerRules: { accepts: [Pointers.Groove], mandatory: true },
      }),
      constructor,
    );
  }

  private constructor(construct: BoxConstruct<Pointers.Groove>) {
    super(construct);
  }

  accept<R>(visitor: BoxVisitor<R>): Nullish<R> {
    return safeExecute(visitor.visitGrooveShuffleBox, this);
  }

  get label(): StringField {
    return this.getField(1);
  }

  get amount(): Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(10);
  }

  get duration(): Int32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(11);
  }

  initializeFields(): GrooveShuffleBoxFields {
    return {
      1: StringField.create({
        parent: this,
        fieldKey: 1,
        fieldName: "label",
        pointerRules: NoPointers,
      }),
      10: Float32Field.create(
        {
          parent: this,
          fieldKey: 10,
          fieldName: "amount",
          pointerRules: {
            accepts: [
              Pointers.Modulation,
              Pointers.Automation,
              Pointers.MidiControl,
            ],
            mandatory: false,
          },
        },
        0.6,
      ),
      11: Int32Field.create(
        {
          parent: this,
          fieldKey: 11,
          fieldName: "duration",
          pointerRules: {
            accepts: [
              Pointers.Modulation,
              Pointers.Automation,
              Pointers.MidiControl,
            ],
            mandatory: false,
          },
        },
        480,
      ),
    };
  }
}
