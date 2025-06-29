export namespace Markers {
    export const DefaultNames = ["Intro", "Verse", "Chorus", "Bridge", "Outro"]

    export const nextName = (name: string) => {
        const index = DefaultNames.findIndex(defaultName => defaultName === name)
        return index === -1 ? "New" : DefaultNames.at(index + 1) ?? "New"
    }
}