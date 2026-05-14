# IDRS: Integrated Disaster Response System

Most disaster systems fail because they treat data as a static asset. In a high-stakes urban environment like Chennai, data is a decaying variable. If your mapping engine lags by 500ms or your ID-matching logic misses a type-cast, people stay stranded. IDRS isn't a map; it's a state-driven coordination engine.

## The Core Problem: Situational Blindness
Everyone talks about "real-time dashboards," but the real problem is data density vs. cognitive load. A commander doesn't need 1,000 dots; they need a validated truth layer and a path of intent. We built this to move past the "visual filler" stage and into functional tactical awareness.

## System Architecture

### 1. Tactical Command Nexus (Obsidian Protocol)
The Command Center is built on MapLibre-GL, but the heavy lifting is in the state management. 
*   **Coordinate Interpolation**: Rescue units (AS-01, AS-02) don't just jump; they glide. We implemented a 100ms interpolation loop that calculates the delta between current asset position and the target SOS coordinate.
*   **Type-Safe Dispatch**: We struggled through the edge cases of numeric vs. string IDs in the SOS queue. The fix was a unified string-casting protocol that ensures a dispatcher's click translates to a hardware-lock instantly.
*   **Collision-Aware Symbols**: Using SVG layers instead of basic markers to ensure that in high-density zones, the labels remain readable. Clarity is a functional requirement, not an aesthetic choice.

### 2. Gemini AI Intelligence Layer
We aren't using an LLM to "chat." We are using Gemini 2.5 Flash as a tactical inference engine.
*   **Reasoning under Pressure**: The system pipes live SOS messages and alert headlines into a structured prompt. The output isn't prose—it's a JSON-mapped tactical evaluation. 
*   **Rule-Based Fallback**: If the API latency spikes, the system falls back to local rule-based heuristics. You never leave a commander with a loading spinner during a critical event.

### 3. Personal Citizen Nexus (Voyager Protocol)
The citizen side is about reducing friction during panic.
*   **High-Accuracy GPS Handshake**: Standard geolocation is too slow. We forced `enableHighAccuracy: true` with a 5-second hard timeout. If the GPS lock fails, we snap to the nearest command hub. No hanging states.
*   **Geospatial Sync**: The map view state is reactively bound to the device coordinates. The moment the hardware confirms a location, the map re-centers and zooms to Level 13.
*   **Hyper-Local Weather**: We stopped using static city weather. The weather engine now queries the specific lat/lon of the device, providing street-level atmospheric data.

## Implementation Reality
*   **Frontend**: React 18 + Framer Motion. We used Framer not for "animations," but to handle the complex entry/exit states of the tactical panels without blocking the main thread.
*   **Backend**: FastAPI. Low-overhead Python was necessary for the rapid ingestion of NDM/Sachet alert streams.
*   **The Interception Logic**: The `autoDeploy` function matches idle units to unassigned SOS points based on priority score, not just proximity. In a flood, "nearest" doesn't always mean "fastest."

## Hard Conclusions
Building this taught us that aesthetics are secondary to reliability. A pretty dashboard that crashes when the SOS queue hits 50 items is useless. We optimized the rendering pipeline to handle high-density symbol layers while maintaining a 60fps interaction rate on the map.

Execution > Concept.

---
Build: v4.2.0-Tactical
Status: Operational
Location: Greater Chennai Sector
