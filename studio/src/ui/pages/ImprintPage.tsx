import css from "./ImprintPage.sass?inline"
import {createElement, PageContext, PageFactory} from "jsx"
import {StudioService} from "@/service/StudioService.ts"
import {Html} from "dom"
import {Colors} from "@/ui/Colors.ts"

const className = Html.adoptStyleSheet(css, "ImprintPage")

export const ImprintPage: PageFactory<StudioService> = ({}: PageContext<StudioService>) => (
    <div className={className}>
        <h1>Imprint</h1>
        <h3>In accordance with § 5 TMG (German Telemedia Act)</h3>
        <h4>Responsible for content:</h4>
        <p>
            <span style={{color: Colors.cream}}>André Michelle</span><br/>
            <span style={{color: Colors.dark}}>Cologne, Germany</span><br/>
            Email: <a style={{color: Colors.blue}} href="mailto:hello@opendaw.org">hello@opendaw.org</a>
        </p>
        <p>
            This website is a personal, non-commercial project.<br/>
            <span style={{color: Colors.red}}>No tracking, no data collection, no user accounts.</span>
        </p>
        <p>
            This imprint is provided to comply with German law.<br/>
        </p>
        <p>
            For inquiries regarding openDAW, please use the contact above or visit <a style={{color: Colors.blue}}
                                                                                      href="https://opendaw.org">opendaw.org</a>
        </p>
    </div>
)