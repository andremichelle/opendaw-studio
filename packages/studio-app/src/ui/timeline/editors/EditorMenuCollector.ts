import {MenuItem, MenuRootData} from "@/ui/model/menu-item.ts"

export interface EditorMenuCollector {
    viewMenu: MenuItem<MenuRootData>
    editMenu: MenuItem<MenuRootData>
}