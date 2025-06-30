# @opendaw/bundle-worklet

OpenDAW AudioWorklet bundle - complete audio processing worklets for web audio.

## Overview

This package contains ALL components needed for AudioWorklet usage with OpenDAW:

- **Core Libraries**: Standard utilities, DSP functions, box system, runtime, and fusion
- **Studio Components**: Enums, boxes, and adapters  
- **AudioWorklet Processors**: Complete worklet implementations including EngineProcessor
- **Device Processors**: All instrument, audio effect, and MIDI effect processors

## Installation

```bash
npm install @opendaw/bundle-worklet
```

## Usage

**⚠️ IMPORTANT: Use ONLY in AudioWorklet scope**

```javascript
// In your worklet file (e.g., worklet.js)
import '@opendaw/bundle-worklet'

// This automatically registers:
// - 'engine-processor' 
// - 'recording-processor'
// - 'peak-meter-processor'
// - All device processors
```

**Main thread usage:**
```javascript
// Main thread (app.js)
const audioContext = new AudioContext()

// Load the worklet
await audioContext.audioWorklet.addModule('./worklet.js')

// Create the engine processor node
const engineNode = new AudioWorkletNode(audioContext, 'engine-processor', {
  processorOptions: { /* your config */ }
})
```

## Companion Package

Use with `@opendaw/bundle-main` for main thread functionality:

```javascript
// Main thread
import { AudioUnitType, RootBoxAdapter } from '@opendaw/bundle-main'

// AudioWorklet
import '@opendaw/bundle-worklet'
```

## What's Included

- All components from `@opendaw/bundle-main` 
- `studio-worklet` - Complete AudioWorklet processor implementations
- Automatic processor registration for EngineProcessor and device processors

## License

ISC

## Author

Andre Michelle 