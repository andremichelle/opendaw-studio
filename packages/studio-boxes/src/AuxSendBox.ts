import { Nullish, safeExecute, UUID, Procedure } from "lib-std";
import {
  Box,
  BoxConstruct,
  BoxGraph,
  NoPointers,
  PointerField,
  Int32Field,
  Float32Field,
  UnreferenceableType,
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
export type AuxSendBoxFields = {
  1: /* audioUnit */ PointerField<Pointers.AuxSend>;
  2: /* targetBus */ PointerField<Pointers.AudioOutput>;
  3: /* index */ Int32Field;
  4: /* routing */ Int32Field;
  5: /* sendGain */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
  6: /* sendPan */ Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  >;
};

export class AuxSendBox extends Box<UnreferenceableType, AuxSendBoxFields> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<AuxSendBox>,
  ): AuxSendBox {
    return graph.stageBox(
      new AuxSendBox({
        uuid,
        graph,
        name: "AuxSendBox",
        pointerRules: NoPointers,
      }),
      constructor,
    );
  }

  private constructor(construct: BoxConstruct<UnreferenceableType>) {
    super(construct);
  }

  accept<R>(visitor: BoxVisitor<R>): Nullish<R> {
    return safeExecute(visitor.visitAuxSendBox, this);
  }

  get audioUnit(): PointerField<Pointers.AuxSend> {
    return this.getField(1);
  }

  get targetBus(): PointerField<Pointers.AudioOutput> {
    return this.getField(2);
  }

  get index(): Int32Field {
    return this.getField(3);
  }

  get routing(): Int32Field {
    return this.getField(4);
  }

  get sendGain(): Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(5);
  }

  get sendPan(): Float32Field<
    Pointers.Modulation | Pointers.Automation | Pointers.MidiControl
  > {
    return this.getField(6);
  }

  initializeFields(): AuxSendBoxFields {
    return {
      1: PointerField.create(
        {
          parent: this,
          fieldKey: 1,
          fieldName: "audioUnit",
          pointerRules: NoPointers,
        },
        Pointers.AuxSend,
        true,
      ),
      2: PointerField.create(
        {
          parent: this,
          fieldKey: 2,
          fieldName: "targetBus",
          pointerRules: NoPointers,
        },
        Pointers.AudioOutput,
        true,
      ),
      3: Int32Field.create({
        parent: this,
        fieldKey: 3,
        fieldName: "index",
        pointerRules: NoPointers,
      }),
      4: Int32Field.create({
        parent: this,
        fieldKey: 4,
        fieldName: "routing",
        pointerRules: NoPointers,
      }),
      5: Float32Field.create({
        parent: this,
        fieldKey: 5,
        fieldName: "sendGain",
        pointerRules: {
          accepts: [
            Pointers.Modulation,
            Pointers.Automation,
            Pointers.MidiControl,
          ],
          mandatory: false,
        },
      }),
      6: Float32Field.create({
        parent: this,
        fieldKey: 6,
        fieldName: "sendPan",
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
