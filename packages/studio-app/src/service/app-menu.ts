import {MenuItem} from "@/ui/model/menu-item"
import {StudioService} from "@/service/StudioService"
import {showDebugBoxesDialog} from "@/ui/components/dialogs.tsx"
import {RouteLocation} from "opendaw-jsx"
import {isDefined, panic} from "opendaw-std"
import {Browser, ModfierKeys} from "opendaw-dom"
import {SyncLogService} from "@/service/SyncLogService"

export const initAppMenu = (service: StudioService) => {
    return MenuItem.root()
        .setRuntimeChildrenProcedure(parent => parent.addMenuItem(
            MenuItem.default({label: "New"})
                .setTriggerProcedure(() => service.closeProject()),
            MenuItem.default({label: "Open...", shortcut: [ModfierKeys.System.Cmd, "O"]})
                .setTriggerProcedure(() => service.browse()),
            MenuItem.default({
                label: "Save",
                shortcut: [ModfierKeys.System.Cmd, "S"],
                selectable: service.hasProjectSession
            }).setTriggerProcedure(() => service.save()),
            MenuItem.default({
                label: "Save As...",
                shortcut: [ModfierKeys.System.Cmd, ModfierKeys.System.Shift, "S"],
                selectable: service.hasProjectSession
            }).setTriggerProcedure(() => service.saveAs()),
            MenuItem.default({label: "Import"})
                .setRuntimeChildrenProcedure(parent => parent.addMenuItem(
                    MenuItem.default({label: "Audio Files..."})
                        .setTriggerProcedure(() => service.browseForSamples(true)),
                    MenuItem.default({label: "Project Bundle..."})
                        .setTriggerProcedure(() => service.importZip())
                )),
            MenuItem.default({label: "Export", selectable: service.hasProjectSession})
                .setRuntimeChildrenProcedure(parent => parent.addMenuItem(
                    MenuItem.default({label: "Mixdown...", selectable: service.hasProjectSession})
                        .setTriggerProcedure(() => service.exportMixdown()),
                    MenuItem.default({label: "Stems...", selectable: service.hasProjectSession})
                        .setTriggerProcedure(() => service.exportStems()),
                    MenuItem.default({label: "Project Bundle...", selectable: service.hasProjectSession})
                        .setTriggerProcedure(() => service.exportZip())
                )),
            MenuItem.default({label: "Debug", separatorBefore: true})
                .setRuntimeChildrenProcedure(parent => {
                    return parent.addMenuItem(
                        MenuItem.default({
                            label: "New SyncLog...",
                            selectable: isDefined(window.showSaveFilePicker)
                        }).setTriggerProcedure(() => SyncLogService.start(service)),
                        MenuItem.default({
                            label: "Open SyncLog...",
                            selectable: isDefined(window.showOpenFilePicker)
                        }).setTriggerProcedure(() => SyncLogService.append(service)),
                        MenuItem.default({
                            label: "Show Boxes...",
                            selectable: service.hasProjectSession,
                            separatorBefore: true
                        })
                            .setTriggerProcedure(() => showDebugBoxesDialog(service.project.boxGraph)),
                        MenuItem.default({label: "Validate Project...", selectable: service.hasProjectSession})
                            .setTriggerProcedure(() => service.project.verify()),
                        MenuItem.default({
                            label: "Load file...",
                            separatorBefore: true
                        }).setTriggerProcedure(() => service.loadFile()),
                        MenuItem.default({
                            label: "Save file...",
                            selectable: service.hasProjectSession
                        }).setTriggerProcedure(() => service.saveFile()),
                        MenuItem.default({label: "Pages", selectable: false, separatorBefore: true}),
                        MenuItem.default({label: "・ Icons"})
                            .setTriggerProcedure(() => RouteLocation.get().navigateTo("/icons")),
                        MenuItem.default({label: "・ Components"})
                            .setTriggerProcedure(() => RouteLocation.get().navigateTo("/components")),
                        MenuItem.default({label: "・ Automation"})
                            .setTriggerProcedure(() => RouteLocation.get().navigateTo("/automation")),
                        MenuItem.default({label: "・ Audio Input Devices"})
                            .setTriggerProcedure(() => RouteLocation.get().navigateTo("/audio-input")),
                        MenuItem.default({label: "・ Errors"})
                            .setTriggerProcedure(() => RouteLocation.get().navigateTo("/errors")),
                        MenuItem.default({
                            label: "Throw an error in main-thread 💣",
                            separatorBefore: true,
                            hidden: !Browser.isLocalHost() && location.hash !== "#admin"
                        }).setTriggerProcedure(() => panic("An error has been emulated")),
                        MenuItem.default({label: "Throw an error in audio-worklet 💣", hidden: !Browser.isLocalHost()})
                            .setTriggerProcedure(() => service.panicAudioWorklet())
                    )
                }),
            MenuItem.default({label: "Imprint", separatorBefore: true})
                .setTriggerProcedure(() => RouteLocation.get().navigateTo("/imprint"))
        ))
}