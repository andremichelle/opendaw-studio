import css from "./NotePadPanel.sass?inline"
import template from "./NotePadTemplate.md?raw"
import {createElement} from "lib-jsx"
import {DefaultObservableValue, Lifecycle} from "lib-std"
import {StudioService} from "@/service/StudioService"
import {Icon} from "@/ui/components/Icon"
import {IconSymbol} from "studio-shared"
import {Checkbox} from "@/ui/components/Checkbox"
import {renderMarkdown} from "@/ui/Markdown"
import {Events, Html, Keyboard} from "lib-dom"

const className = Html.adoptStyleSheet(css, "NotePadPanel")

type Construct = {
    lifecycle: Lifecycle
    service: StudioService
}

export const NotePadPanel = ({lifecycle, service}: Construct) => {
    const markdownText = new DefaultObservableValue("")
    const editMode = new DefaultObservableValue(false)
    const notepad: HTMLElement = <div className="content"/>
    const saveNotepad = () => {
        const innerText = notepad.innerText
        if (innerText === template) {return}
        markdownText.setValue(innerText)
        service.session.updateMetaData("notepad", innerText)
    }
    const update = () => {
        Html.empty(notepad)
        const text = markdownText.getValue()
        if (editMode.getValue()) {
            notepad.textContent = text
            notepad.setAttribute("contentEditable", "true")
            notepad.focus()
        } else {
            notepad.removeAttribute("contentEditable")
            renderMarkdown(notepad, text)
        }
    }
    if ((service.session.meta.notepad?.length ?? 0) > 0) {
        markdownText.setValue(service.session.meta.notepad!)
    } else {
        markdownText.setValue(template)
    }
    update()
    const element: Element = (
        <div className={className}>
            {notepad}
            <Checkbox lifecycle={lifecycle}
                      model={editMode}
                      style={{fontSize: "1rem", position: "sticky", top: "0.75em", right: "0.75em"}}
                      appearance={{cursor: "pointer"}}>
                <div style={{display: "flex"}}>
                    <Icon symbol={IconSymbol.EditBox}/>
                </div>
            </Checkbox>
        </div>
    )
    lifecycle.ownAll(
        editMode.subscribe(() => {
            if (!editMode.getValue()) {saveNotepad()}
            update()
        }),
        Events.subscribe(element, "keydown", event => {
            if (editMode.getValue() && Keyboard.isControlKey(event) && event.code === "KeyS") {
                event.preventDefault()
                saveNotepad()
                service.save()
            }
        }),
        Events.subscribe(notepad, "blur", () => editMode.setValue(false)),
        Events.subscribe(notepad, "input", () => Html.limitChars(notepad, "innerText", 10_000)),
        {terminate: () => {if (editMode.getValue()) {saveNotepad()}}}
    )
    return element
}