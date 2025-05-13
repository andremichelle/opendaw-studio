import css from "./RevampDeviceEditor.sass?inline"
import {
	Parameters,
	RevampDeviceBoxAdapter
} from "@/audio-engine-shared/adapters/devices/audio-effects/RevampDeviceBoxAdapter.ts"
import { asDefined, int, Lifecycle } from "std"
import { createElement } from "jsx"
import { DeviceEditor } from "@/ui/devices/DeviceEditor.tsx"
import { Column } from "@/ui/devices/Column.tsx"
import { Colors } from "@/ui/Colors.ts"
import { ParameterLabel } from "@/ui/components/ParameterLabel.tsx"
import { createCurveRenderer, plotSpectrum } from "@/ui/devices/audio-effects/RevampDeviceEditor/Renderer.ts"
import { createDisplay } from "@/ui/devices/audio-effects/RevampDeviceEditor/Display.tsx"
import { Checkbox } from "@/ui/components/Checkbox.tsx"
import { Icon } from "@/ui/components/Icon.tsx"
import {
	ColorSets,
	decibelValueGuide,
	ems,
	orderValueGuide,
	symbols,
	xAxis,
	yAxis
} from "@/ui/devices/audio-effects/RevampDeviceEditor/constants.ts"
import { RelativeUnitValueDragging } from "@/ui/wrapper/RelativeUnitValueDragging.tsx"
import { MenuItems } from "@/ui/devices/menu-items.ts"
import { Project } from "@/project/Project.ts"
import { ParameterWrapper } from "@/ui/wrapper/ParameterWrapper.ts"
import { LinearScale } from "@/ui/canvas/scale.ts"
import { DevicePeakMeter } from "@/ui/devices/panel/DevicePeakMeter.tsx"
import { ControlIndicator } from "@/ui/components/ControlIndicator"
import { attachParameterContextMenu } from "@/ui/menu/automation"
import { Html } from "dom"
import { Effects } from "@/service/Effects"
import { DeviceHost } from "@/audio-engine-shared/adapters/devices"

const className = Html.adoptStyleSheet(css, "RevampDeviceEditor")

type Construct = {
	lifecycle: Lifecycle
	project: Project
	adapter: RevampDeviceBoxAdapter
	deviceHost: DeviceHost
}

export const RevampDeviceEditor = ({ adapter, project, lifecycle, deviceHost }: Construct) => {
	const curves: HTMLCanvasElement = <canvas />
	const spectrum: HTMLCanvasElement = <canvas />
	const spectrumContext = asDefined(spectrum.getContext("2d"))
	const spectrumScale = new LinearScale(-60.0, -3.0)
	lifecycle.ownAll(
		createCurveRenderer(curves, xAxis, yAxis, adapter),
		project.liveStreamReceiver.subscribeFloats(adapter.spectrum,
			values => plotSpectrum(spectrumContext, xAxis, spectrumScale, values, project.service.engine.sampleRate())))
	const grid: SVGSVGElement = <svg />
	lifecycle.own(createDisplay(xAxis, yAxis, grid))
	const { editing, midiDevices } = project
	const { highPass, lowShelf, lowBell, midBell, highBell, highShelf, lowPass } = adapter.namedParameter
	return (
		<DeviceEditor lifecycle={lifecycle}
									project={project}
									adapter={adapter}
									populateMenu={parent => MenuItems.forEffectDevice(parent, project, deviceHost, adapter)}
									populateControls={() => (
										<div className={className}>
											<div className="default-screen" style={{ gridArea: [1, 1, 3, -1].join("/") }}>
												{grid}
												{spectrum}
												{curves}
												<div className="switches">
													{[highPass, lowShelf, lowBell, midBell, highBell, highShelf, lowPass]
														.map((parameter: Parameters, index: int) => {
															const enabled = parameter.enabled
															const checkbox: Element = (
																<ControlIndicator lifecycle={lifecycle} parameter={enabled}>
																	<Checkbox lifecycle={lifecycle}
																						model={ParameterWrapper.makeEditable(editing, enabled)}
																						appearance={{ activeColor: ColorSets[index].full }}>
																		<Icon symbol={symbols[index]} />
																	</Checkbox>
																</ControlIndicator>
															)
															lifecycle.own(attachParameterContextMenu(
																editing, midiDevices, deviceHost.audioUnitBoxAdapter().tracks, enabled.field, checkbox))
															return checkbox
														})}
												</div>
											</div>
											<Column ems={ems} space={0} color={Colors.cream}>
												<RelativeUnitValueDragging lifecycle={lifecycle}
																									 editing={editing}
																									 parameter={highPass.frequency}>
													<ParameterLabel lifecycle={lifecycle}
																					editing={editing}
																					midiDevices={midiDevices}
																					adapter={adapter}
																					parameter={highPass.frequency}
																					framed standalone />
												</RelativeUnitValueDragging>
												<RelativeUnitValueDragging lifecycle={lifecycle}
																									 editing={editing}
																									 parameter={highPass.order}
																									 options={orderValueGuide}>
													<ParameterLabel lifecycle={lifecycle}
																					editing={editing}
																					midiDevices={midiDevices}
																					adapter={adapter}
																					parameter={highPass.order}
																					framed standalone />
												</RelativeUnitValueDragging>
												<RelativeUnitValueDragging lifecycle={lifecycle}
																									 editing={editing}
																									 parameter={highPass.q}>
													<ParameterLabel lifecycle={lifecycle}
																					editing={editing}
																					midiDevices={midiDevices}
																					adapter={adapter}
																					parameter={highPass.q}
																					framed standalone />
												</RelativeUnitValueDragging>
											</Column>
											<Column ems={ems} space={0} color={Colors.cream}>
												<RelativeUnitValueDragging lifecycle={lifecycle}
																									 editing={editing}
																									 parameter={lowShelf.frequency}>
													<ParameterLabel lifecycle={lifecycle}
																					editing={editing}
																					midiDevices={midiDevices}
																					adapter={adapter}
																					parameter={lowShelf.frequency}
																					framed standalone />
												</RelativeUnitValueDragging>
												<RelativeUnitValueDragging lifecycle={lifecycle}
																									 editing={editing}
																									 parameter={lowShelf.gain}
																									 options={decibelValueGuide}>
													<ParameterLabel lifecycle={lifecycle}
																					editing={editing}
																					midiDevices={midiDevices}
																					adapter={adapter}
																					parameter={lowShelf.gain}
																					framed standalone />
												</RelativeUnitValueDragging>
											</Column>
											<Column ems={ems} space={0} color={Colors.cream}>
												<RelativeUnitValueDragging lifecycle={lifecycle}
																									 editing={editing}
																									 parameter={lowBell.frequency}>
													<ParameterLabel lifecycle={lifecycle}
																					editing={editing}
																					midiDevices={midiDevices}
																					adapter={adapter}
																					parameter={lowBell.frequency}
																					framed standalone />
												</RelativeUnitValueDragging>
												<RelativeUnitValueDragging lifecycle={lifecycle}
																									 editing={editing}
																									 parameter={lowBell.gain}
																									 options={decibelValueGuide}>
													<ParameterLabel lifecycle={lifecycle}
																					editing={editing}
																					midiDevices={midiDevices}
																					adapter={adapter}
																					parameter={lowBell.gain}
																					framed standalone />
												</RelativeUnitValueDragging>
												<RelativeUnitValueDragging lifecycle={lifecycle}
																									 editing={editing}
																									 parameter={lowBell.q}>
													<ParameterLabel lifecycle={lifecycle}
																					editing={editing}
																					midiDevices={midiDevices}
																					adapter={adapter}
																					parameter={lowBell.q}
																					framed standalone />
												</RelativeUnitValueDragging>
											</Column>
											<Column ems={ems} space={0} color={Colors.cream}>
												<RelativeUnitValueDragging lifecycle={lifecycle}
																									 editing={editing}
																									 parameter={midBell.frequency}>
													<ParameterLabel lifecycle={lifecycle}
																					editing={editing}
																					midiDevices={midiDevices}
																					adapter={adapter}
																					parameter={midBell.frequency}
																					framed standalone />
												</RelativeUnitValueDragging>
												<RelativeUnitValueDragging lifecycle={lifecycle}
																									 editing={editing}
																									 parameter={midBell.gain}
																									 options={decibelValueGuide}>
													<ParameterLabel lifecycle={lifecycle}
																					editing={editing}
																					midiDevices={midiDevices}
																					adapter={adapter}
																					parameter={midBell.gain}
																					framed standalone />
												</RelativeUnitValueDragging>
												<RelativeUnitValueDragging lifecycle={lifecycle}
																									 editing={editing}
																									 parameter={midBell.q}>
													<ParameterLabel lifecycle={lifecycle}
																					editing={editing}
																					midiDevices={midiDevices}
																					adapter={adapter}
																					parameter={midBell.q}
																					framed standalone />
												</RelativeUnitValueDragging>
											</Column>
											<Column ems={ems} space={0} color={Colors.cream}>
												<RelativeUnitValueDragging lifecycle={lifecycle}
																									 editing={editing}
																									 parameter={highBell.frequency}>
													<ParameterLabel lifecycle={lifecycle}
																					editing={editing}
																					midiDevices={midiDevices}
																					adapter={adapter}
																					parameter={highBell.frequency}
																					framed standalone />
												</RelativeUnitValueDragging>
												<RelativeUnitValueDragging lifecycle={lifecycle}
																									 editing={editing}
																									 parameter={highBell.gain}
																									 options={decibelValueGuide}>
													<ParameterLabel lifecycle={lifecycle}
																					editing={editing}
																					midiDevices={midiDevices}
																					adapter={adapter}
																					parameter={highBell.gain}
																					framed standalone />
												</RelativeUnitValueDragging>
												<RelativeUnitValueDragging lifecycle={lifecycle}
																									 editing={editing}
																									 parameter={highBell.q}>
													<ParameterLabel lifecycle={lifecycle}
																					editing={editing}
																					midiDevices={midiDevices}
																					adapter={adapter}
																					parameter={highBell.q}
																					framed standalone />
												</RelativeUnitValueDragging>
											</Column>
											<Column ems={ems} space={0} color={Colors.cream}>
												<RelativeUnitValueDragging lifecycle={lifecycle}
																									 editing={editing}
																									 parameter={highShelf.frequency}>
													<ParameterLabel lifecycle={lifecycle}
																					editing={editing}
																					midiDevices={midiDevices}
																					adapter={adapter}
																					parameter={highShelf.frequency}
																					framed standalone />
												</RelativeUnitValueDragging>
												<RelativeUnitValueDragging lifecycle={lifecycle}
																									 editing={editing}
																									 parameter={highShelf.gain}
																									 options={decibelValueGuide}>
													<ParameterLabel lifecycle={lifecycle}
																					editing={editing}
																					midiDevices={midiDevices}
																					adapter={adapter}
																					parameter={highShelf.gain}
																					framed standalone />
												</RelativeUnitValueDragging>
											</Column>
											<Column ems={ems} space={0} color={Colors.cream}>
												<RelativeUnitValueDragging lifecycle={lifecycle}
																									 editing={editing}
																									 parameter={lowPass.frequency}>
													<ParameterLabel lifecycle={lifecycle}
																					editing={editing}
																					midiDevices={midiDevices}
																					adapter={adapter}
																					parameter={lowPass.frequency}
																					framed standalone />
												</RelativeUnitValueDragging>
												<RelativeUnitValueDragging lifecycle={lifecycle}
																									 editing={editing}
																									 parameter={lowPass.order}
																									 options={orderValueGuide}>
													<ParameterLabel lifecycle={lifecycle}
																					editing={editing}
																					midiDevices={midiDevices}
																					adapter={adapter}
																					parameter={lowPass.order}
																					framed standalone />
												</RelativeUnitValueDragging>
												<RelativeUnitValueDragging lifecycle={lifecycle}
																									 editing={editing}
																									 parameter={lowPass.q}>
													<ParameterLabel lifecycle={lifecycle}
																					editing={editing}
																					midiDevices={midiDevices}
																					adapter={adapter}
																					parameter={lowPass.q}
																					framed standalone />
												</RelativeUnitValueDragging>
											</Column>
										</div>
									)}
									populateMeter={() => (
										<DevicePeakMeter lifecycle={lifecycle}
																		 receiver={project.liveStreamReceiver}
																		 address={adapter.address} />
									)}
									icon={Effects.AudioNamed.Revamp.icon} />
	)
}