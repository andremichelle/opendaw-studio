import {
  RootBox,
  SelectionBox,
  UserInterfaceBox,
  TimelineBox,
  TrackBox,
  NoteEventBox,
  NoteEventRepeatBox,
  NoteEventCollectionBox,
  NoteRegionBox,
  NoteClipBox,
  ValueEventBox,
  ValueEventCollectionBox,
  ValueEventCurveBox,
  ValueRegionBox,
  ValueClipBox,
  AudioRegionBox,
  AudioClipBox,
  MarkerBox,
  AudioFileBox,
  AudioUnitBox,
  AudioBusBox,
  AuxSendBox,
  StepAutomationBox,
  GrooveShuffleBox,
  DeviceInterfaceKnobBox,
  ModularDeviceBox,
  DeviceClashBox,
  StereoToolDeviceBox,
  DelayDeviceBox,
  RevampDeviceBox,
  ReverbDeviceBox,
  VaporisateurDeviceBox,
  NanoDeviceBox,
  PlayfieldDeviceBox,
  PlayfieldSampleBox,
  TapeDeviceBox,
  ArpeggioDeviceBox,
  PitchDeviceBox,
  ZeitgeistDeviceBox,
  ModularBox,
  ModuleConnectionBox,
  ModularAudioInputBox,
  ModularAudioOutputBox,
  ModuleDelayBox,
  ModuleMultiplierBox,
  ModuleGainBox,
} from ".";
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
    RootBox: RootBox;
    SelectionBox: SelectionBox;
    UserInterfaceBox: UserInterfaceBox;
    TimelineBox: TimelineBox;
    TrackBox: TrackBox;
    NoteEventBox: NoteEventBox;
    NoteEventRepeatBox: NoteEventRepeatBox;
    NoteEventCollectionBox: NoteEventCollectionBox;
    NoteRegionBox: NoteRegionBox;
    NoteClipBox: NoteClipBox;
    ValueEventBox: ValueEventBox;
    ValueEventCollectionBox: ValueEventCollectionBox;
    ValueEventCurveBox: ValueEventCurveBox;
    ValueRegionBox: ValueRegionBox;
    ValueClipBox: ValueClipBox;
    AudioRegionBox: AudioRegionBox;
    AudioClipBox: AudioClipBox;
    MarkerBox: MarkerBox;
    AudioFileBox: AudioFileBox;
    AudioUnitBox: AudioUnitBox;
    AudioBusBox: AudioBusBox;
    AuxSendBox: AuxSendBox;
    StepAutomationBox: StepAutomationBox;
    GrooveShuffleBox: GrooveShuffleBox;
    DeviceInterfaceKnobBox: DeviceInterfaceKnobBox;
    ModularDeviceBox: ModularDeviceBox;
    DeviceClashBox: DeviceClashBox;
    StereoToolDeviceBox: StereoToolDeviceBox;
    DelayDeviceBox: DelayDeviceBox;
    RevampDeviceBox: RevampDeviceBox;
    ReverbDeviceBox: ReverbDeviceBox;
    VaporisateurDeviceBox: VaporisateurDeviceBox;
    NanoDeviceBox: NanoDeviceBox;
    PlayfieldDeviceBox: PlayfieldDeviceBox;
    PlayfieldSampleBox: PlayfieldSampleBox;
    TapeDeviceBox: TapeDeviceBox;
    ArpeggioDeviceBox: ArpeggioDeviceBox;
    PitchDeviceBox: PitchDeviceBox;
    ZeitgeistDeviceBox: ZeitgeistDeviceBox;
    ModularBox: ModularBox;
    ModuleConnectionBox: ModuleConnectionBox;
    ModularAudioInputBox: ModularAudioInputBox;
    ModularAudioOutputBox: ModularAudioOutputBox;
    ModuleDelayBox: ModuleDelayBox;
    ModuleMultiplierBox: ModuleMultiplierBox;
    ModuleGainBox: ModuleGainBox;
  }

  export const create = <K extends keyof TypeMap, V extends TypeMap[K]>(
    name: K,
    graph: BoxGraph<TypeMap>,
    uuid: UUID.Format,
    constructor?: Procedure<V>,
  ): V => {
    switch (name) {
      case "RootBox":
        return RootBox.create(
          graph,
          uuid,
          constructor as Procedure<RootBox>,
        ) as V;
      case "SelectionBox":
        return SelectionBox.create(
          graph,
          uuid,
          constructor as Procedure<SelectionBox>,
        ) as V;
      case "UserInterfaceBox":
        return UserInterfaceBox.create(
          graph,
          uuid,
          constructor as Procedure<UserInterfaceBox>,
        ) as V;
      case "TimelineBox":
        return TimelineBox.create(
          graph,
          uuid,
          constructor as Procedure<TimelineBox>,
        ) as V;
      case "TrackBox":
        return TrackBox.create(
          graph,
          uuid,
          constructor as Procedure<TrackBox>,
        ) as V;
      case "NoteEventBox":
        return NoteEventBox.create(
          graph,
          uuid,
          constructor as Procedure<NoteEventBox>,
        ) as V;
      case "NoteEventRepeatBox":
        return NoteEventRepeatBox.create(
          graph,
          uuid,
          constructor as Procedure<NoteEventRepeatBox>,
        ) as V;
      case "NoteEventCollectionBox":
        return NoteEventCollectionBox.create(
          graph,
          uuid,
          constructor as Procedure<NoteEventCollectionBox>,
        ) as V;
      case "NoteRegionBox":
        return NoteRegionBox.create(
          graph,
          uuid,
          constructor as Procedure<NoteRegionBox>,
        ) as V;
      case "NoteClipBox":
        return NoteClipBox.create(
          graph,
          uuid,
          constructor as Procedure<NoteClipBox>,
        ) as V;
      case "ValueEventBox":
        return ValueEventBox.create(
          graph,
          uuid,
          constructor as Procedure<ValueEventBox>,
        ) as V;
      case "ValueEventCollectionBox":
        return ValueEventCollectionBox.create(
          graph,
          uuid,
          constructor as Procedure<ValueEventCollectionBox>,
        ) as V;
      case "ValueEventCurveBox":
        return ValueEventCurveBox.create(
          graph,
          uuid,
          constructor as Procedure<ValueEventCurveBox>,
        ) as V;
      case "ValueRegionBox":
        return ValueRegionBox.create(
          graph,
          uuid,
          constructor as Procedure<ValueRegionBox>,
        ) as V;
      case "ValueClipBox":
        return ValueClipBox.create(
          graph,
          uuid,
          constructor as Procedure<ValueClipBox>,
        ) as V;
      case "AudioRegionBox":
        return AudioRegionBox.create(
          graph,
          uuid,
          constructor as Procedure<AudioRegionBox>,
        ) as V;
      case "AudioClipBox":
        return AudioClipBox.create(
          graph,
          uuid,
          constructor as Procedure<AudioClipBox>,
        ) as V;
      case "MarkerBox":
        return MarkerBox.create(
          graph,
          uuid,
          constructor as Procedure<MarkerBox>,
        ) as V;
      case "AudioFileBox":
        return AudioFileBox.create(
          graph,
          uuid,
          constructor as Procedure<AudioFileBox>,
        ) as V;
      case "AudioUnitBox":
        return AudioUnitBox.create(
          graph,
          uuid,
          constructor as Procedure<AudioUnitBox>,
        ) as V;
      case "AudioBusBox":
        return AudioBusBox.create(
          graph,
          uuid,
          constructor as Procedure<AudioBusBox>,
        ) as V;
      case "AuxSendBox":
        return AuxSendBox.create(
          graph,
          uuid,
          constructor as Procedure<AuxSendBox>,
        ) as V;
      case "StepAutomationBox":
        return StepAutomationBox.create(
          graph,
          uuid,
          constructor as Procedure<StepAutomationBox>,
        ) as V;
      case "GrooveShuffleBox":
        return GrooveShuffleBox.create(
          graph,
          uuid,
          constructor as Procedure<GrooveShuffleBox>,
        ) as V;
      case "DeviceInterfaceKnobBox":
        return DeviceInterfaceKnobBox.create(
          graph,
          uuid,
          constructor as Procedure<DeviceInterfaceKnobBox>,
        ) as V;
      case "ModularDeviceBox":
        return ModularDeviceBox.create(
          graph,
          uuid,
          constructor as Procedure<ModularDeviceBox>,
        ) as V;
      case "DeviceClashBox":
        return DeviceClashBox.create(
          graph,
          uuid,
          constructor as Procedure<DeviceClashBox>,
        ) as V;
      case "StereoToolDeviceBox":
        return StereoToolDeviceBox.create(
          graph,
          uuid,
          constructor as Procedure<StereoToolDeviceBox>,
        ) as V;
      case "DelayDeviceBox":
        return DelayDeviceBox.create(
          graph,
          uuid,
          constructor as Procedure<DelayDeviceBox>,
        ) as V;
      case "RevampDeviceBox":
        return RevampDeviceBox.create(
          graph,
          uuid,
          constructor as Procedure<RevampDeviceBox>,
        ) as V;
      case "ReverbDeviceBox":
        return ReverbDeviceBox.create(
          graph,
          uuid,
          constructor as Procedure<ReverbDeviceBox>,
        ) as V;
      case "VaporisateurDeviceBox":
        return VaporisateurDeviceBox.create(
          graph,
          uuid,
          constructor as Procedure<VaporisateurDeviceBox>,
        ) as V;
      case "NanoDeviceBox":
        return NanoDeviceBox.create(
          graph,
          uuid,
          constructor as Procedure<NanoDeviceBox>,
        ) as V;
      case "PlayfieldDeviceBox":
        return PlayfieldDeviceBox.create(
          graph,
          uuid,
          constructor as Procedure<PlayfieldDeviceBox>,
        ) as V;
      case "PlayfieldSampleBox":
        return PlayfieldSampleBox.create(
          graph,
          uuid,
          constructor as Procedure<PlayfieldSampleBox>,
        ) as V;
      case "TapeDeviceBox":
        return TapeDeviceBox.create(
          graph,
          uuid,
          constructor as Procedure<TapeDeviceBox>,
        ) as V;
      case "ArpeggioDeviceBox":
        return ArpeggioDeviceBox.create(
          graph,
          uuid,
          constructor as Procedure<ArpeggioDeviceBox>,
        ) as V;
      case "PitchDeviceBox":
        return PitchDeviceBox.create(
          graph,
          uuid,
          constructor as Procedure<PitchDeviceBox>,
        ) as V;
      case "ZeitgeistDeviceBox":
        return ZeitgeistDeviceBox.create(
          graph,
          uuid,
          constructor as Procedure<ZeitgeistDeviceBox>,
        ) as V;
      case "ModularBox":
        return ModularBox.create(
          graph,
          uuid,
          constructor as Procedure<ModularBox>,
        ) as V;
      case "ModuleConnectionBox":
        return ModuleConnectionBox.create(
          graph,
          uuid,
          constructor as Procedure<ModuleConnectionBox>,
        ) as V;
      case "ModularAudioInputBox":
        return ModularAudioInputBox.create(
          graph,
          uuid,
          constructor as Procedure<ModularAudioInputBox>,
        ) as V;
      case "ModularAudioOutputBox":
        return ModularAudioOutputBox.create(
          graph,
          uuid,
          constructor as Procedure<ModularAudioOutputBox>,
        ) as V;
      case "ModuleDelayBox":
        return ModuleDelayBox.create(
          graph,
          uuid,
          constructor as Procedure<ModuleDelayBox>,
        ) as V;
      case "ModuleMultiplierBox":
        return ModuleMultiplierBox.create(
          graph,
          uuid,
          constructor as Procedure<ModuleMultiplierBox>,
        ) as V;
      case "ModuleGainBox":
        return ModuleGainBox.create(
          graph,
          uuid,
          constructor as Procedure<ModuleGainBox>,
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
