import {MenuItem} from "@/ui/model/menu-item.ts"
import {ModuleDelayBox, ModuleGainBox, ModuleMultiplierBox} from "studio-boxes"
import {quantizeRound, UUID} from "lib-std"
import {Camera} from "@/ui/modular/Camera.ts"
import {Project} from "@/project/Project.ts"
import {ModularAdapter} from "studio-adapters"

export class ModuleShelf {
    static getMenuItems(project: Project, adapter: ModularAdapter, camera: Camera, clientX: number, clientY: number) {
        return [
            MenuItem.default({label: "Create Delay"})
                .setTriggerProcedure(() => {
                    const {x, y} = camera.globalToLocal(clientX, clientY)
                    project.editing.modify(() =>
                        ModuleDelayBox.create(project.boxGraph, UUID.generate(), ({attributes}) => {
                            attributes.collection.refer(adapter.box.modules)
                            attributes.label.setValue("Delay")
                            attributes.x.setValue(quantizeRound(x, 16))
                            attributes.y.setValue(quantizeRound(y, 16))
                        }))
                }),
            MenuItem.default({label: "Create Multiplier"})
                .setTriggerProcedure(() => {
                    const {x, y} = camera.globalToLocal(clientX, clientY)
                    project.editing.modify(() =>
                        ModuleMultiplierBox.create(project.boxGraph, UUID.generate(), ({attributes}) => {
                            attributes.collection.refer(adapter.box.modules)
                            attributes.label.setValue("Multiplier")
                            attributes.x.setValue(quantizeRound(x, 16))
                            attributes.y.setValue(quantizeRound(y, 16))
                        }))
                }),
            MenuItem.default({label: "Create Gain"})
                .setTriggerProcedure(() => {
                    const {x, y} = camera.globalToLocal(clientX, clientY)
                    project.editing.modify(() =>
                        ModuleGainBox.create(project.boxGraph, UUID.generate(), ({attributes}) => {
                            attributes.collection.refer(adapter.box.modules)
                            attributes.label.setValue("Gain")
                            attributes.x.setValue(quantizeRound(x, 16))
                            attributes.y.setValue(quantizeRound(y, 16))
                        }))
                })
        ]
    }
}