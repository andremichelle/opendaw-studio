import { Nullish, safeExecute, UUID, Procedure } from "opendaw-std";
import {
  Box,
  BoxConstruct,
  BoxGraph,
  Field,
  UnreferenceableType,
  NoPointers,
} from "opendaw-box";
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
export type NetworkBoxFields = {
  10: /* modules */ Field<PointerType.NetworkModule>;
  11: /* connections */ Field<PointerType.AudioConnection>;
};

export class NetworkBox extends Box<UnreferenceableType, NetworkBoxFields> {
  static create(
    graph: BoxGraph,
    uuid: UUID.Format,
    constructor?: Procedure<NetworkBox>,
  ): NetworkBox {
    return graph.stageBox(
      new NetworkBox({
        uuid,
        graph,
        name: "NetworkBox",
        pointerRules: NoPointers,
      }),
      constructor,
    );
  }

  private constructor(construct: BoxConstruct<UnreferenceableType>) {
    super(construct);
  }

  accept<R>(visitor: BoxVisitor<R>): Nullish<R> {
    return safeExecute(visitor.visitNetworkBox, this);
  }

  get modules(): Field<PointerType.NetworkModule> {
    return this.getField(10);
  }

  get connections(): Field<PointerType.AudioConnection> {
    return this.getField(11);
  }

  initializeFields(): NetworkBoxFields {
    return {
      10: Field.hook({
        parent: this,
        fieldKey: 10,
        fieldName: "modules",
        pointerRules: {
          accepts: [PointerType.NetworkModule],
          mandatory: false,
        },
      }),
      11: Field.hook({
        parent: this,
        fieldKey: 11,
        fieldName: "connections",
        pointerRules: {
          accepts: [PointerType.AudioConnection],
          mandatory: false,
        },
      }),
    };
  }
}
