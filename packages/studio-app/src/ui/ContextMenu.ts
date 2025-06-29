import {MenuItem} from "@/ui/model/menu-item"
import {Client, Option, panic, Subscription} from "opendaw-std"
import {Menu} from "@/ui/components/Menu.tsx"
import {Surface} from "@/ui/surface/Surface.tsx"
import {Events, Html} from "opendaw-dom"

export namespace ContextMenu {
    export const CONTEXT_MENU_EVENT_TYPE = "--context-menu" as const

    export interface Collector {
        addItems(...items: MenuItem[]): this

        get client(): Client
    }

    class CollectorImpl implements Collector {
        static collecting: Option<CollectorImpl> = Option.None

        readonly root = MenuItem.root()

        #hasItems: boolean = false
        #separatorBefore: boolean = false

        constructor(readonly client: Client) {}

        get hasItems(): boolean {return this.#hasItems}

        readonly addItems = (...items: MenuItem[]): this => {
            items.forEach((item: MenuItem) => {
                if (item.hidden) {return}
                if (this.#separatorBefore) {item.addSeparatorBefore()}
                this.root.addMenuItem(item)
                this.#hasItems = true
                this.#separatorBefore = false
            })
            this.#separatorBefore = true
            return this
        }

        abort(): void {CollectorImpl.collecting = Option.None}
    }

    export const install = (owner: WindowProxy): Subscription => {
        return Events.subscribe(owner, "contextmenu", async (mouseEvent: MouseEvent) => {
            if (CollectorImpl.collecting.nonEmpty()) {
                console.warn("One context-menu is still populating (abort)")
                return
            }
            mouseEvent.preventDefault()
            const event: Event = new Event(CONTEXT_MENU_EVENT_TYPE, {bubbles: true, composed: true, cancelable: true})
            CollectorImpl.collecting = Option.wrap(new CollectorImpl(mouseEvent))
            mouseEvent.target?.dispatchEvent(event)
            if (CollectorImpl.collecting.nonEmpty()) {
                const collector = CollectorImpl.collecting.unwrap()
                if (collector.hasItems) {
                    Html.unfocus(owner)
                    const offset = 2
                    const x: number = mouseEvent.clientX - offset
                    const y: number = mouseEvent.clientY
                    const menu = Menu.create(collector.root)
                    menu.moveTo(x, y)
                    menu.attach(Surface.get(owner).flyout)
                }
                CollectorImpl.collecting = Option.None
            }
        }, {capture: true})
    }

    export const subscribe = (target: EventTarget, collect: (collector: Collector) => void): Subscription =>
        Events.subscribeAny(target, CONTEXT_MENU_EVENT_TYPE, event => {
            CollectorImpl.collecting.match({
                none: () => panic(`Got collect event ${event} without being in populating phase`),
                some: (collector: CollectorImpl) => collect(collector)
            })
        }, {capture: false})
}