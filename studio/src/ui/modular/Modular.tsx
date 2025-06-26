import css from "./Modular.sass?inline"
import {assert, Lifecycle, SortedSet, Terminable, Terminator, UUID} from "std"
import {createElement} from "jsx"
import {StudioService} from "@/service/StudioService.ts"
import {ModularBox} from "@core/data/boxes"
import {ModularAdapter} from "@/audio-engine-shared/adapters/modular/modular.ts"
import {PointerField, Vertex} from "box"
import {ModularTabButton} from "@/ui/modular/ModularTabButton.tsx"
import {ModularView} from "./ModularView.tsx"
import {EmptyModular} from "@/ui/modular/EmptyModular.tsx"
import {Html} from "dom"

const className = Html.adoptStyleSheet(css, "Modular")

type ModularTab = {
    uuid: UUID.Format
    button: Element
    terminable: Terminable
}

type Construct = {
    lifecycle: Lifecycle
    service: StudioService
}

export const Modular = ({lifecycle, service: {project}}: Construct) => {
    const boxAdapters = project.boxAdapters

    const navigation: HTMLElement = <nav/>
    const container: HTMLDivElement = <div className="container"/>

    const availableSystems: SortedSet<UUID.Format, ModularTab> = UUID.newSet(entry => entry.uuid)
    const addModularSystem = (adapter: ModularAdapter) => {
        const terminator: Terminator = new Terminator()
        const button = <ModularTabButton lifecycle={terminator}
                                         userFocus={project.userEditingManager.modularSystem}
                                         adapter={adapter}/>
        navigation.appendChild(button)
        const added = availableSystems.add({
            uuid: adapter.uuid,
            button: button,
            terminable: terminator
        })
        assert(added, `Could not add tab button for ${adapter}`)
    }
    const removeModularSystem = (uuid: UUID.Format) => {
        const tab = availableSystems.removeByKey(uuid)
        tab.button.remove()
        tab.terminable.terminate()
    }

    const pointerHub = project.rootBox.modularSetups.pointerHub
    for (const incomingElement of pointerHub.incoming()) {
        const modularSystemAdapter = boxAdapters.adapterFor(incomingElement.box as ModularBox, ModularAdapter)
        addModularSystem(modularSystemAdapter)
    }
    lifecycle.own(pointerHub.subscribeTransactual({
        onAdd: (pointer: PointerField) =>
            addModularSystem(boxAdapters.adapterFor(pointer.box as ModularBox, ModularAdapter)),
        onRemove: (pointer: PointerField) => removeModularSystem(pointer.address.uuid)
    }))
    const modularViewLifecycle = lifecycle.own(new Terminator())
    lifecycle.own(project.userEditingManager.modularSystem.catchupAndSubscribe(subject => subject.match({
        none: () => {
            modularViewLifecycle.terminate()
            Html.empty(container)
            container.appendChild(<EmptyModular lifecycle={lifecycle}/>)
        },
        some: (vertex: Vertex) => {
            modularViewLifecycle.terminate()
            Html.empty(container)
            const adapter = boxAdapters.adapterFor(vertex.box as ModularBox, ModularAdapter)
            container.appendChild(
                <ModularView lifecycle={modularViewLifecycle}
                             project={project}
                             modularSystemAdapter={adapter}/>
            )
        }
    })))
    return (
        <div className={className}>
            {navigation}
            {container}
        </div>
    )
}