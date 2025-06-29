import { Nullish, safeExecute, UUID, Procedure } from "opendaw-std";
import {
  Box,
  BoxConstruct,
  BoxGraph,
  NoPointers,
  PointerField,
  Field,
  StringField,
  UnreferenceableType,
} from "opendaw-box";
import { PianoMode } from "./PianoMode";
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
export type RootBoxFields = {
  1: /* timeline */ PointerField<Pointers.Timeline>;
  2: /* users */ Field<Pointers.User>;
  3: /* created */ StringField;
  4: /* groove */ PointerField<Pointers.Groove>;
  10: /* modularSetups */ Field<Pointers.ModularSetup>;
  20: /* audioUnits */ Field<Pointers.AudioUnits>;
  21: /* audioBusses */ Field<Pointers.AudioBusses>;
  30: /* outputDevice */ Field<Pointers.AudioOutput>;
  40: /* pianoMode */ PianoMode;
  111: /* editingChannel */ PointerField<Pointers.Editing>;
};

export class RootBox extends Box<UnreferenceableType, RootBoxFields> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<RootBox>,
  ): RootBox {
    return graph.stageBox(
      new RootBox({ uuid, graph, name: "RootBox", pointerRules: NoPointers }),
      constructor,
    );
  }

  private constructor(construct: BoxConstruct<UnreferenceableType>) {
    super(construct);
  }

  accept<R>(visitor: BoxVisitor<R>): Nullish<R> {
    return safeExecute(visitor.visitRootBox, this);
  }

  get timeline(): PointerField<Pointers.Timeline> {
    return this.getField(1);
  }

  get users(): Field<Pointers.User> {
    return this.getField(2);
  }

  get created(): StringField {
    return this.getField(3);
  }

  get groove(): PointerField<Pointers.Groove> {
    return this.getField(4);
  }

  get modularSetups(): Field<Pointers.ModularSetup> {
    return this.getField(10);
  }

  get audioUnits(): Field<Pointers.AudioUnits> {
    return this.getField(20);
  }

  get audioBusses(): Field<Pointers.AudioBusses> {
    return this.getField(21);
  }

  get outputDevice(): Field<Pointers.AudioOutput> {
    return this.getField(30);
  }

  get pianoMode(): PianoMode {
    return this.getField(40);
  }

  get editingChannel(): PointerField<Pointers.Editing> {
    return this.getField(111);
  }

  initializeFields(): RootBoxFields {
    return {
      1: PointerField.create(
        {
          parent: this,
          fieldKey: 1,
          fieldName: "timeline",
          pointerRules: NoPointers,
        },
        Pointers.Timeline,
        true,
      ),
      2: Field.hook({
        parent: this,
        fieldKey: 2,
        fieldName: "users",
        pointerRules: { accepts: [Pointers.User], mandatory: true },
      }),
      3: StringField.create({
        parent: this,
        fieldKey: 3,
        fieldName: "created",
        pointerRules: NoPointers,
      }),
      4: PointerField.create(
        {
          parent: this,
          fieldKey: 4,
          fieldName: "groove",
          pointerRules: NoPointers,
        },
        Pointers.Groove,
        true,
      ),
      10: Field.hook({
        parent: this,
        fieldKey: 10,
        fieldName: "modularSetups",
        pointerRules: { accepts: [Pointers.ModularSetup], mandatory: false },
      }),
      20: Field.hook({
        parent: this,
        fieldKey: 20,
        fieldName: "audioUnits",
        pointerRules: { accepts: [Pointers.AudioUnits], mandatory: false },
      }),
      21: Field.hook({
        parent: this,
        fieldKey: 21,
        fieldName: "audioBusses",
        pointerRules: { accepts: [Pointers.AudioBusses], mandatory: false },
      }),
      30: Field.hook({
        parent: this,
        fieldKey: 30,
        fieldName: "outputDevice",
        pointerRules: { accepts: [Pointers.AudioOutput], mandatory: true },
      }),
      40: PianoMode.create({
        parent: this,
        fieldKey: 40,
        fieldName: "pianoMode",
        pointerRules: NoPointers,
      }),
      111: PointerField.create(
        {
          parent: this,
          fieldKey: 111,
          fieldName: "editingChannel",
          pointerRules: NoPointers,
        },
        Pointers.Editing,
        false,
      ),
    };
  }
}
