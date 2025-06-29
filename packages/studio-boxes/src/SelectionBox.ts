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
export type SelectionBoxFields = {
  1: /* selection */ PointerField<Pointers.Selection>;
  2: /* selectable */ PointerField<Pointers.Selection>;
};

export class SelectionBox extends Box<UnreferenceableType, SelectionBoxFields> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<SelectionBox>,
  ): SelectionBox {
    return graph.stageBox(
      new SelectionBox({
        uuid,
        graph,
        name: "SelectionBox",
        pointerRules: NoPointers,
      }),
      constructor,
    );
  }

  private constructor(construct: BoxConstruct<UnreferenceableType>) {
    super(construct);
  }

  accept<R>(visitor: BoxVisitor<R>): Nullish<R> {
    return safeExecute(visitor.visitSelectionBox, this);
  }

  get selection(): PointerField<Pointers.Selection> {
    return this.getField(1);
  }

  get selectable(): PointerField<Pointers.Selection> {
    return this.getField(2);
  }

  initializeFields(): SelectionBoxFields {
    return {
      1: PointerField.create(
        {
          parent: this,
          fieldKey: 1,
          fieldName: "selection",
          pointerRules: NoPointers,
        },
        Pointers.Selection,
        true,
      ),
      2: PointerField.create(
        {
          parent: this,
          fieldKey: 2,
          fieldName: "selectable",
          pointerRules: NoPointers,
        },
        Pointers.Selection,
        true,
      ),
    };
  }
}
