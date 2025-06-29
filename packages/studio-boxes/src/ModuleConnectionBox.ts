import { Nullish, safeExecute, UUID, Procedure } from "opendaw-std";
import {
  Box,
  BoxConstruct,
  BoxGraph,
  NoPointers,
  PointerField,
  UnreferenceableType,
} from "opendaw-box";
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
export type ModuleConnectionBoxFields = {
  1: /* collection */ PointerField<Pointers.ConnectionCollection>;
  2: /* source */ PointerField<Pointers.VoltageConnection>;
  3: /* target */ PointerField<Pointers.VoltageConnection>;
};

export class ModuleConnectionBox extends Box<
  UnreferenceableType,
  ModuleConnectionBoxFields
> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<ModuleConnectionBox>,
  ): ModuleConnectionBox {
    return graph.stageBox(
      new ModuleConnectionBox({
        uuid,
        graph,
        name: "ModuleConnectionBox",
        pointerRules: NoPointers,
      }),
      constructor,
    );
  }

  private constructor(construct: BoxConstruct<UnreferenceableType>) {
    super(construct);
  }

  accept<R>(visitor: BoxVisitor<R>): Nullish<R> {
    return safeExecute(visitor.visitModuleConnectionBox, this);
  }

  get collection(): PointerField<Pointers.ConnectionCollection> {
    return this.getField(1);
  }

  get source(): PointerField<Pointers.VoltageConnection> {
    return this.getField(2);
  }

  get target(): PointerField<Pointers.VoltageConnection> {
    return this.getField(3);
  }

  initializeFields(): ModuleConnectionBoxFields {
    return {
      1: PointerField.create(
        {
          parent: this,
          fieldKey: 1,
          fieldName: "collection",
          pointerRules: NoPointers,
        },
        Pointers.ConnectionCollection,
        true,
      ),
      2: PointerField.create(
        {
          parent: this,
          fieldKey: 2,
          fieldName: "source",
          pointerRules: NoPointers,
        },
        Pointers.VoltageConnection,
        true,
      ),
      3: PointerField.create(
        {
          parent: this,
          fieldKey: 3,
          fieldName: "target",
          pointerRules: NoPointers,
        },
        Pointers.VoltageConnection,
        true,
      ),
    };
  }
}
