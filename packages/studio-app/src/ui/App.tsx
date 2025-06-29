import {Terminator} from "opendaw-std"
import {createElement, Frag, Router} from "opendaw-jsx"
import {WorkspacePage} from "@/ui/workspace/WorkspacePage.tsx"
import {StudioService} from "@/service/StudioService.ts"
import {ComponentsPage} from "@/ui/pages/ComponentsPage.tsx"
import {IconsPage} from "@/ui/pages/IconsPage.tsx"
import {AutomationPage} from "@/ui/pages/AutomationPage.tsx"
import {SampleUploadPage} from "@/ui/pages/SampleUploadPage.tsx"
import {Footer} from "@/ui/Footer"
import {ManualPage} from "@/ui/pages/ManualPage"
import {ColorsPage} from "@/ui/pages/ColorsPage"
import {Header} from "@/ui/header/Header"
import {AudioInputDevicesPage} from "./pages/AudioInputDevicesPage"
import {ErrorsPage} from "@/ui/pages/ErrorsPage.tsx"
import {ImprintPage} from "@/ui/pages/ImprintPage.tsx"

export const App = (service: StudioService) => {
    const terminator = new Terminator()
    return (
        <Frag>
            <Header lifecycle={new Terminator()} service={service}/>
            <Router
                runtime={terminator}
                service={service}
                fallback={() => (
                    <div style={{flex: "1 0 0", display: "flex", justifyContent: "center", alignItems: "center"}}>
                        <span style={{fontSize: "50vmin"}}>404</span>
                    </div>
                )}
                routes={[
                    {path: "/", factory: WorkspacePage},
                    {path: "/manuals/*", factory: ManualPage},
                    {path: "/imprint", factory: ImprintPage},
                    {path: "/icons", factory: IconsPage},
                    {path: "/components", factory: ComponentsPage},
                    {path: "/automation", factory: AutomationPage},
                    {path: "/errors", factory: ErrorsPage},
                    {path: "/upload", factory: SampleUploadPage},
                    {path: "/audio-input", factory: AudioInputDevicesPage},
                    {path: "/colors", factory: ColorsPage}
                ]}
            />
            <Footer lifecycle={terminator} service={service}/>
        </Frag>
    )
}