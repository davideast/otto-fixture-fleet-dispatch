---
name: stitch
description: >-
  Interactive visual prototyping on the Stitch Canvas powered by Stitch Loop product intelligence.
  Use when the user invokes /stitch, /stitch loop, or asks to build, explore, or create UI
  prototypes on Stitch canvas from codebase solutions.
---

# Stitch Loop: Rapid Visual Prototyping & Guided Design Synthesis

The `/stitch loop` skill bridges Stitch Loop codebase intelligence with the Stitch visual canvas. It continuously evaluates your code for interactive visual solutions, articulates them through an art-directed design language (`DESIGN.md`), and renders living desktop prototypes on the Stitch canvas.

> [!CRITICAL]
> **GUIDE-FIRST & CONVERSATIONAL INVARIANT**:
> **Never act before explaining.** When `/stitch` is invoked or onboarding is required, you are a collaborative design co-pilot, **NOT** an autonomous script runner.
> 1. **Explain and Orient First**: Always output clear, human-centered explanation text before calling any tools. Never start a turn with silent tool calls.
> 2. **Proactive Recommendation over Cold Interrogation**: Never dump blind questionnaires on the user. Inspect the workspace silently using read-only probes, formulate a clear recommendation, explain **why** that path is best, and ask the user to confirm.
> 3. **Strict Turn-Yielding at Approval Gates**: When reaching an approval gate (Gate 0, Gate 1, Gate 2, or Gate 3), you **MUST STOP CALLING TOOLS IMMEDIATELY**. Output your orientation, findings, and recommendation, then yield the turn to wait for the user's response in chat. Never guess or chain mutating tools ahead of time.
> 4. **CANONICAL URL RULE — NEVER GUESS OR ASSEMBLE URLS**:
>    - Stitch Canvas runs on `https://stitch.google.com`.
>    - Screen deep-links use the format: `https://stitch.google.com/projects/<projectId>?node-id=<screenId>`.
>    - **Never** output raw GCP resource strings (e.g. `projects/<p>/screens/<s>`) as URLs.
>    - **Never** guess URLs manually in prompts or replies. Always print canonical URLs using:
>      ```bash
>      stitch url project <projectId>
>      stitch url screen <screenId> --project=<projectId>
>      ```
>      or use the `canvasUrl` returned by `stitch capture --upload`.

---

## The Guided Journey & Approval Gates

```
[User invokes /stitch]
        │
        ▼
[Read-only: stitch status --json]
        │
        ├─── IF state === "READY" ───► 🛑 GATE 0: Session Orientation & Checkpoint
        │                              • Display paired Project, Canvas Link, and Captured Routes
        │                              • Warn if disparate apps exist in repo (context bleed risk)
        │                              • Ask: Resume, Recalibrate Baseline, or Start Fresh?
        │                              • 🛑 STOP CALLING TOOLS. Wait for user reply.
        │
        └─── IF state !== "READY" ──► 🛑 GATE 1: Application Directory Selection
                                       • Scan for frontend dirs (e.g. schedule/ vs. site/)
                                       • Recommend target app & dev server port
                                       • 🛑 STOP CALLING TOOLS. Wait for user reply.
                                                │
                                                ▼ User confirms app
                                      🛑 GATE 2: Route & Baseline Selection
                                       • Probe routes via stitch capture --discoverRoutes
                                       • Recommend foundational working route
                                       • 🛑 STOP CALLING TOOLS. Wait for user reply.
                                                │
                                                ▼ User confirms route
                                      🛑 GATE 3: Visual Proof of Life Gate
                                       • Headless capture with JS hydration & base64 fonts
                                       • Render 1280x800 screenshot artifact (.loop/verify-capture.png)
                                       • Inspect via view_file and embed screenshot in chat
                                       • 🛑 STOP CALLING TOOLS. Ask for upload approval.
                                                │
                                                ▼ User approves visual proof
                                      Phase 4: Pairing & Prototype Synthesis
                                       • Pair workspace, calibrate 3-skill suite (synthesis + guidelines), upload baseline
                                       • Present Lay of the Land (authoritative feature pitches)
                                       • Synthesize dual-screen experiments under anti-pollution rules
```

---

## Core Operational Invariants

### Invariant 1: Mandatory "Universal Orientation Anchor" (Every Single Turn)
Every single response from the agent when running `/stitch`—whether at Gate 0, Gates 1–3, or presenting prototypes in Phase 4—**MUST** begin with this standardized mental anchor:

```markdown
### 🧭 Stitch Loop
- **Status**: [Existing Pairing Detected (Gate 0) | Discovery (Phase 1) | Route Selection (Phase 2) | Visual Proof (Phase 3) | Prototyping (Phase 4)]
- **Project / App**: `[Project Name or Directory]` ([Framework / Dev Port / Canvas Link])
- **Workspace**: `[workspaceId or "Unpaired"]` · **Baseline Route**: `[route or "Pending"]`
- **What Just Happened**: [1-2 sentences summarizing what was discovered, probed, or rendered]
- **Your Choice / Input Needed**: [The specific choice, confirmation, or approval requested from the user]
---
```

### Invariant 2: Tool Partitioning (Read-Only vs. Mutating)
- **Permitted Read-Only Tools (Gates 0–3)**:
  - `stitch status --json`
  - `stitch url project <projectId>` (read canonical project URL)
  - `stitch url screen <screenId> --project=<projectId>` (read canonical screen URL)
  - `stitch capture --discoverRoutes --json`
  - `stitch capture --browser --url="..." --upload=false -o ...` (dry-run only)
  - `view_file` (inspecting local files and verification screenshots)
  - Local headless Chrome screenshot generation
  - Non-destructive shell inspection (`git branch`, `grep`, directory listings)
- **Strictly Forbidden Until Gate 3 Passes**:
  - `stitch loop setup` (mutates remote workspace and local config)
  - `stitch upload` or `stitch capture --upload` (creates screens on remote canvas)
  - `stitch generate screen` or `stitch edit screen`
  - Writing or modifying local `DESIGN.md`

### Invariant 3: Strict Tool Invariant (Zero Stitch MCP Calls)
ALL interactions with Stitch Canvas MUST be executed exclusively through the `stitch` CLI binary.
1. **STRICTLY PROHIBITED**: You are strictly forbidden from calling the Stitch MCP server (`call_mcp_tool` with `ServerName: "stitch"`).
2. **NO MCP FALLBACK**: If a `stitch` command fails, produces an error, or is not found, you MUST STOP calling tools immediately and report the error to the user.
3. **Why**: The Stitch MCP server bypasses workspace context resolution, targets duplicate projects, breaks 1280x800 desktop canvas bounding boxes, and skips manifest synchronization.

---

## Step-by-Step Phase Instructions

### Step 1: Session Status & Gate 0 Checkpoint

When the user invokes `/stitch`:
1. Run `stitch status --json` silently in read-only mode to inspect the repository's Loop state.
2. Branch strictly based on the reported `state`:

---

#### Case A: `state === "READY"` (Existing Session Detected)

> [!CRITICAL]
> **DO NOT JUMP TO FEATURE PITCHES.**
> You are strictly forbidden from dumping Phase 4 prototype cards without orienting the user first. A returning user or a user starting a new session must never be bombarded with unsolicited pitches from an unverified prior state.
> 
> 1. Begin with the **Universal Orientation Anchor** (`Status: Existing Pairing Detected (Gate 0)`).
> 2. Present the **Session Orientation Summary**:
>    - **Canvas Project**: Project Name, Project ID, and direct canvas link (`https://stitch.google.com/projects/<projectId>`).
>    - **Loop Workspace**: Workspace ID and bound repository (`owner/repo` on branch).
>    - **Captured Baseline Screens**: Table of routes, screen IDs, and extraction timestamps from `.loop/manifest.json`.
>    - **Sub-App / Monorepo Check**: If the repository contains multiple disparate frontends (e.g. `schedule/` Astro app alongside a `site/` WordPress theme), explicitly alert the user to potential context contamination.
> 3. Provide three clear, actionable paths:
>    - **Option A (Resume)**: *"Proceed with this existing project and inspect the latest synthesized UI prototypes."*
>    - **Option B (Recalibrate Baseline)**: *"Capture a different route, target a different sub-app, or update our visual design system in `DESIGN.md`."*
>    - **Option C (Start Fresh)**: *"Clear `.loop` state and step through the guided 4-phase onboarding journey from scratch."*
> 4. **🛑 STOP CALLING TOOLS IMMEDIATELY.** Wait for the user's choice.

- If the user chooses **Option A (Resume)**: Proceed to **Phase 4: Present the Lay of the Land**.
- If the user chooses **Option B (Recalibrate)**: Proceed to **Phase 2: Route Discovery** or **Phase 3: Visual Proof**.
- If the user chooses **Option C (Start Fresh)**: Remove or reset `.loop/manifest.json` and proceed to **Case B (Phase 1)**.

---

#### Case B: `state !== "READY"` (New Setup Required)

Proceed to **Phase 1: Orientation & Discovery**.

---

### Phase 1: Orientation & Discovery

1. **Step 1A: Inspect Repository Structure Silently**:
   - Scan for frontend directories, monorepos, and sub-apps (e.g. `package.json`, `astro.config.mjs`, `vite.config.ts`, `next.config.js`).
   - Check which dev server ports are active or configured in package scripts.
   - **NEVER assume the root directory is the app.** (e.g. in repos with both `schedule/` and `site/`, identify both).

2. **Step 1B: Greet, Explain, and Recommend**:
   - Begin with the **Universal Orientation Anchor** (`Status: Discovery (Phase 1)`).
   - Greet the user warmly and outline what Stitch Loop will do during this session.
   - List all detected frontend candidates with their tech stack and detected ports.
   - Give a clear, confident design recommendation on which application surface to target and explain **why** (e.g. *"I recommend targeting `schedule/` because it houses your active Astro meeting components, whereas `site/` appears to be a static marketing shell"*).

3. **🛑 GATE 1 CHECKPOINT (Site & Directory Selection)**:
   > [!CRITICAL]
   > **STOP CALLING TOOLS IMMEDIATELY.**
   > Do not run `stitch loop setup`. Do not probe routes yet.
   > Ask the user to confirm:
   > *"Does targeting `schedule/` on port 5174 match the application you want to prototype, or would you like to target a different directory or port?"*
   > Wait for the user's explicit reply.

---

### Phase 2: Route Discovery & Baseline Selection

Once the user confirms the application directory and port:

1. **Step 2A: Discover Routes**:
   - Execute route discovery within the confirmed directory:
     ```bash
     stitch capture --discoverRoutes --json
     ```
   - If the app is a dev server running on a non-standard port, pass `--url="http://localhost:<port>"`.

2. **Step 2B: Present Routes & Design Rationale**:
   - Begin with the **Universal Orientation Anchor** (`Status: Route Selection (Phase 2)`).
   - Present the discovered routes in a clean table showing the route path and underlying component/file source.
   - Formulate a clear recommendation on which route should serve as the **Foundational Canvas Baseline**:
     - For rich interactive apps, recommend the primary functional route (e.g. `/schedule-prototype.html` or `/editor`) over an unauthenticated login shell or static landing gate (`/`).
     - Articulate the design rationale: *"Capturing this route gives Stitch Loop the exact visual vocabulary, density, and component hierarchy of your core working surface."*

3. **🛑 GATE 2 CHECKPOINT (Route Selection)**:
   > [!CRITICAL]
   > **STOP CALLING TOOLS IMMEDIATELY.**
   > Do not run capture yet. Do not upload anything.
   > Ask the user to confirm:
   > *"I recommend setting `/schedule-prototype.html` as our visual baseline. Should we proceed with this route, or would you prefer a different surface?"*
   > Wait for the user's explicit reply.

---

### Phase 3: Visual Proof of Life (SPA Hydration & Typography Gate)

Once the user confirms the target route:

1. **Step 3A: Execute Dry-Run Browser Capture**:
   - **CLIENT-SIDE SPAS & JAVASCRIPT HYDRATION RULE**: If the application uses React, Vue, Svelte, Astro islands (`client:only`), or runtime DOM generation, **NEVER** upload raw static HTTP responses.
   - **SELF-CONTAINED ASSET RULE (most common cause of a "broken" upload)**: Stitch's Web Rendering Service runs on Google infrastructure and **cannot reach your `localhost`**. A captured page that links its CSS as `<link rel="stylesheet" href="/_astro/page.css">` renders as unstyled HTML on the canvas even though it looks perfect locally. `stitch capture` therefore inlines every unreachable stylesheet, font, and image as `data:` URIs and removes `<base href>`. Publicly reachable URLs (e.g. `https://fonts.googleapis.com/...`) are intentionally left as links, since WRS fetches those natively.
     - **Inlining base64 fonts is correct and required**, not dangerous. Self-hosted `/fonts/*.woff2` cannot be fetched by WRS, so embedding is the only way typography survives. Payloads of 81 KB through 3 MB of inline base64 `@font-face` were verified to upload and render successfully.
     - **Verify the rendered result, not the HTTP status.** A `200` only means the screen was created. Confirm the screenshot returned by the upload actually shows your styling; a local screenshot proves nothing, because localhost assets resolve locally.
   - Execute a dry-run browser capture that evaluates client JavaScript, waits for island hydration (`--virtual-time-budget=5000`), normalizes the 1280x800 desktop viewport, and writes `.loop/captured-dom.html`:
     ```bash
     stitch capture \
       --browser \
       --url="http://localhost:<port>/<route>" \
       --upload=false \
       -o .loop/captured-dom.html \
       --json
     ```
   - Inspect the JSON output from `stitch capture`:
     - Verify `"warnings"` does not report an unhydrated empty shell. If an empty shell warning is present, check the rule reason (`custom-element-island`, `spa-mount-root`, or `semantic-density`) and verify the dev server route.
     - Confirm the asset inlining telemetry in `"warnings"` (e.g. `"Inlined 1 stylesheet(s) and 3 asset(s) (~60.6 KB) so the screen renders standalone on Stitch."`). If you instead see `"Could not inline stylesheet ..."`, the screen will render unstyled — fix the dev server route before uploading.
     - Ensure the capture awaiting barrier (`document.fonts.ready`) has resolved so custom brand fonts are fully applied. Inspect `data.telemetry` (`hydrated`, `domNodeCount`, `textLength`) or use `--probe` for verbose telemetry.
   - **LINUX KEYRING HANG RULE**: If `--browser` capture hangs and then reports an empty DOM while the dev server shows **zero incoming requests**, Chrome is blocking on the system keyring (gnome-keyring/kwallet) during profile initialization—navigation never starts at all. `stitch capture` already passes `--password-store=basic` to prevent this. Any *manual* headless Chrome invocation on Linux must pass it too, or it will hang indefinitely.
   - **LOADING STATE RULE (why a screen shows grey skeleton bars)**: DOM-size stability is not readiness. A page rendering skeleton placeholders reaches a stable size in ~0.5 s while the real data arrives seconds later, so a naive "DOM stopped growing" check snapshots the loading state. `stitch capture` therefore refuses to snapshot while any loading rule matches (`[aria-busy="true"]`, `[data-route-skeleton]`, `.skeleton`, `.spinner`, `[role="progressbar"]`, `[inert]`), and warns loudly if the budget expires while still loading. Tune with `--settle-timeout <ms>` (default 15000) and require specific content with `--wait-for "<selector>"`.
   - **AUTHENTICATED CAPTURE RULE**: Headless Chrome starts with an empty profile, so an app whose content sits behind sign-in captures the *logged-out* landing page no matter how long you wait. Use `--prepare <file.js>` to drive the app into the state you want before the snapshot. The script runs in the page, may be async, and gets a `__stitchWaitFor(selector, timeoutMs)` helper:
     ```bash
     stitch capture --browser --url="http://localhost:<port>/" \
       --prepare .loop/signin.js \
       --wait-for "#meet-list" \
       --settle-timeout 30000 \
       --upload=false -o .loop/captured-dom.html
     ```
     ```js
     // .loop/signin.js — runs inside the captured page
     await __stitchWaitFor('#sign-in-form');
     const set = (el, v) => {
       Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value').set.call(el, v);
       el.dispatchEvent(new Event('input', { bubbles: true }));
     };
     set(document.querySelector('#sign-in-email'), 'demo@example.test');
     set(document.querySelector('#sign-in-password'), 'demo-password');
     document.querySelector('#submit-sign-in').click();
     await __stitchWaitFor('#meet-list');
     ```
     Native value setters plus a bubbled `input` event are required for React/Vue controlled inputs; assigning `el.value` alone does not update component state. Or use `--storage <storageState.json>` to seed cookies and localStorage prior to boot.

2. **Step 3B: Render Headless 1280x800 Verification Screenshot**:
   - Render `.loop/captured-dom.html` in headless Chrome at the exact Stitch desktop canvas dimensions:
     ```bash
     /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
       --headless=new \
       --disable-gpu \
       --password-store=basic \
       --window-size=1280,800 \
       --screenshot=.loop/verify-capture.png \
       .loop/captured-dom.html
     ```

3. **Step 3C: Inspect & Verify with `view_file`**:
   - Call `view_file` on `.loop/verify-capture.png` and verify that:
     - The page layout is fully hydrated and interactive elements are rendered (not a solid blank or gray box).
     - Custom typography from `DESIGN.md` (e.g. Outfit) is active and rendering with proper weight and spacing.
     - No broken asset icons or collapsed flex containers are present.

4. **Step 3D: Present Visual Proof in Chat**:
   - Begin with the **Universal Orientation Anchor** (`Status: Visual Proof (Phase 3)`).
   - Embed the verification screenshot in chat: `![Captured Baseline](file:///.../.loop/verify-capture.png)`.
   - Summarize what was verified (e.g. *"Hydrated meeting timeline, custom Outfit typography verified, responsive container seated at 1280x800"*).

5. **🛑 GATE 3 CHECKPOINT (Visual Approval)**:
   > [!CRITICAL]
   > **STOP CALLING TOOLS IMMEDIATELY.**
   > **ZERO BLIND UPLOADS.** You are strictly forbidden from running `stitch upload`, `stitch capture --upload`, or `stitch loop setup` until the user confirms the visual render.
   > Ask the user:
   > *"Here is the rendered verification screenshot of the pre-hydrated DOM. Does this accurately represent the visual baseline you want on your Stitch Canvas? Once you confirm, I will pair the workspace and upload it."*
   > Wait for the user's explicit reply.

---

### Phase 4: Controlled Pairing & Rapid Prototyping

Once the user approves the visual proof (or selects Option A from Gate 0):

1. **Step 4A: State Machine Orchestration (`stitch loop setup`)**:
   - Execute setup to pair the workspace, calibrate the Remote Skill Suite, upload the verified reference screen, and calibrate the Priority Goal:
     ```bash
     stitch loop setup
     ```
   - **Automatic Reference Screen Reuse (Tier-0 Continuity Bridge)**:
     - When `.loop/captured-dom.html` exists from Step 3A, `stitch loop setup` automatically reuses that exact pre-hydrated, user-approved snapshot (`source: "explicit_file"`). It **will not** probe random background ports (`5173`, `3000`, etc.) or fall back to unhydrated static build files (`dist/index.html`).
     - If you need to override the target explicitly (or if running setup without a prior `.loop/captured-dom.html`), pass explicit target flags so background servers on `COMMON_PORTS` are never hijacked:
       ```bash
       stitch loop setup --file .loop/captured-dom.html
       # OR if adopting a pre-uploaded canvas project and reference screen:
       stitch loop setup --project-id=<projectId> --screen-id=<screenId>
       # OR directly against a specific live route with headless browser hydration:
       stitch loop setup --url="http://localhost:<port>/<route>" --browser
       ```
   - Verify that setup successfully establishes:
     - Workspace pairing in `.loop/manifest.json`.
     - Remote 3-skill calibration suite (`design-synthesis`, `insight-guidelines`, `assessment-guidelines`).
     - Priority Goal calibrated to **Evolution Mode** (since routes were captured) or **Genesis Mode** (if greenfield).
     - Craft-neutral `DESIGN.md` in root.

#### The 3-Skill Workspace Calibration Suite (Backend Architecture)

> [!CRITICAL]
> **Why `design-synthesis` Alone Fails**:
> Autonomous Stitch Loop backend research orchestrators execute in sandboxes (`/tmp/skills/`). Subagents strictly delegate Phase 1 (Insight Discovery) to agents reading `/tmp/skills/insight-guidelines.md` and Phase 2 (Assessment Synthesis) to agents reading `/tmp/skills/assessment-guidelines.md`.
> If only `design-synthesis` is added as a standalone skill, the research subagents **never consult it**. They fall back to generic software friction audits (reporting database drift, schema mismatches, or build scripts) and produce generic 3-column "workbench" engineering solutions.
>
> To synthesize genuine visual UI prototypes on Stitch Canvas, **all three skills must be calibrated**:

1. **Skill 1: `design-synthesis` (`allowMissing: true`)**
   - **Role**: Custom architectural ontology.
   - **Enforces**: The Primary Physical Artifact, the Primary Human Gesture, craft-neutral materiality (`DESIGN.md`), and anti-pollution token limits.
2. **Skill 2: `insight-guidelines` (`isReadOnly: false`, `updateMask: "content,description"`)**
   - **Role**: Form-Giving (Gestaltung) discovery mandate.
   - **Enforces**:
     - Diagnosing **passive detachment** (where users are trapped behind static readouts or unattached docs) rather than code friction.
     - Deriving problem statements directly from the primary artifact and gesture, citing `/tmp/skills/design-synthesis.md`.
     - Anchoring every insight to concrete application routes registered in `/tmp/context/codebase_architecture_ui.json` (e.g. `Route: /`, `Route: /chapters`).
3. **Skill 3: `assessment-guidelines` (`isReadOnly: false`, `updateMask: "content,description"`)**
   - **Role**: Assessment Triad enforcement.
   - **Enforces**: Every solution specification document (`file_path`) must contain:
     - **Part A: Domain Seed (`seed.json`)**: Domain name, physical metaphor, primary human gesture, and entities with natural units.
     - **Part B: Art-Directed Design System (`DESIGN.md`)**: Materiality, authentic surfaces, typography hierarchy, and anti-clutter invariants (zero fake HUD slashes `//`, zero status dots, zero redundant labels).
     - **Part C: Dual-Screen Canvas Prompts (<30 lines, <350 words)**: Approach A (Prescriptive Component Surgery) and Approach B (Narrative Intent & Interaction Flow), beginning with the mandatory opening grounding anchor and enforcing anti-pollution token rules.

#### Automated vs. Manual Skill Calibration

- **Automated**: `stitch loop setup` calibrates all three skills automatically via the Loop SDK.
- **Manual Verification & Inspection**:
  ```bash
  stitch get skill insight-guidelines --workspace=<workspaceId> --json
  stitch get skill assessment-guidelines --workspace=<workspaceId> --json
  stitch get skill design-synthesis --workspace=<workspaceId> --json
  ```
- **Manual CLI Calibration (if patching an existing workspace)**:
  ```bash
  stitch api "workspaces/<workspaceId>/skills/insight-guidelines?updateMask=content,description" \
    -X PATCH \
    --json='{
      "description": "Guidelines for insights with first-principles spatial derivation and Stitch Canvas prototyping.",
      "content": "<CALIBRATED_INSIGHT_GUIDELINES_CONTENT>"
    }'

  stitch api "workspaces/<workspaceId>/skills/assessment-guidelines?updateMask=content,description" \
    -X PATCH \
    --json='{
      "description": "Guidelines for assessments enforcing the Assessment Triad (seed.json, DESIGN.md, and dual-screen Stitch prompts).",
      "content": "<CALIBRATED_ASSESSMENT_GUIDELINES_CONTENT>"
    }'
  ```
- **Reversibility**: To restore a built-in guideline skill back to system default, run:
  ```bash
  stitch api "workspaces/<workspaceId>/skills/<skillId>:reset" -X POST
  ```

2. **Step 4B: Present the Lay of the Land (Feature Pitches)**:
   - Run `stitch status --json` to fetch synthesized insights and solutions.
   - Inspect the returned `state` and `prototypes`:

   #### Case A: Prototype Synthesis in Progress (`state === "SYNTHESIZING_PROTOTYPES"` or `prototypes: []`)

   > [!CRITICAL]
   > **STRICT PROHIBITION (ZERO FABRICATED PITCHES — Finding F-fbc752)**:
   > You are **strictly forbidden** from inventing, mocking, or synthesizing feature pitches from local code, package files, ASTs, or git history when `prototypes` is empty.
   > In finding F-fbc752, when `stitch status --json` returned `prototypes: []` because Loop was actively synthesizing prototypes, the agent hallucinated 5 fake feature pitches from local code reading. Fabricating pitches violates the core design contract, invents ungrounded canvas baselines, and disconnects the user from authoritative Stitch Loop intelligence.
   > When `prototypes` is empty or `state === "SYNTHESIZING_PROTOTYPES"`, you **must not guess or manufacture any prototype pitches**. Follow the concrete action below.

   **CONCRETE ACTION WHILE SYNTHESIZING**:
   1. **Universal Orientation Anchor**:
      Output the mandatory Universal Orientation Anchor with `Status: Prototyping (Phase 4 - Synthesizing)`.
   2. **Inform User of Active Synthesis**:
      Inform the user clearly that Stitch Loop is actively analyzing their codebase and synthesizing prototypes for the workspace.
   3. **Report Environment & Metadata**:
      Report the responding environment (`environment.target` / `environment.baseUrl`), workspace ID (`workspaceId`), and reference screen ID (`stitch.referenceScreenId`).
   4. **Clear User Guidance**:
      - Advise that backend prototype synthesis typically completes in 30–60 seconds.
      - Offer to poll `stitch status --json` again shortly.
      - Invite the user to share any specific design priorities, key user flows, or routes they want prioritized while synthesis completes.
   5. **🛑 STOP CALLING TOOLS & YIELD TURN**:
      Do not enter a busy polling loop or chain further tool calls. Stop calling tools immediately and yield the turn to wait for the user's response in chat.

   ---

   #### Case B: Ready Prototypes (`state === "READY"` and `prototypes.length > 0`)

   When `stitch status --json` returns ready prototypes:
   - Begin with the **Universal Orientation Anchor** (`Status: Prototyping (Phase 4)`).
   - Present the discovered prototypes following this exact structure:
     1. **Header Badge**: Top metadata receded: `*repo (branch) · workspace-id*`
     2. **Title**: `# What do you want to create?`
     3. **Context Line**: *"Here are the UI features and page transformations discovered from your codebase:"*
     4. **Feature Pitch Cards (1 to 5)**:
        - **Action Title**: Authoritative imperative sentence locating the page and naming the transformation.
        - **Route**: Dedicated line beneath title (`Route: /chapters`).
        - **Why it matters**: 1-2 sentences explaining what is painful, static, or missing on this screen today.
        - **The Change**: Describe where the new UI sits visually on the responsive desktop canvas and how it reacts when interacted with (fluid, relational descriptions, zero pixel numbers).
        - **The Payoff**: 1 crisp sentence explaining the tangible user superpower or time saved.
     5. **Keystroke Prompt**:
        ```markdown
        ---
        Reply **1**, **2**, **3**, **4**, or **5** to start building on canvas, or ask to drill into any prototype for more details.
        ```
   - **🛑 YIELD TURN**: Stop calling tools and let the user pick a prototype.

---

### Step 4C: Information Hierarchy & First-Principles Spatial Derivation

When the user selects a prototype ordinal (e.g. `2`):
1. **Never Silently Mutate**: Output a visible explanation in chat covering:
   - **First-Principles Spatial Analysis**:
     - **The Primary Physical Artifact**: What tangible object or physical medium does the workflow center around (e.g. an acoustic scoring stave, an apothecary ledger, a printed itinerary)?
     - **The Primary Human Gesture**: What tactile interaction does the user perform (e.g. scrubbing time, comparing swatches side-by-side, spatial mapping)?
     - **Form Follows Artifact & Gesture**: Never default to a SaaS analytics dashboard (no top 4-card metric strips, no split-column card grids). Let the spatial layout emerge organically.
   - **Grounding in Real Usage Data**:
     - Locate real user files in inboxes/outboxes (`examples/`, `docs/`, test fixtures, markdown content). Never use internal code ASTs or engine plumbing as UI data.
     - Confirm the anchor document with the user before generating.

---

### Step 4D: The Dual-Screen Experiment

Generate **two candidate screens** using `stitch generate screen` to compare approaches side-by-side:

> [!IMPORTANT]
> **Prompt Grounding Anchor**:
> Every prompt generating a new candidate screen from an existing reference screen MUST include the mandatory opening anchor and canvas baseline at the top:
> ```text
> This is a targeted edit. Maintain this exact screen layout except for the following instructions.
> [Canvas Baseline: {route} · Reference Screen ID: {screenId}]
> ```

#### Candidate Screen 1: Approach A (Prescriptive Component Surgery)
Targets specific named components directly with clear surgical operations:
```bash
cat << 'EOF' | stitch generate screen --title "Candidate A: Prescriptive" --device DESKTOP
This is a targeted edit. Maintain this exact screen layout except for the following instructions.
[Canvas Baseline: /chapters · Reference Screen ID: <screenId>]

Design a candidate screen based on the /chapters baseline, updating and introducing named components:

1. Insert <!-- Component: ChapterDrawer -->:
   - Position: Collapsible sidebar docked alongside <!-- Component: DocumentEditor -->.
   - Layout: Renders document heading hierarchy (#, ##, ###) parsed from Markdown. Clicking any chapter seeks playback.

2. Modify <!-- Component: PlaybackDock > AudioScrubber -->:
   - Replace the flat progress bar with a segmented timeline track showing chapter boundary pins and draggable silence pads.

3. Component Preservation:
   - Strictly preserve the visual style and structure of <!-- Component: GlobalHeader --> and <!-- Component: DocumentEditor -->.
   - Delimit all newly created elements with matching <!-- Component: ... --> comments.
EOF
```

#### Candidate Screen 2: Approach B (Narrative Intent & Interaction Flow)
Describes the user's experiential journey, atmospheric consistency, and screen transition dynamics without micro-prescribing the DOM:
```bash
cat << 'EOF' | stitch generate screen --title "Candidate B: Narrative Intent" --device DESKTOP
This is a targeted edit. Maintain this exact screen layout except for the following instructions.
[Canvas Baseline: /chapters · Reference Screen ID: <screenId>]

We need an expanded Chapter Navigation and Pacing experience for the /chapters screen that evolves the layout system to match the Studio view.

Consider the user interaction flow:
The author is listening to the synthesized document and encounters an awkward pause in Section 3. Clicking the scrubber track triggers an intuitive chapter drawer to slide out from the left edge of the reading canvas, parsing the Markdown headings into clean, seekable milestones. At the same time, the flat playback bar transforms into an expressive acoustic timeline where draggable silence pads let the author directly adjust pause durations between paragraphs.

Aesthetic & Spatial Guidance:
- Maintain the warm paper background and carbon ink typography established in the reference screen.
- Keep the interface breathable and uncrowded; depth should feel like layered paper planes, avoiding heavy drop shadows.
- Ensure the user can seamlessly collapse the drawer to return to focused writing.
EOF
```

> [!CRITICAL]
> **Anti-Pollution Linter Budget (Mandatory)**:
> 1. **Brevity**: Max 30 content lines, max 350 words. Overly prescriptive, bloated prompts trigger Stitch's crowded-dashboard prior.
> 2. **Banned Legacy Tokens**: Never include `Tier 1–4`, `repeat(4, 1fr)`, `Workbench`, `Ledger`, `Colophon`, `HUD`, `//`, or `[●]`.
> 3. **Negative-Space Cadence**: Over 50% open canvas. Rely on spatial alignment, typographic scale, and delicate hairlines rather than nested gray boxes.

---

### Step 4E: Present Results & Compare Variants

When generation completes, present both synthesized screens side-by-side:

> [!IMPORTANT]
> **Canonical Stitch Canvas URLs**:
> Never guess URLs. Run `stitch url` to retrieve verified links:
> ```bash
> stitch url screen <screenAId> --project=<projectId>
> stitch url screen <screenBId> --project=<projectId>
> stitch url project <projectId>
> ```
> - **Screen A**: `[Open Screen A on Stitch Canvas](<url-from-stitch-url>)`
> - **Screen B**: `[Open Screen B on Stitch Canvas](<url-from-stitch-url>)`
> - **Full Project**: `[Open Project Canvas](<url-from-stitch-url>)`

1. **Screen A (Prescriptive)**: Preview screenshot embed (`![Screen A](imageUrl)`) and direct canvas link.
2. **Screen B (Narrative Intent)**: Preview screenshot embed (`![Screen B](imageUrl)`) and direct canvas link.
3. **Architectural Evaluation**:
   - How well did each variant preserve existing chrome (`GlobalHeader`, `DocumentEditor`)?
   - How naturally did each express the navigation hierarchy?
   - Did either variant fall into the passive labeling trap?
4. **Next Steps**: Invite the user to select the winning variant for targeted editing with `stitch edit screen --id=<chosenScreenId>`.
