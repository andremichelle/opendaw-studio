// AudioWorklet bundle for @opendaw/bundle-worklet
// Contains ALL components needed for AudioWorklet usage
// USE ONLY IN AUDIOWORKLET SCOPE

// Core libraries needed by worklets
export * from "lib-std"
export * from "lib-dsp" 
export * from "lib-box"
export * from "lib-runtime"
export * from "lib-fusion"

// Studio packages needed by worklets
export * from "studio-enums"
export * from "studio-boxes"
export * from "studio-adapters"

// Export ALL studio-worklet components (including EngineProcessor registration)
export * from "studio-worklet"