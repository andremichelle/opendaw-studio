import { Nullish, safeExecute, UUID, Procedure } from "lib-std";
import {
  Box,
  BoxConstruct,
  BoxGraph,
  NoPointers,
  PointerField,
  Field,
  StringField,
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
export type ModularBoxFields = {
  1: /* collection */ PointerField<Pointers.ModularSetup>;
  2: /* device */ Field<Pointers.ModularSetup>;
  3: /* editing */ Field<Pointers.Editing>;
  11: /* modules */ Field<Pointers.ModuleCollection>;
  12: /* connections */ Field<Pointers.ConnectionCollection>;
  13: /* label */ StringField;
};

export class ModularBox extends Box<UnreferenceableType, ModularBoxFields> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<ModularBox>,
  ): ModularBox {
    return graph.stageBox(
      new ModularBox({
        uuid,
        graph,
        name: "ModularBox",
        pointerRules: NoPointers,
      }),
      constructor,
    );
  }

  private constructor(construct: BoxConstruct<UnreferenceableType>) {
    super(construct);
  }

  accept<R>(visitor: BoxVisitor<R>): Nullish<R> {
    return safeExecute(visitor.visitModularBox, this);
  }

  get collection(): PointerField<Pointers.ModularSetup> {
    return this.getField(1);
  }

  get device(): Field<Pointers.ModularSetup> {
    return this.getField(2);
  }

  get editing(): Field<Pointers.Editing> {
    return this.getField(3);
  }

  get modules(): Field<Pointers.ModuleCollection> {
    return this.getField(11);
  }

  get connections(): Field<Pointers.ConnectionCollection> {
    return this.getField(12);
  }

  get label(): StringField {
    return this.getField(13);
  }

  initializeFields(): ModularBoxFields {
    return {
      1: PointerField.create(
        {
          parent: this,
          fieldKey: 1,
          fieldName: "collection",
          pointerRules: NoPointers,
        },
        Pointers.ModularSetup,
        true,
      ),
      2: Field.hook({
        parent: this,
        fieldKey: 2,
        fieldName: "device",
        pointerRules: { accepts: [Pointers.ModularSetup], mandatory: true },
      }),
      3: Field.hook({
        parent: this,
        fieldKey: 3,
        fieldName: "editing",
        pointerRules: { accepts: [Pointers.Editing], mandatory: false },
      }),
      11: Field.hook({
        parent: this,
        fieldKey: 11,
        fieldName: "modules",
        pointerRules: {
          accepts: [Pointers.ModuleCollection],
          mandatory: false,
        },
      }),
      12: Field.hook({
        parent: this,
        fieldKey: 12,
        fieldName: "connections",
        pointerRules: {
          accepts: [Pointers.ConnectionCollection],
          mandatory: false,
        },
      }),
      13: StringField.create({
        parent: this,
        fieldKey: 13,
        fieldName: "label",
        pointerRules: NoPointers,
      }),
    };
  }
}
