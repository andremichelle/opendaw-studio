import { Nullish, safeExecute, UUID, Procedure } from "lib-std";
import {
  Box,
  BoxConstruct,
  BoxGraph,
  NoPointers,
  Int32Field,
  StringField,
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
export type AudioFileBoxFields = {
  1: /* startInSeconds */ Int32Field;
  2: /* endInSeconds */ Int32Field;
  3: /* fileName */ StringField;
};

export class AudioFileBox extends Box<Pointers.AudioFile, AudioFileBoxFields> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<AudioFileBox>,
  ): AudioFileBox {
    return graph.stageBox(
      new AudioFileBox({
        uuid,
        graph,
        name: "AudioFileBox",
        pointerRules: { accepts: [Pointers.AudioFile], mandatory: true },
      }),
      constructor,
    );
  }

  private constructor(construct: BoxConstruct<Pointers.AudioFile>) {
    super(construct);
  }

  accept<R>(visitor: BoxVisitor<R>): Nullish<R> {
    return safeExecute(visitor.visitAudioFileBox, this);
  }

  get startInSeconds(): Int32Field {
    return this.getField(1);
  }

  get endInSeconds(): Int32Field {
    return this.getField(2);
  }

  get fileName(): StringField {
    return this.getField(3);
  }

  initializeFields(): AudioFileBoxFields {
    return {
      1: Int32Field.create({
        parent: this,
        fieldKey: 1,
        fieldName: "startInSeconds",
        pointerRules: NoPointers,
      }),
      2: Int32Field.create({
        parent: this,
        fieldKey: 2,
        fieldName: "endInSeconds",
        pointerRules: NoPointers,
      }),
      3: StringField.create({
        parent: this,
        fieldKey: 3,
        fieldName: "fileName",
        pointerRules: NoPointers,
      }),
    };
  }
}
