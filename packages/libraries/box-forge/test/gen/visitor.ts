import { VertexVisitor } from "lib-box";
import { NetworkBox, AudioConnectionBox, DrumBox, DelayBox } from ".";

//
//   ___          ___                 
//  | _ ) _____ _| __|__ _ _ __ _ ___ 
//  | _ \/ _ \ \ / _/ _ \ '_/ _` / -_)
//  |___/\___/_\_\_|\___/_| \__, \___|
//                         |___/
//
//  auto-generated | do not edit | blame andre.michelle@gmail.com
//
export interface BoxVisitor<R = void> extends VertexVisitor<R> {
    visitNetworkBox?(box: NetworkBox): R;
    visitAudioConnectionBox?(box: AudioConnectionBox): R;
    visitDrumBox?(box: DrumBox): R;
    visitDelayBox?(box: DelayBox): R;
}
