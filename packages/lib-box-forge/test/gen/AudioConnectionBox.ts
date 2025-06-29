import { Nullish, safeExecute, UUID, Procedure } from "lib-std";
import {
  Box,
  BoxConstruct,
  BoxGraph,
  NoPointers,
  PointerField,
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
export type AudioConnectionBoxFields = {
  10: /* network */ PointerField<PointerType.AudioConnection>;
  11: /* output */ PointerField<PointerType.AudioOutput>;
  12: /* input */ PointerField<PointerType.AudioInput>;
};

export class AudioConnectionBox extends Box<
  UnreferenceableType,
  AudioConnectionBoxFields
> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<AudioConnectionBox>,
  ): AudioConnectionBox {
    return graph.stageBox(
      new AudioConnectionBox({
        uuid,
        graph,
        name: "AudioConnectionBox",
        pointerRules: NoPointers,
      }),
      constructor,
    );
  }

  private constructor(construct: BoxConstruct<UnreferenceableType>) {
    super(construct);
  }

  accept<R>(visitor: BoxVisitor<R>): Nullish<R> {
    return safeExecute(visitor.visitAudioConnectionBox, this);
  }

  get network(): PointerField<PointerType.AudioConnection> {
    return this.getField(10);
  }

  get output(): PointerField<PointerType.AudioOutput> {
    return this.getField(11);
  }

  get input(): PointerField<PointerType.AudioInput> {
    return this.getField(12);
  }

  initializeFields(): AudioConnectionBoxFields {
    return {
      10: PointerField.create(
        {
          parent: this,
          fieldKey: 10,
          fieldName: "network",
          pointerRules: NoPointers,
        },
        PointerType.AudioConnection,
        true,
      ),
      11: PointerField.create(
        {
          parent: this,
          fieldKey: 11,
          fieldName: "output",
          pointerRules: NoPointers,
        },
        PointerType.AudioOutput,
        true,
      ),
      12: PointerField.create(
        {
          parent: this,
          fieldKey: 12,
          fieldName: "input",
          pointerRules: NoPointers,
        },
        PointerType.AudioInput,
        true,
      ),
    };
  }
}
