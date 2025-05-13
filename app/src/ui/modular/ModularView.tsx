import css from "./ModularView.sass?inline"
import {Lifecycle, Option, quantizeRound, Selection, Terminator} from "std"
import {appendChildren, createElement} from "jsx"
import {ModularAdapter} from "@/audio-engine-shared/adapters/modular/modular.ts"
import {ModuleAdapter} from "@/audio-engine-shared/adapters/modular/module.ts"
import {GenericModuleView} from "@/ui/modular/GenericModuleView.tsx"
import {Camera} from "@/ui/modular/Camera.ts"
import {Project} from "@/project/Project.ts"
import {ModularEnvironment, ModuleViewAdapter} from "@/ui/modular/ModularEnvironment.ts"
import {ModularWires} from "@/ui/modular/ModularWires.tsx"
import {ModuleAttributes} from "@/data/boxes/ModuleAttributes.ts"
import {ContextMenu} from "@/ui/ContextMenu.ts"
import {ModuleShelf} from "@/ui/modular/ModuleShelf.ts"
import {Dragging, Html} from "dom"

const className = Html.adoptStyleSheet(css, "ModularView")

type Construct = {
    lifecycle: Lifecycle
    project: Project
    modularSystemAdapter: ModularAdapter
}

type ModuleMove = {
    x: number
    y: number
    attributes: ModuleAttributes
}

export const ModularView = ({lifecycle, project, modularSystemAdapter}: Construct) => {
    const element: HTMLDivElement = <div className={className}/>
    const camera = lifecycle.own(new Camera(element))
    const environment = lifecycle.own(new ModularEnvironment(project, modularSystemAdapter, camera))
    const selection: Selection<ModuleAdapter> = environment.selection
    const gridLayer: HTMLDivElement = <div className="grid layer"/>
    const modulesLayer: HTMLDivElement = <div className="modules layer"/>
    appendChildren(element,
        <div className="surface layer">
            {gridLayer}
            {modulesLayer}
            <ModularWires lifecycle={lifecycle} environment={environment} camera={camera}/>
        </div>,
        <div className="vignette layer"/>
    )
    lifecycle.own(ContextMenu.subscribe(element, ({addItems, client: {clientX, clientY}}) => {
        addItems(...ModuleShelf.getMenuItems(project, modularSystemAdapter, camera, clientX, clientY))
    }))
    lifecycle.own(modularSystemAdapter.catchupAndSubscribe({
        onModuleAdded: (moduleAdapter: ModuleAdapter) => {
            const moduleLifecycle = new Terminator()
            const moduleView: Element =
                <GenericModuleView lifecycle={moduleLifecycle} environment={environment} adapter={moduleAdapter}/>
            modulesLayer.appendChild(moduleView)
            moduleLifecycle.own({terminate: () => moduleView.remove()})
            environment.registerModule({
                moduleView,
                moduleAdapter,
                lifecycle: moduleLifecycle
            } satisfies ModuleViewAdapter)
        },
        onModuleRemoved: (moduleAdapter: ModuleAdapter) => {
            environment.unregisterModule(moduleAdapter.box.address.uuid)
        }
    }))
    lifecycle.own(Dragging.attach(element, (event: PointerEvent) => {
        const clickedSurface = event.target === event.currentTarget
        if (clickedSurface) {
            selection.deselectAll()
            return Option.None
        }
        event.stopImmediatePropagation() // prevent camera movement
        if (selection.isEmpty()) {return Option.None}
        const startPointerX = event.clientX
        const startPointerY = event.clientY
        const moving: ReadonlyArray<ModuleMove> = selection.selected().map(({attributes}) =>
            ({attributes, x: attributes.x.getValue(), y: attributes.y.getValue()}))
        const {editing} = project
        return Option.wrap({
            update: (event: Dragging.Event) => {
                const deltaX = quantizeRound(event.clientX - startPointerX, 16)
                const deltaY = quantizeRound(event.clientY - startPointerY, 16)
                editing.modify(() => {
                    moving.forEach(({attributes, x, y}) => {
                        attributes.x.setValue(x + deltaX)
                        attributes.y.setValue(y + deltaY)
                    })
                }, false)
            },
            cancel: () => {
                editing.modify(() => moving.forEach(({attributes, x, y}) => {
                    attributes.x.setValue(x)
                    attributes.y.setValue(y)
                }), false)
            },
            approve: () => editing.mark()
        })
    }, {permanentUpdates: true}))

    // Needs to be called last to receive events as last one in bubbling phase.
    // Dragging module must be able to prevent camera movement.
    camera.listen()
    return element
}