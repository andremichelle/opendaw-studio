# openDAW Studio

**openDAW** is a next-generation web-based Digital Audio Workstation (DAW) designed to **democratize** music production
and to **resurface the process of making music** by making **high-quality** creation tools accessible to everyone, with
a strong focus on **education** and hands-on **learning**.

![image](packages/studio-app/public/images/meta.jpg)

For more information about our mission and goals, please join our [Discord](https://discord.opendaw.studio/), visit
our [official website](https://opendaw.org) and test our current [prototype](https://opendaw.studio/). Please consider
supporting this project on [Patreon](https://www.patreon.com/join/openDAW) or [ko-fi](https://ko-fi.com/opendaw).

## Goals

### Planned Features

- **Offline Version**: A downloadable version that you own.
- **Educational Resources**: Access tutorials and guides to enhance your music production skills.
- **Best Data-Protection**: Store your data locally, on your server or a service you trust.
- **Modular Systems**: Create and share your own devices and tools to extend the built-in feature-set.
- **Collaborative Tools**: Work seamlessly with others in real-time.

### Built on Trust and Transparency

**openDAW stands for radical simplicity and respect.**

- **No SignUp**  
- **No Tracking**  
- **No Cookie Banners**  
- **No User Profiling**  
- **No Terms & Conditions**  
- **No Ads**
- **No Paywalls**  
- **No Data Mining**

**Just a free, open-source DAW in your browser.**

## Links

* [Discuss openDAW on Discord](https://discord.opendaw.studio)
* [Support openDAW on Patreon](https://www.patreon.com/join/openDAW)
* [Support openDAW on ko-fi](https://ko-fi.com/opendaw)
* [More information on opendaw.org (website)](https://opendaw.org)
* [Test the latest official built on opendaw.studio (prototype)](https://opendaw.studio)

## Code Philosophy

### Introduction:

* We deliberately pass on UI frameworks like React to maintain full control over rendering and behavior. This avoids
  unnecessary abstractions, reduces overhead and lets us tailor the interface precisely to the needs of a real-time
  audio environment. openDAW uses [JSX](https://en.wikipedia.org/wiki/JSX_(JavaScript)).
* openDAW is **environment-agnostic** - The codebase must run either as a self-contained desktop
  application or from any standard web server; cloud features are optional and only activate when the user asked for it
  and supplies their own credentials.
* Nothing about the surrounding platform can be taken for granted. Every component is built to be maximally independent
  and lazy-loaded only when first needed, keeping the studio launch time under one second.

### How We Write Code:

* Do not panic!
* Write code for the task, not for eternity.
* Always write self-documenting code if possible.

### Code Style:

* Methods that contain only trivial getters or setters are kept on a single line to minimize scrolling through
  low-signal code.
* Crucial functionality is implemented at a lower level with well-tested classes, while the UI layer is primarily
  scripted.
* Excessive abstraction can harm both readability and scalability, so layers are added only when they clearly pay for
  themselves.
* Rule of thumb: when a method requires more than three parameters, bundle them into a dedicated argument object.

### What We Are Looking For:

1. **Offline desktop build (e.g., via Tauri) or a standalone installable PWA** — offer offline capability.
2. **Cloud-agnostic project storage** — a facade layer that lets users plug in different cloud services (e.g., Drive,
   S3, Dropbox) for projects and sample libraries.
3. **Live remote collaboration** — real-time session sharing and sync so multiple users can edit the same project
   concurrently.
4. **AI manual assistant** — an embedded agent that answers context-aware questions and guides users through features as
   they work.
5. **AI-powered stem splitting** — integrated source-separation to extract vocals, drums and other stems directly
   inside the DAW.
6. **Import and Export** - Contribute every possible file format IO

### Libraries:

openDAW tries to avoid external libraries and frameworks. Following is a list of the internal core libraries and their
dependencies.

| Library       | Dependencies                        |
|---------------|-------------------------------------|
| **std**       | none                                |
| **dsp**       | std                                 |
| **dom**       | std                                 |
| **jsx**       | std, dom                            |
| **runtime**   | std                                 |
| **box**       | std, dom, runtime                   |
| **box-forge** | std, dom, box                       |
| **fusion**    | std, dom, box, runtime (all peered) |

This is a list of the external libraries we currently use in the web studio:

* [jszip](https://www.npmjs.com/package/jszip) (for openDAW project bundle file)
* [markdown-it](https://www.npmjs.com/package/markdown-it) + [markdown-it-table](https://www.npmjs.com/package/markdown-it-table) (for help pages)

### Prepare, Clone, Install and Run

Before starting, ensure you have the following installed on your system:

- [Git](https://git-scm.com/) is required for cloning the repository and managing submodules.
- [mkcert](https://github.com/FiloSottile/mkcert#installation) is required to create a certificate for developing with
  https protocol.
- [Node.js](nodejs.org) version **>= 23**. This is necessary for running the development server and installing
  dependencies.
- [Sass](https://sass-lang.com/) While Sass is handled internally during the development process, you will need to
  ensure you have the
  binaries available in your environment if used outside the build system.
- [TypeScript](https://www.typescriptlang.org/)
- [OpenSSL](https://chocolatey.org/) For generating local development certificates (), OpenSSL needs to be installed on
  your system. Most Linux/macOS systems have OpenSSL pre-installed.

#### 1. Clone (once)

`git clone --recurse-submodules https://github.com/andremichelle/opendaw-studio.git && cd opendaw-studio`

#### 2. Generate local certificates (once)

`npm run cert`

#### 3. Clean & Install & Rebuild the entire project (once)

`npm run build`

#### 4. Start the development server

`npm run web` – open the printed URL `https://localhost:8080`

## Dual-Licensing Model

openDAW is available **under two alternative license terms**:

| Option                    | When to choose it                                                                                              | Obligations                                                                                                                                                                      |
|---------------------------|----------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **A. GPL v3 (or later)**  | You are happy for the entire work that includes openDAW to be released under GPL-compatible open-source terms. | – Must distribute complete corresponding source code under GPL.<br>– Must keep copyright & licence notices.<br>– May run openDAW privately in any software, open or closed (§0). |
| **B. Commercial Licence** | You wish to incorporate openDAW into **closed-source** or otherwise licence-incompatible software.             | – Pay the agreed fee.<br>– No copyleft requirement for your own source code.<br>– Other terms as per the signed agreement.                                                       |

> **How to obtain the Commercial License**  
> Email `andre.michelle@opendaw.org` with your company name, product description and expected distribution volume.

If you redistribute openDAW or a derivative work **without** a commercial license, the GPL v3 terms apply automatically.

## License

[GPL v3](https://www.gnu.org/licenses/gpl-3.0.txt) © 2025 André Michelle
