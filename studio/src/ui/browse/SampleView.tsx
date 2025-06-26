import css from "./SampleView.sass?inline"
import {createElement} from "jsx"
import {Exec, Lifecycle, Objects, UUID} from "std"
import {SamplePlayback} from "@/service/SamplePlayback"
import {AudioSample} from "@/audio/AudioSample"
import {Icon} from "../components/Icon"
import {IconSymbol} from "@core/IconSymbol.ts"
import {SampleLocation} from "@/ui/browse/SampleLocation"
import {Button} from "../components/Button"
import {SampleDialogs} from "@/ui/browse/SampleDialogs"
import {AudioStorage} from "@/audio/AudioStorage"
import {ContextMenu} from "@/ui/ContextMenu"
import {MenuItem} from "@/ui/model/menu-item"
import {SampleService} from "@/ui/browse/SampleService"
import {Html} from "dom"
import {Promises} from "runtime"
import {DragAndDrop} from "@/ui/DragAndDrop"

const className = Html.adoptStyleSheet(css, "Sample")

type Construct = {
    lifecycle: Lifecycle
    sampleService: SampleService
    sample: AudioSample
    playback: SamplePlayback
    location: SampleLocation
    refresh: Exec
}

export const SampleView = ({lifecycle, sampleService, sample, playback, location, refresh}: Construct) => {
    const {name, duration, bpm} = sample
    const labelName: HTMLElement = <span>{name}</span>
    const labelBpm: HTMLElement = <span className="right">{bpm.toFixed(1)}</span>
    const editButton: Element = (
        <Button lifecycle={lifecycle} appearance={{activeColor: "white"}}
                onClick={async (event) => {
                    event.stopPropagation()
                    const {status, value: meta} = await Promises.tryCatch(SampleDialogs.showEditSampleDialog(sample))
                    if (status === "resolved") {
                        await AudioStorage.updateMeta(UUID.parse(meta.uuid), Objects.exclude(meta, "uuid"))
                        refresh()
                    }
                }}>
            <Icon symbol={IconSymbol.Pencil}/>
        </Button>
    )
    const deleteButton: Element = (
        <Button lifecycle={lifecycle} appearance={{activeColor: "white"}}
                onClick={async (event) => {
                    event.stopPropagation()
                    await sampleService.deleteSamples(sample)
                    refresh()
                }}>
            <Icon symbol={IconSymbol.Close}/>
        </Button>
    )
    const metaElement: HTMLElement = (
        <div className="meta" ondblclick={() => playback.toggle(sample.uuid)}>
            {labelName}
            {labelBpm}
            <span className="right">{duration.toFixed(1)}</span>
        </div>
    )
    const element: HTMLElement = (
        <div className={className}
             data-selection={JSON.stringify(sample)}
             ondragstart={() => playback.eject()}
             draggable>
            {metaElement}
            {location === SampleLocation.Local && (
                <div className="edit">
                    {editButton}
                    {deleteButton}
                </div>
            )}
        </div>
    )
    lifecycle.ownAll(
        DragAndDrop.installSource(element, () => ({type: "sample", sample})),
        ContextMenu.subscribe(element, collector => collector.addItems(
            MenuItem.default({label: "Create Audio Track(s)"})
                .setTriggerProcedure(() => sampleService.requestTapes()),
            MenuItem.default({label: "Delete Sample(s)", selectable: location === SampleLocation.Local})
                .setTriggerProcedure(async () => {
                    await sampleService.deleteSelected()
                    refresh()
                }))
        ),
        playback.subscribe(sample.uuid, event => {
            metaElement.classList.remove("buffering", "playing", "error")
            metaElement.classList.add(event.type)
            switch (event.type) {
                case "idle":
                    break
                case "buffering":
                    break
                case "playing":
                    break
                case "error":
                    break
            }
        })
    )
    return element
}