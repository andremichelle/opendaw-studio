import { Nullish, safeExecute, UUID, Procedure } from "lib-std";
import {
  Box,
  BoxConstruct,
  BoxGraph,
  NoPointers,
  Field,
  Int32Field,
  Float32Field,
  UnreferenceableType,
} from "lib-box";
import { Signature } from "./Signature";
import { LoopArea } from "./LoopArea";
import { MarkerTrack } from "./MarkerTrack";
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
export type TimelineBoxFields = {
  1: /* root */ Field<Pointers.Timeline>;
  10: /* signature */ Signature;
  11: /* loopArea */ LoopArea;
  20: /* deprecatedMarkerTrack */ Field<Pointers.MarkerTrack>;
  21: /* markerTrack */ MarkerTrack;
  30: /* durationInPulses: 491520 */ Int32Field;
  31: /* bpm: 120 */ Float32Field;
};

export class TimelineBox extends Box<UnreferenceableType, TimelineBoxFields> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<TimelineBox>,
  ): TimelineBox {
    return graph.stageBox(
      new TimelineBox({
        uuid,
        graph,
        name: "TimelineBox",
        pointerRules: NoPointers,
      }),
      constructor,
    );
  }

  private constructor(construct: BoxConstruct<UnreferenceableType>) {
    super(construct);
  }

  accept<R>(visitor: BoxVisitor<R>): Nullish<R> {
    return safeExecute(visitor.visitTimelineBox, this);
  }

  get root(): Field<Pointers.Timeline> {
    return this.getField(1);
  }

  get signature(): Signature {
    return this.getField(10);
  }

  get loopArea(): LoopArea {
    return this.getField(11);
  }

  get deprecatedMarkerTrack(): Field<Pointers.MarkerTrack> {
    return this.getField(20);
  }

  get markerTrack(): MarkerTrack {
    return this.getField(21);
  }

  get durationInPulses(): Int32Field {
    return this.getField(30);
  }

  get bpm(): Float32Field {
    return this.getField(31);
  }

  initializeFields(): TimelineBoxFields {
    return {
      1: Field.hook({
        parent: this,
        fieldKey: 1,
        fieldName: "root",
        pointerRules: { accepts: [Pointers.Timeline], mandatory: true },
      }),
      10: Signature.create({
        parent: this,
        fieldKey: 10,
        fieldName: "signature",
        pointerRules: NoPointers,
      }),
      11: LoopArea.create({
        parent: this,
        fieldKey: 11,
        fieldName: "loopArea",
        pointerRules: NoPointers,
      }),
      20: Field.hook({
        parent: this,
        fieldKey: 20,
        fieldName: "deprecatedMarkerTrack",
        pointerRules: { accepts: [Pointers.MarkerTrack], mandatory: false },
      }),
      21: MarkerTrack.create({
        parent: this,
        fieldKey: 21,
        fieldName: "markerTrack",
        pointerRules: NoPointers,
      }),
      30: Int32Field.create(
        {
          parent: this,
          fieldKey: 30,
          fieldName: "durationInPulses",
          pointerRules: NoPointers,
        },
        491520,
      ),
      31: Float32Field.create(
        {
          parent: this,
          fieldKey: 31,
          fieldName: "bpm",
          pointerRules: NoPointers,
        },
        120,
      ),
    };
  }
}
