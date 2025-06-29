import {isDefined, unitValue} from "./lang"

export namespace Color {
    export type RGBA = [unitValue, unitValue, unitValue, unitValue]

    export const parseCssRgbOrRgba = (color: string): RGBA => {
        const colorValues = color.match(/\(([^)]+)\)/)?.at(1)?.split(",")?.map(Number)
        if (isDefined(colorValues) && colorValues.every(value => !isNaN(value))) {
            if (colorValues.length === 3) {
                return [
                    colorValues[0] / 255.0,
                    colorValues[1] / 255.0,
                    colorValues[2] / 255.0,
                    1.0
                ]
            } else if (colorValues.length === 4) {
                return [
                    colorValues[0] / 255.0,
                    colorValues[1] / 255.0,
                    colorValues[2] / 255.0,
                    colorValues[3]
                ]
            }
        }
        throw new Error(`${color} is not proper formatted. Example: 'rgb(255, 255, 255)' or 'rgba(255, 255, 255, 1)'`)
    }
}