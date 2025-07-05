# Development

## TODO

* PianoModePanel
    * Show timeline navigation?
    * Different note labels for different countries (Global Switch)
    * ~~dialog? to disable note tracks~~
    * ~~Control to show and edit signature~~
    * ~~Scroll Y should change engine position (FW, RW)~~
    * ~~Rename to PianoModePanel~~
    * ~~Transpose~~
    * ~~Go back to the timeline view~~
    * ~~Open MidiFall view (or Piano Tutorial Mode?)~~
    * ~~labels on falling notes (~~Hide when note is too short~~ clip)~~
    * ~~control to adjust visible time range~~
    * ~~active piano colors~~
    * ~~different keyboard layouts https://familypiano.com/blog/piano-keys-faq/~~
    * ~~time signature / octave (C, F) grid~~
* ~~Playfield bug: Samples appear louder when polyphone~~
* Attach a CurveBox to ValueEventBox (enables having different curve shapes in future)
* Make effect-bypass parameter automatable
* Add SoundFont device
* Polish audio playback -> will have unwanted sounds when start/stop audio segments
* AcceptingType for audio-unit should be a set?
* Admin sample management (rename, edit, delete)
* Do not use an unknown track for busses. This must be handled by the timeline view.
* https://bungee.parabolaresearch.com/
* Audio/Midi Recording
    * Solid state for recording in main-thread (none, running, cancel, abort)
    * Listen to all incoming midi-signals and create track, region, notes and automation (revertible process)
    * Record audio to memory and create track and region (revertible process)
    * Preview / update peaks
    * ~~Count in~~
    * ~~Global shuffle~~
    * ~~Midi generator effects should continue to run when transport is stopped~~
    * ~~Time-Manipulation Midi-Effects~~
        * ~~clamp pitch 0-127~~
        * ~~release notes when changing midi effect chain~~
        * ~~release notes when pausing~~
        * ~~Sending notes to broadcaster~~
        * ~~Revive regions/clips~~
        * ~~groove unipolar (percentage)~~
        * ~~Replace event-targets with NoteEventSource~~
        * ~~NoteEvent~~
            * ~~Remove chance, playCount, playCurve (not needed in processing)~~
* Playfield
    * ~~Panics when replacing synth with Playfield and undo~~
    * ~~Remember~~
        * ~~sample in edit mode~~
        * ~~octave index~~
        * ~~cache editor~~
    * Fix envelope (not in prototype)
    * Fix loop discontinuations with fades (not in prototype)
    * Update start & end while playing (not in prototype)
    * ~~Reset Playfield and delete samples~~
    * ~~Automation~~
    * ~~Exclusion group~~
    * ~~Gate-mode selector (Off, On, Loop)~~
    * ~~Monophone / Polyphone switcher~~
* Stereo Tool
    * Stereo Widthing is not really working (not in prototype < no easy fix)
    * ~~Interpolate matrix~~
    * ~~swap channels~~
* PointerLock Api
* Midi Pitch-bend
* List all midi connections and edit (range, remove, etc..)
* Name constraints (min, max)
* Find a modifier key to always select
* Offline Tauri version
* Offline PWA version
* studio header > peak-meter
* peak-meter > hold-value | rms < PeakBroadcaster
* Implement presets for devices and complete device-chain
* Preview midi notes (https://discord.com/channels/1241019312328675399/1337837099302391849)
* Different schedule switch-times for clips
* Double-click the input name in the track-header to rename
* [kurp] Making region bounds in content-editor fully operational
* Timeline navigation in other workspace views (mixer)
* Spotlight
* Flatten ValueRegion
* Flatten AudioRegion
* Absolute time display
* Pre- & Post-gain FX / Gain-stage

### Optimisation

* Only produce and stream values in the audio-engine if there is a visible consumer in the user-interface

### Misc Bugs

* Setting a pointer to two different targets in one modification breaks undo

### Panel Management

* Resizers are only working on the adjacent elements.
* Resizers do not open/close panels while dragging to increase/decrease space
* Resizers on min-size and max-size should remember their size in pixels, not flex (example: Browser).
* No indicator that a panel reached min- or max-size
* Switching screen will rebuild ALL panels (should be reused if the screen contains the same panel-states)

## Done

* ~~Learn Midi Device~~
    * ~~Keys~~
    * ~~Control~~
    * ~~Store midi connections and reload when loading project~~
    * ~~Copy on 'Save As'~~
* ~~DEL to delete track~~
* ~~Having extra space to drop new content below tracks~~
* ~~Long labels can blow layouts~~
* ~~Table of contents for manual~~
* ~~Reset Parameter Option~~
* ~~Piano Roll: Velocity represented by Opacity~~
* ~~Auto-scroll on text-element~~
* ~~List local projects in dashboard~~
* ~~Bake colours and remove filter~~
* ~~Audio Output Device Selector~~
* ~~Choose region color hue~~
* ~~[kurp] Creating notes and value-nodes should appear on the second pointer-down not release~~
* ~~Change song length~~
* ~~Changing hash in url throws error~~
* ~~checkboxes do not show automated state~~
* ~~Note Editor Properties are not editible anymore~~
* ~~[Polarity] Simple Sampler~~
* ~~[kurp] arrow keys do not do anything~~
* ~~Add description, tags and cover to project's metadata~~
* ~~Add new effect to chain (right to the instrument or last device)~~
* ~~Move audio-units within bounds~~
* ~~Drag'n'drop devices in chain~~
* ~~Add message to error handler to deactivate extensions~~
* ~~Recovery Mode~~
* ~~Drag & Drop inside app to create and sort~~
* ~~[Polarity] Add + button to create a tape and add a sample in one go~~
* ~~[razcore-rad] Revamp EQ-enable control has no automation menu~~
* ~~Update Manual with shortcuts (like undo/redo & scissor)~~
* ~~[razcore-rad] Dropdown triangle (note editor > property selector)~~
* ~~Value-Clips~~
* ~~When deleting samples check existing projects, if they will break~~
* ~~Waiting state not working on clips when starting column~~
* ~~Follow playback cursor~~
* ~~List selection~~
* ~~Multiple samples dragging into the timeline (changed to context-menu)~~
* ~~Show Playback-Timestamp indicator~~
* ~~Converting clip to region~~
* ~~Midi Transposing (https://discord.com/channels/1241019312328675399/1337836390628462614)~~
* ~~Sample Preview~~
* ~~Show insert marker when adding sample~~
* ~~Ask for replacement for deleted or incomplete local samples~~
* ~~Drag mulitple files~~
* ~~Change name & bpm for samples~~
* ~~Drag & Drop Files directly onto the timeline~~
* ~~Import custom samples~~
* ~~Parameter-Knob has too many control state indicators~~
* ~~Show clip-area when new clip is added (e.g. convert to clip)~~
* ~~Import / Export zip-package~~
* ~~[Coral] Killing all buffers (on stop) can still reintroduce feedback out of the blue when delay has 100% fb~~
* ~~[Jetdarc] Missing automation state for channelstrips controls (track & timeline)~~
* ~~[2L&L] Possible to create a region with negative position~~
* ~~[Polarity] Seen that an automation on Revamp (freq) were not updating the curve~~
* ~~[Jetdarc] Apparently you can set the bpm to 9999999~~
* ~~[raii] Selected notes with higher pitch are not captured with higher priority~~
* ~~[Polarity] search sample names within the string not just the beginning~~
* ~~[Polarity] Sample Browser Search~~
* ~~Implement Clips DSP~~
    * ~~Better visual state for playing clips (hard to distinguish from non-playing clips)~~
    * ~~Drag sample on clip-area~~
    * ~~One-shot playback~~
    * ~~Do not allow dropping clips on mismatching track~~
    * ~~Double stop must stop all playing clips~~
* ~~[kurp] 0% in gain mapping is not silent~~
* ~~[kurp] overlapping region when creating in too smaller gaps~~
* ~~ADD Donation Link!~~
* ~~Show Update Banner~~
* ~~Wav-Preview in sample-browser (better than nothing)~~
* ~~[kurp] Always play from the last *set* position~~
* ~~swap devices in chain~~
* ~~_Cannot have panel open in multiple location_ when adding a hash to url~~
* ~~[Truls] Playing notes from the piano-roll~~
* ~~[Truls] Restart audio-engine if errored out~~
* ~~Export must open FileDialog with a new user-interaction (security issue)~~
* ~~[Truls] When the play head is moved during playback, playing notes should be released~~
* ~~[Truls] note region preview is a little unpredictable for short notes~~
* ~~Solution for output device chain automation in timeline~~
* ~~Option to auto open content editor when the region is already in edit-mode~~
* ~~[Truls] Channelstrip at the end of the device-chain~~
* ~~[Truls] ValueRegionEditor does not allow dragging loop-duration~~
* ~~ValueRegion must hold value when ended~~
* ~~Channelstrip text overflow fix~~
* ~~Select new region after flatten~~
* ~~Indices of AudioUnits can be broken after deletion~~
* ~~Error handling like Sentry~~
* ~~Still something wrong with the track indices~~
* ~~ArpeggioDeviceProcessor & PitchDeviceProcessor UpdateClock~~
* ~~Kill all buffers and reset all devices on double-stop~~
* ~~Delete Bus (2 channels without output) > Create new output > ERROR (dub-techno)~~
* ~~Create a test all pointer targets entry in app-menu for debugging~~
* ~~Proper solution for ordering instrument and bus tracks~~
* ~~Allow F12 & Reload with modal dialogs~~
* ~~Minimized device version (collapse)~~
* ~~Check audio-unit "bus" behaviour in timeline (creates an empty track)~~
* ~~The content-editor does not show its scroller (no much content in header)~~
* ~~Label has "unassigned" in ValueHeader and missing in track header~~
* ~~Automation track are not being deleted when deleting the device~~
* ~~DelayDeviceProcessor cross missing~~
* ~~Show control state on revamp ui~~
* ~~Introduce mapping in ValueTrackHeader~~
* ~~Show format value in ValueTrackHeader~~
* ~~Make the ProjectInfo page nicer too~~
* ~~Make Revamp parameters automatable~~
* ~~No modular views available should be nicer~~
* ~~'Finish' Revamp DSP (BiquadStack order)~~
* ~~Disable track~~
* ~~Keyboard Shortcut for Play/Pause at least~~
* ~~'Finish' Delay DSP > Filter~~
* ~~'Finish' Vaporisateur DSP > Bandlimited Osc?~~
* ~~Make this part of the running studio: https://localhost:8080/issues~~
* ~~Channelstrip Solo~~
* ~~[BUG] Index on delete audio-unit seems to be wrong (optic glitch)~~
* ~~Load Midi~~
* ~~'Finish' sample management (cache)~~
* ~~Audio region drag-preview in timeline~~
* ~~Create Tape if sample is dropped below tracks~~
* ~~Do we need TrackAssignmentBox for anything other than value-automation?~~
* ~~Audio region drag > clip~~
* ~~Connect all(?) AudioFileBoxes to RootBox~~
* ~~Either make Clips working fully or hide them~~
* ~~Default color region type~~
* ~~Do not allow dropping regions on different track types~~
* ~~Pimp dashboard~~
* ~~Pimp publish page~~
* ~~Progress dialog~~
* ~~Implement 'enabled' for effects (bypass)~~
* ~~Device icon colers~~
* ~~No cut-indicator when outside region~~
* ~~Play many audio-tracks~~
* ~~Fix audio region split~~
* ~~Create new track for audio-unit (note or audio, depending on type)~~
* ~~Temp remove tape parameter controls~~
* ~~Simple dialog layering~~
* ~~Revamp DSP~~
* ~~ValueTrackHeader~~
* ~~Export2wav~~