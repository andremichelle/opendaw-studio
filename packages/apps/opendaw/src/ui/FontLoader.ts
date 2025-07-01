import {Fonts} from "@/ui/Fonts"
import {loadFont} from "lib-dom"
import {Lazy} from "lib-std"

export class FontLoader {
    @Lazy
    static async load() {
        return Promise.allSettled([
            loadFont(Fonts.Rubik), loadFont(Fonts.OpenSans)
        ])
    }
}