import { Nullish, safeExecute, UUID, Procedure } from "lib-std";
import {
  Box,
  BoxConstruct,
  BoxGraph,
  NoPointers,
  PointerField,
  Int32Field,
  BooleanField,
  StringField,
  Float32Field,
} from "lib-box";
import { ClipPlaybackFields } from "./ClipPlaybackFields";
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
export type AudioClipBoxFields = {
  1: /* clips */ PointerField<Pointers.ClipCollection>;
  2: /* file */ PointerField<Pointers.AudioFile>;
  3: /* index */ Int32Field;
  4: /* playback */ ClipPlaybackFields;
  10: /* duration */ Int32Field;
  11: /* mute */ BooleanField;
  12: /* label */ StringField;
  13: /* hue */ Int32Field;
  14: /* gain */ Float32Field;
};

export class AudioClipBox extends Box<
  Pointers.Selection | Pointers.Editing,
  AudioClipBoxFields
> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<AudioClipBox>,
  ): AudioClipBox {
    return graph.stageBox(
      new AudioClipBox({
        uuid,
        graph,
        name: "AudioClipBox",
        pointerRules: {
          accepts: [Pointers.Selection, Pointers.Editing],
          mandatory: false,
        },
      }),
      constructor,
    );
  }

  private constructor(
    construct: BoxConstruct<Pointers.Selection | Pointers.Editing>,
  ) {
    super(construct);
  }

  accept<R>(visitor: BoxVisitor<R>): Nullish<R> {
    return safeExecute(visitor.visitAudioClipBox, this);
  }

  get clips(): PointerField<Pointers.ClipCollection> {
    return this.getField(1);
  }

  get file(): PointerField<Pointers.AudioFile> {
    return this.getField(2);
  }

  get index(): Int32Field {
    return this.getField(3);
  }

  get playback(): ClipPlaybackFields {
    return this.getField(4);
  }

  get duration(): Int32Field {
    return this.getField(10);
  }

  get mute(): BooleanField {
    return this.getField(11);
  }

  get label(): StringField {
    return this.getField(12);
  }

  get hue(): Int32Field {
    return this.getField(13);
  }

  get gain(): Float32Field {
    return this.getField(14);
  }

  initializeFields(): AudioClipBoxFields {
    return {
      1: PointerField.create(
        {
          parent: this,
          fieldKey: 1,
          fieldName: "clips",
          pointerRules: NoPointers,
        },
        Pointers.ClipCollection,
        true,
      ),
      2: PointerField.create(
        {
          parent: this,
          fieldKey: 2,
          fieldName: "file",
          pointerRules: NoPointers,
        },
        Pointers.AudioFile,
        true,
      ),
      3: Int32Field.create({
        parent: this,
        fieldKey: 3,
        fieldName: "index",
        pointerRules: NoPointers,
      }),
      4: ClipPlaybackFields.create({
        parent: this,
        fieldKey: 4,
        fieldName: "playback",
        pointerRules: NoPointers,
      }),
      10: Int32Field.create({
        parent: this,
        fieldKey: 10,
        fieldName: "duration",
        pointerRules: NoPointers,
      }),
      11: BooleanField.create({
        parent: this,
        fieldKey: 11,
        fieldName: "mute",
        pointerRules: NoPointers,
      }),
      12: StringField.create({
        parent: this,
        fieldKey: 12,
        fieldName: "label",
        pointerRules: NoPointers,
      }),
      13: Int32Field.create({
        parent: this,
        fieldKey: 13,
        fieldName: "hue",
        pointerRules: NoPointers,
      }),
      14: Float32Field.create({
        parent: this,
        fieldKey: 14,
        fieldName: "gain",
        pointerRules: NoPointers,
      }),
    };
  }
}
