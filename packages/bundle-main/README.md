# @opendaw/bundle-main

OpenDAW main thread bundle - adapters, boxes, and utilities for web audio applications.

## Overview

This package contains all the main thread components needed to build web audio applications with OpenDAW:

- **Core Libraries**: Standard utilities, DSP functions, box system, runtime, and fusion
- **Studio Components**: Enums, boxes, and adapters
- **Main Thread Safe**: No AudioWorklet components included

## Installation

```bash
npm install @opendaw/bundle-main
```

## Usage

```typescript
import { 
  AudioUnitType,
  RootBoxAdapter,
  AudioBusBoxAdapter,
  // All other main-thread components
} from '@opendaw/bundle-main'

// Use for main thread audio context setup, UI logic, project management
const audioContext = new AudioContext()
// ... your main thread logic
```

## What's Included

- `lib-std` - Standard utilities and helpers
- `lib-dsp` - Digital signal processing functions  
- `lib-box` - Box system for component management
- `lib-runtime` - Runtime utilities
- `lib-fusion` - Data fusion and streaming
- `studio-enums` - Studio enumeration types
- `studio-boxes` - Studio box components
- `studio-adapters` - Audio unit and device adapters

## What's NOT Included

- `studio-worklet` - Use `@opendaw/bundle-worklet` for AudioWorklet components

## Companion Package

Use with `@opendaw/bundle-worklet` for complete AudioWorklet functionality:

```typescript
// Main thread
import { AudioUnitType } from '@opendaw/bundle-main'

// In worklet file
import '@opendaw/bundle-worklet'
```

## License

ISC

## Author

Andre Michelle 