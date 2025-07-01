import SftpClient from "ssh2-sftp-client"
import * as fs from "fs"
import * as path from "path"

const config = {
    host: process.env.SFTP_HOST,
    port: Number(process.env.SFTP_PORT),
    username: process.env.SFTP_USERNAME,
    password: process.env.SFTP_PASSWORD
} as const

const DRY_RUN = process.env.DRY_RUN === "1" || process.argv.includes("--dry")
console.info(`DRY_RUN: ${DRY_RUN}`)
const env = Object.entries({
    SFTP_HOST: process.env.SFTP_HOST,
    SFTP_PORT: process.env.SFTP_PORT,
    SFTP_USERNAME: process.env.SFTP_USERNAME,
    SFTP_PASSWORD: process.env.SFTP_PASSWORD,
    DISCORD_WEBHOOK: process.env.DISCORD_WEBHOOK
})
console.log(env)
const missing = env.filter(([, v]) => !v).map(([k]) => k)
if (missing.length > 0) {
    throw new Error(`Missing secrets/vars: ${missing.join(", ")}`)
}
if (DRY_RUN) {
    console.log("✅ All secrets & variables are set. Nothing was uploaded (dry-run).")
    process.exit(0)
}
const sftp = new SftpClient()
const staticFolders = ["/viscious-speed"]

async function deleteDirectory(remoteDir: string) {
    const items = await sftp.list(remoteDir)
    for (const item of items) {
        const remotePath = path.posix.join(remoteDir, item.name)
        if (staticFolders.includes(remotePath)) continue
        if (item.type === "d") {
            await deleteDirectory(remotePath)
            await sftp.rmdir(remotePath, true)
        } else {
            await sftp.delete(remotePath)
        }
    }
}

async function uploadDirectory(localDir: string, remoteDir: string) {
    for (const file of fs.readdirSync(localDir)) {
        const localPath = path.join(localDir, file)
        const remotePath = path.posix.join(remoteDir, file)
        if (fs.lstatSync(localPath).isDirectory()) {
            await sftp.mkdir(remotePath, true).catch(() => {/* exists */})
            if (staticFolders.includes(remotePath)) continue
            await uploadDirectory(localPath, remotePath)
        } else {
            console.log(`upload ${remotePath}`)
            await sftp.put(localPath, remotePath)
        }
    }
}

// --------------------- main -------------------------------------------------
(async () => {
    console.log(`⏩ upload…`)
    await sftp.connect(config)
    await deleteDirectory("/")
    await uploadDirectory("./packages/apps/opendaw/dist", "/")
    await sftp.end()
    const webhookUrl = process.env.DISCORD_WEBHOOK
    if (webhookUrl) {
        console.log("posting to discord...")
        const now = Math.floor(Date.now() / 1000) // in seconds
        const content = `🚀 **openDAW** has been deployed to <https://opendaw.studio> <t:${now}:R>.`
        try {
            const response = await fetch(webhookUrl, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({content})
            })
            console.log(response)
        } catch (error) {
            console.warn(error)
        }
    }
    console.log("deploy complete")
})()
