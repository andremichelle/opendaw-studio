import {Browser, Html, ModfierKeys} from "opendaw-dom"
import css from "./Markdown.sass?inline"
import {isDefined} from "opendaw-std"
import {createElement, RouteLocation} from "opendaw-jsx"
import markdownit from "markdown-it"
import {markdownItTable} from "markdown-it-table"

const className = Html.adoptStyleSheet(css, "Markdown")

type Construct = {
    text: string
}

export const renderMarkdown = (element: HTMLElement, text: string) => {
    if (Browser.isWindows()) {
        Object.entries(ModfierKeys.Mac)
            .forEach(([key, value]) => text = text.replaceAll(value, (ModfierKeys.Win as any)[key]))
    }
    const md = markdownit()
    md.use(markdownItTable)
    element.innerHTML = md.render(text)
    element.querySelectorAll("img").forEach(img => {
        img.crossOrigin = "anonymous"
        img.style.maxWidth = "100%"
    })
    element.querySelectorAll("a").forEach(a => {
        const url = new URL(a.href)
        if (url.origin === location.origin) {
            a.onclick = (event: Event) => {
                event.preventDefault()
                RouteLocation.get().navigateTo(url.pathname)
            }
        } else {
            a.target = "_blank"
        }
    })
    element.querySelectorAll("code").forEach(code => {
        code.title = "Click to copy to clipboard"
        code.onclick = () => {
            if (isDefined(code.textContent)) {
                navigator.clipboard.writeText(code.textContent)
                alert("Copied to clipboard")
            }
        }
    })
}

export const Markdown = ({text}: Construct) => {
    if (text.startsWith("<")) {return "Invalid Markdown"}
    const element: HTMLElement = <div className={Html.buildClassList(className, "markdown")}/>
    renderMarkdown(element, text)
    return element
}