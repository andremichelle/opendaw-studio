import { VertexVisitor } from "opendaw-box";
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
  visitRootBox?(box: RootBox): R;
  visitSelectionBox?(box: SelectionBox): R;
  visitUserInterfaceBox?(box: UserInterfaceBox): R;
  visitTimelineBox?(box: TimelineBox): R;
  visitTrackBox?(box: TrackBox): R;
  visitNoteEventBox?(box: NoteEventBox): R;
  visitNoteEventRepeatBox?(box: NoteEventRepeatBox): R;
  visitNoteEventCollectionBox?(box: NoteEventCollectionBox): R;
  visitNoteRegionBox?(box: NoteRegionBox): R;
  visitNoteClipBox?(box: NoteClipBox): R;
  visitValueEventBox?(box: ValueEventBox): R;
  visitValueEventCollectionBox?(box: ValueEventCollectionBox): R;
  visitValueEventCurveBox?(box: ValueEventCurveBox): R;
  visitValueRegionBox?(box: ValueRegionBox): R;
  visitValueClipBox?(box: ValueClipBox): R;
  visitAudioRegionBox?(box: AudioRegionBox): R;
  visitAudioClipBox?(box: AudioClipBox): R;
  visitMarkerBox?(box: MarkerBox): R;
  visitAudioFileBox?(box: AudioFileBox): R;
  visitAudioUnitBox?(box: AudioUnitBox): R;
  visitAudioBusBox?(box: AudioBusBox): R;
  visitAuxSendBox?(box: AuxSendBox): R;
  visitStepAutomationBox?(box: StepAutomationBox): R;
  visitGrooveShuffleBox?(box: GrooveShuffleBox): R;
  visitDeviceInterfaceKnobBox?(box: DeviceInterfaceKnobBox): R;
  visitModularDeviceBox?(box: ModularDeviceBox): R;
  visitDeviceClashBox?(box: DeviceClashBox): R;
  visitStereoToolDeviceBox?(box: StereoToolDeviceBox): R;
  visitDelayDeviceBox?(box: DelayDeviceBox): R;
  visitRevampDeviceBox?(box: RevampDeviceBox): R;
  visitReverbDeviceBox?(box: ReverbDeviceBox): R;
  visitVaporisateurDeviceBox?(box: VaporisateurDeviceBox): R;
  visitNanoDeviceBox?(box: NanoDeviceBox): R;
  visitPlayfieldDeviceBox?(box: PlayfieldDeviceBox): R;
  visitPlayfieldSampleBox?(box: PlayfieldSampleBox): R;
  visitTapeDeviceBox?(box: TapeDeviceBox): R;
  visitArpeggioDeviceBox?(box: ArpeggioDeviceBox): R;
  visitPitchDeviceBox?(box: PitchDeviceBox): R;
  visitZeitgeistDeviceBox?(box: ZeitgeistDeviceBox): R;
  visitModularBox?(box: ModularBox): R;
  visitModuleConnectionBox?(box: ModuleConnectionBox): R;
  visitModularAudioInputBox?(box: ModularAudioInputBox): R;
  visitModularAudioOutputBox?(box: ModularAudioOutputBox): R;
  visitModuleDelayBox?(box: ModuleDelayBox): R;
  visitModuleMultiplierBox?(box: ModuleMultiplierBox): R;
  visitModuleGainBox?(box: ModuleGainBox): R;
}
