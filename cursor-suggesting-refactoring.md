# Sharing core with riffle project

_Exported on 27/06/2025 at 7:34:02 CEST from Cursor (1.1.6)_

---

**User**

I am looking for a way to share /core with another independent project called riffle. Please do not just modify my code,
instead give me a very brief explanation of your solution first. Everything in /core is under heavy development, so I
like to have a hot compile path to it, meaning every change immediately reloads the browser by vite's own watch/reload
feature. Also, in worklet we have an AudioWorkletProcessor (EngineProcessor.ts), which needs to be loaded. That is now
done by import WorkletUrl from "@core/worklet/EngineProcessor.ts?worker&url" in EngineWorklet.ts
It would be great to keep that mechanism.

---

**Cursor**

I'll help you set up a way to share the `/core` directory with your `riffle` project while maintaining hot reloading and
the AudioWorkletProcessor loading mechanism. Let me first examine your current setup to understand the structure better.

Now I understand your setup! Here's my solution:

## Solution Overview

I'll help you create a **monorepo setup with workspace linking** that allows you to share the `/core` directory with
your `riffle` project while maintaining:

1. **Hot reloading** - Vite will watch and reload changes immediately
2. **AudioWorkletProcessor loading** - The `?worker&url` import mechanism will continue working
3. **Development flexibility** - You can work on both projects independently

## The Approach

1. **Convert to a monorepo** using npm workspaces or yarn workspaces
2. **Create a shared workspace** for the core package
3. **Set up proper package.json configurations** for both projects
4. **Configure Vite aliases** in both projects to point to the shared core
5. **Use symbolic links or workspace references** for development

This way:

- Both projects can import from `@core`
- Changes to core immediately trigger reloads in both projects
- The AudioWorkletProcessor loading mechanism (`?worker&url`) continues working
- You maintain full development independence

Would you like me to proceed with implementing this solution? I'll need to:

1. Set up the workspace configuration
2. Update package.json files
3. Configure Vite for both projects
4. Ensure the AudioWorkletProcessor loading mechanism works

The key insight is that we'll use npm/yarn workspaces to create a proper monorepo structure where both projects can
reference the same core package while maintaining their independence.

