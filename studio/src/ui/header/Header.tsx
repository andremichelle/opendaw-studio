import css from "./Header.sass?inline"
import {Checkbox} from "@/ui/components/Checkbox.tsx"
import {Icon} from "@/ui/components/Icon.tsx"
import {Colors} from "@/ui/Colors.ts"
import {Lifecycle, Nullable, ObservableValue, Observer, Subscription} from "std"
import {TransportGroup} from "@/ui/header/TransportGroup.tsx"
import {TimeStateDisplay} from "@/ui/header/TimeStateDisplay.tsx"
import {RadioGroup} from "@/ui/components/RadioGroup.tsx"
import {createElement, Frag, RouteLocation} from "jsx"
import {StudioService} from "@/service/StudioService"
import {MenuButton} from "@/ui/components/MenuButton.tsx"
import {Workspace} from "@/ui/workspace/Workspace.ts"
import {IconSymbol} from "@core/IconSymbol.ts"
import {MidiDeviceAccess} from "@/midi/devices/MidiDeviceAccess"
import {Html} from "dom"
import {MenuItem} from "@/ui/model/menu-item"

const className = Html.adoptStyleSheet(css, "Header")

type Construct = {
    lifecycle: Lifecycle
    service: StudioService
}

export const Header = ({lifecycle, service}: Construct) => {
    return (
        <header className={className}>
            <MenuButton root={service.menu}
                        appearance={{color: Colors.gray, activeColor: Colors.bright, tinyTriangle: true}}>
                <h5>openDAW</h5>
            </MenuButton>
            <hr/>
            <div style={{display: "flex"}}>
                <Checkbox lifecycle={lifecycle}
                          model={MidiDeviceAccess.available()}
                          appearance={{activeColor: Colors.orange, tooltip: "Midi Access", cursor: "pointer"}}>
                    <Icon symbol={IconSymbol.Midi}/>
                </Checkbox>
                <MenuButton root={MenuItem.root()
                    .setRuntimeChildrenProcedure(parent => {
                        const helpVisible = service.layout.helpVisible
                        return parent.addMenuItem(
                            MenuItem.default({label: "Visible Hints & Tooltips", checked: helpVisible.getValue()})
                                .setTriggerProcedure(() => helpVisible.setValue(!helpVisible.getValue())),
                            MenuItem.default({label: "Manuals", separatorBefore: true})
                                .setTriggerProcedure(() => RouteLocation.get().navigateTo("/manuals/"))
                        )
                    })} appearance={{color: Colors.green, tinyTriangle: true}}>
                    <Icon symbol={IconSymbol.Help}/>
                </MenuButton>
            </div>
            <hr/>
            <TransportGroup lifecycle={lifecycle} service={service}/>
            <hr/>
            <TimeStateDisplay lifecycle={lifecycle} service={service}/>
            {
                location.origin.includes("localhost") && (
                    <Frag>
                        <hr/>
                        <div title="Just a visual indicator to debug a smooth frame-rate"
                             style={{display: "flex", scale: "0.625"}}>
                            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <g className="spinner_GuJz">
                                    <circle cx="3" cy="12" r="2"/>
                                    <circle cx="21" cy="12" r="2"/>
                                    <circle cx="12" cy="21" r="2"/>
                                    <circle cx="12" cy="3" r="2"/>
                                    <circle cx="5.64" cy="5.64" r="2"/>
                                    <circle cx="18.36" cy="18.36" r="2"/>
                                    <circle cx="5.64" cy="18.36" r="2"/>
                                    <circle cx="18.36" cy="5.64" r="2"/>
                                </g>
                            </svg>
                        </div>
                    </Frag>
                )
            }
            <hr/>
            <Checkbox lifecycle={lifecycle}
                      model={service.engine.metronomeEnabled()}
                      appearance={{activeColor: Colors.orange, tooltip: "Metronome"}}>
                <Icon symbol={IconSymbol.Metronome}/>
            </Checkbox>
            <hr/>
            <div style={{flex: "1 0 0"}}/>
            <a className="support"
               href="https://www.patreon.com/bePatron?u=61769481"
               target="_blank"
               rel="noopener noreferrer"
               data-patreon-widget-type="become-patron-button">
                <img src="/become_a_patron_button.png" alt="Patreon"/>
            </a>
            <div style={{flex: "2 0 0"}}/>
            <hr/>
            <RadioGroup lifecycle={lifecycle}
                        model={new class implements ObservableValue<Nullable<Workspace.ScreenKeys>> {
                            setValue(value: Nullable<Workspace.ScreenKeys>): void {
                                if (service.hasProjectSession) {service.switchScreen(value)}
                            }
                            getValue(): Nullable<Workspace.ScreenKeys> {
                                return service.layout.screen.getValue()
                            }
                            subscribe(observer: Observer<ObservableValue<Nullable<Workspace.ScreenKeys>>>): Subscription {
                                return service.layout.screen.subscribe(observer)
                            }
                            catchupAndSubscribe(observer: Observer<ObservableValue<Nullable<Workspace.ScreenKeys>>>): Subscription {
                                observer(this)
                                return this.subscribe(observer)
                            }
                        }}
                        elements={Object.entries(Workspace.Default)
                            .filter(([_, {hidden}]: [string, Workspace.Screen]) => hidden !== true)
                            .map(([key, {icon: iconSymbol, name}]) => ({
                                value: key,
                                element: <Icon symbol={iconSymbol}/>,
                                tooltip: name
                            }))}
                        appearance={{framed: true, landscape: true}}/>
        </header>
    )
}