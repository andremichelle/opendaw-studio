import css from "./Cover.sass?inline"
import {DefaultObservableValue, EmptyExec, isDefined, Lifecycle, Option, panic} from "std"
import {createElement} from "jsx"
import {Icon} from "../components/Icon"
import {IconSymbol} from "@/IconSymbol"
import {showInfoDialog} from "@/ui/components/dialogs"
import {Errors, Events, Files, Html} from "dom"
import {Promises} from "runtime"

const className = Html.adoptStyleSheet(css, "Cover")

type Construct = {
    lifecycle: Lifecycle
    model: DefaultObservableValue<Option<ArrayBuffer>>
}

export const Cover = ({lifecycle, model}: Construct) => {
    const placeholder = "/cover.png"
    const editIcon: Element = <Icon symbol={IconSymbol.EditBox} className="edit-icon"/>
    const image: HTMLImageElement = (<img src={placeholder} alt="Cover"/>)
    lifecycle.ownAll(
        model.catchupAndSubscribe(owner => {
            image.src = owner.getValue().match({
                none: () => placeholder,
                some: buffer => buffer.byteLength === 0 ? placeholder : URL.createObjectURL(new Blob([buffer]))
            })
        }),
        Events.subscribe(editIcon, "click", async () => {
            const {status, value, error} = await Promises.tryCatch(Files.open())
            if (status === "rejected") {
                if (!Errors.isAbort(error)) {return panic(String(error))}
                return
            }
            const file = value?.at(0)
            if (!isDefined(file)) {return}
            if (file.size > (1 << 20) * 4) {
                showInfoDialog({headline: "Cover", message: "Image is too large. Keep it below 4mb."}).catch(EmptyExec)
                return
            }
            const fallback = image.src
            image.onerror = () => {
                image.onerror = null
                image.src = fallback
                showInfoDialog({headline: "Cover", message: `Unknown image format (${file.type}).`}).catch(EmptyExec)
            }
            model.setValue(Option.wrap(await file.arrayBuffer()))
        })
    )
    return (
        <div className={className}>
            {editIcon}
            {image}
        </div>
    )
}