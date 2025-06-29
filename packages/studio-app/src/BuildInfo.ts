// This JSON gets created right before building (check ../vite.config.ts) and stored in the public folder.
export type BuildInfo = {
    date: number
    uuid: string
    env: "production" | "development"
}