import {Fonts} from "@/ui/Fonts"
import {loadFont} from "opendaw-dom"
import {Lazy} from "opendaw-std"

export class FontLoader {
    @Lazy
    static async load() {
        return Promise.allSettled([
            loadFont(Fonts.Rubik), loadFont(Fonts.OpenSans)
        ])
    }
}