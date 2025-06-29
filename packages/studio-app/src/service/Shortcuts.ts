import {StudioService} from "@/service/StudioService"
import {PanelType} from "@/ui/workspace/PanelType"
import {Events, Keyboard} from "opendaw-dom"

export class Shortcuts {
    constructor(service: StudioService) {
        window.addEventListener("keydown", (event: KeyboardEvent) => {
            if (Events.isTextInput(event.target) || event.repeat) {return}
            const code = event.code
            if (Keyboard.isControlKey(event) && event.shiftKey && code === "KeyS") {
                event.preventDefault()
                service.saveAs()
            } else if (Keyboard.isControlKey(event) && code === "KeyS") {
                event.preventDefault()
                service.save()
            } else if (Keyboard.isControlKey(event) && code === "KeyO") {
                event.preventDefault()
                service.browse()
            } else if (code === "Space") {
                event.preventDefault()
                const playing = service.engine.isPlaying()
                playing.setValue(!playing.getValue())
            } else if (code === "KeyE") {
                service.panelLayout.getByType(PanelType.ContentEditor).toggleMinimize()
            } else if (code === "KeyB") {
                service.panelLayout.getByType(PanelType.BrowserPanel).toggleMinimize()
            } else if (code === "KeyD") {
                service.panelLayout.getByType(PanelType.DevicePanel).toggleMinimize()
            } else if (code === "KeyM") {
                service.panelLayout.getByType(PanelType.Mixer).toggleMinimize()
            } else if (event.shiftKey) {
                if (code === "Digit0") {
                    service.closeProject()
                } else if (code === "Digit1") {
                    if (service.hasProjectSession) {
                        service.switchScreen("default")
                    }
                } else if (code === "Digit2") {
                    if (service.hasProjectSession) {
                        service.switchScreen("mixer")
                    }
                } else if (code === "Digit3") {
                    if (service.hasProjectSession) {
                        service.switchScreen("modular")
                    }
                } else if (code === "Digit4") {
                    if (service.hasProjectSession) {
                        service.switchScreen("piano")
                    }
                } else if (code === "Digit5") {
                    if (service.hasProjectSession) {
                        service.switchScreen("project")
                    }
                } else if (code === "Digit6") {
                    if (service.hasProjectSession) {
                        service.switchScreen("meter")
                    }
                }
            }
        })
    }
}