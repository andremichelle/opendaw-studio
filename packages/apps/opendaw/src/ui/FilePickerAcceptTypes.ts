export namespace FilePickerAcceptTypes {
    export const WavFiles: FilePickerOptions = {
        types: [{
            description: "wav-file",
            accept: {"audio/wav": [".wav"]}
        }]
    }
    export const ProjectSyncLog: FilePickerOptions = {
        types: [{
            description: "openDAW sync-log-file",
            accept: {"application/octet-stream": [".odsl"]}
        }]
    }

    export const ProjectFileType: FilePickerAcceptType = {
        description: "openDAW project",
        accept: {"application/octet-stream": [".od"]}
    }

    export const ProjectBundleFileType: FilePickerAcceptType = {
        description: "openDAW project bundle",
        accept: {"application/octet-stream": [".odb"]}
    }
}