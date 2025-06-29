import { NetworkBox, AudioConnectionBox, DrumBox, DelayBox } from ".";
import { ByteArrayInput, panic, Procedure, UUID } from "lib-std";
import { BoxGraph, Box } from "lib-box";

//
//   ___          ___
//  | _ ) _____ _| __|__ _ _ __ _ ___
//  | _ \/ _ \ \ / _/ _ \ '_/ _` / -_)
//  |___/\___/_\_\_|\___/_| \__, \___|
//                         |___/
//
//  auto-generated | do not edit | blame andre.michelle@gmail.com
//
export namespace BoxIO {
  export interface TypeMap {
    NetworkBox: NetworkBox;
    AudioConnectionBox: AudioConnectionBox;
    DrumBox: DrumBox;
    DelayBox: DelayBox;
  }

  export const create = <K extends keyof TypeMap, V extends TypeMap[K]>(
    name: K,
    graph: BoxGraph<TypeMap>,
    uuid: UUID.Format,
    constructor?: Procedure<V>,
  ): V => {
    switch (name) {
      case "NetworkBox":
        return NetworkBox.create(
          graph,
          uuid,
          constructor as Procedure<NetworkBox>,
        ) as V;
      case "AudioConnectionBox":
        return AudioConnectionBox.create(
          graph,
          uuid,
          constructor as Procedure<AudioConnectionBox>,
        ) as V;
      case "DrumBox":
        return DrumBox.create(
          graph,
          uuid,
          constructor as Procedure<DrumBox>,
        ) as V;
      case "DelayBox":
        return DelayBox.create(
          graph,
          uuid,
          constructor as Procedure<DelayBox>,
        ) as V;
      default:
        return panic(`Unknown box class '${name}'`);
    }
  };
  export const deserialize = (graph: BoxGraph, buffer: ArrayBuffer): Box => {
    const stream = new ByteArrayInput(buffer);
    const className = stream.readString() as keyof TypeMap;
    const uuidBytes = UUID.fromDataInput(stream);
    const box = create(className, graph, uuidBytes);
    box.read(stream);
    return box;
  };
}
