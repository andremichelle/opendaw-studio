import css from "./ProjectInfo.sass?inline"
import {DefaultObservableValue, Lifecycle} from "opendaw-std"
import {createElement} from "opendaw-jsx"
import {StudioService} from "@/service/StudioService.ts"
import {Cover} from "./Cover"
import {Events, Html} from "opendaw-dom"

const className = Html.adoptStyleSheet(css, "ProjectInfo")

type Construct = {
    lifecycle: Lifecycle
    service: StudioService
}

export const ProjectInfo = ({lifecycle, service}: Construct) => {
    if (!service.hasProjectSession) {return "No session."}
    const {session} = service
    const {meta, cover} = session
    const inputName: HTMLInputElement = (
        <input type="text" className="default"
               placeholder="Type in your's project name"
               value={meta.name}/>
    )
    const inputTags: HTMLInputElement = (
        <input type="text" className="default"
               placeholder="Type in your's project tags"
               value={meta.tags.join(", ")}/>
    )
    const inputDescription: HTMLTextAreaElement = (
        <textarea className="default"
                  placeholder="Type in your's project description"
                  value={meta.description}/>
    )
    const coverModel = new DefaultObservableValue(cover)
    const form: HTMLElement = (
        <div className="form">
            <div className="label">Name</div>
            <label info="Maximum 128 characters">{inputName}</label>
            <div className="label">Tags</div>
            <label info="Separate tags with commas">{inputTags}</label>
            <div className="label">Description</div>
            <label info="Maximum 512 characters">{inputDescription}</label>
            <div className="label">Cover</div>
            <Cover lifecycle={lifecycle} model={coverModel}/>
        </div>
    )
    lifecycle.ownAll(
        Events.subscribe(form, "keydown", (event: KeyboardEvent) => {
            if (event.code === "Enter" && event.target instanceof HTMLInputElement) {event.target.blur()}
        }),
        Events.subscribe(inputName, "blur",
            () => session.updateMetaData("name", inputName.value)),
        Events.subscribe(inputDescription, "blur",
            () => session.updateMetaData("description", inputDescription.value)),
        Events.subscribe(inputTags, "blur",
            () => session.updateMetaData("tags", inputTags.value.split(",").map(x => x.trim()))),
        Events.subscribe(inputName, "input", () => Html.limitChars(inputDescription, "value", 128)),
        Events.subscribe(inputDescription, "input", () => Html.limitChars(inputDescription, "value", 512)),
        coverModel.subscribe(owner => session.updateCover(owner.getValue()))
    )
    return (
        <div className={className}>
            {form}
        </div>
    )
}