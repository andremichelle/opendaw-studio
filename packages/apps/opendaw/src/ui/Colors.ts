const computedStyle = getComputedStyle(document.documentElement)
export const Colors = {
    blue: computedStyle.getPropertyValue("--color-blue"),
    green: computedStyle.getPropertyValue("--color-green"),
    yellow: computedStyle.getPropertyValue("--color-yellow"),
    cream: computedStyle.getPropertyValue("--color-cream"),
    orange: computedStyle.getPropertyValue("--color-orange"),
    red: computedStyle.getPropertyValue("--color-red"),
    purple: computedStyle.getPropertyValue("--color-purple"),
    bright: computedStyle.getPropertyValue("--color-bright"),
    gray: computedStyle.getPropertyValue("--color-gray"),
    dark: computedStyle.getPropertyValue("--color-dark"),
    shadow: computedStyle.getPropertyValue("--color-shadow"),
    black: computedStyle.getPropertyValue("--color-black")
}