import { Nullish, safeExecute, UUID, Procedure } from "opendaw-std";
import {
  Box,
  BoxConstruct,
  BoxGraph,
  NoPointers,
  PointerField,
  Field,
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
export type UserInterfaceBoxFields = {
  1: /* root */ PointerField<Pointers.User>;
  10: /* selection */ Field<Pointers.Selection>;
  21: /* editingDeviceChain */ PointerField<Pointers.Editing>;
  22: /* editingTimelineRegion */ PointerField<Pointers.Editing>;
  23: /* editingModularSystem */ PointerField<Pointers.Editing>;
};

export class UserInterfaceBox extends Box<
  UnreferenceableType,
  UserInterfaceBoxFields
> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<UserInterfaceBox>,
  ): UserInterfaceBox {
    return graph.stageBox(
      new UserInterfaceBox({
        uuid,
        graph,
        name: "UserInterfaceBox",
        pointerRules: NoPointers,
      }),
      constructor,
    );
  }

  private constructor(construct: BoxConstruct<UnreferenceableType>) {
    super(construct);
  }

  accept<R>(visitor: BoxVisitor<R>): Nullish<R> {
    return safeExecute(visitor.visitUserInterfaceBox, this);
  }

  get root(): PointerField<Pointers.User> {
    return this.getField(1);
  }

  get selection(): Field<Pointers.Selection> {
    return this.getField(10);
  }

  get editingDeviceChain(): PointerField<Pointers.Editing> {
    return this.getField(21);
  }

  get editingTimelineRegion(): PointerField<Pointers.Editing> {
    return this.getField(22);
  }

  get editingModularSystem(): PointerField<Pointers.Editing> {
    return this.getField(23);
  }

  initializeFields(): UserInterfaceBoxFields {
    return {
      1: PointerField.create(
        {
          parent: this,
          fieldKey: 1,
          fieldName: "root",
          pointerRules: NoPointers,
        },
        Pointers.User,
        true,
      ),
      10: Field.hook({
        parent: this,
        fieldKey: 10,
        fieldName: "selection",
        pointerRules: { accepts: [Pointers.Selection], mandatory: false },
      }),
      21: PointerField.create(
        {
          parent: this,
          fieldKey: 21,
          fieldName: "editingDeviceChain",
          pointerRules: NoPointers,
        },
        Pointers.Editing,
        false,
      ),
      22: PointerField.create(
        {
          parent: this,
          fieldKey: 22,
          fieldName: "editingTimelineRegion",
          pointerRules: NoPointers,
        },
        Pointers.Editing,
        false,
      ),
      23: PointerField.create(
        {
          parent: this,
          fieldKey: 23,
          fieldName: "editingModularSystem",
          pointerRules: NoPointers,
        },
        Pointers.Editing,
        false,
      ),
    };
  }
}
