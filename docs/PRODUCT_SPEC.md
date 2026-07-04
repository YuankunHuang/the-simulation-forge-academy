You are Fable 5 working inside Cursor as an elite product engineer, UX designer, frontend architect, learning-science designer, and game systems designer.

Build a complete, deployable, local-first web app MVP called:

The Simulation Forge Academy
仿真铸造学院

Subtitle:
A personal career RPG for becoming a deterministic realtime simulation engineer.

The app is a private, single-player, gamified career transformation system for a real developer. It must feel like a cozy, polished, addictive, warm, home-like RPG academy cockpit, not like a todo app, Notion dashboard, Jira board, or course tracker.

The output should be a real working codebase, not a mockup.

Do not ask follow-up questions. Make strong, sensible product decisions and implement the MVP fully.

============================================================
0. PRODUCT CONTEXT
============================================================

The player is:

- A non-CS-degree Unity/C# mobile game developer with 5+ years of production experience.
- Strong in practical Unity production intuition, but lacking systematic CS foundations and explicit evidence.
- Currently working on a project called Unity Native Boundary Lab.
- Long-term goal: become a deterministic realtime simulation engineer / realtime simulation infrastructure engineer.
- Learning motto: "What I cannot create, I do not understand."
- Learning preference: visual, interactive, game-like, concrete, project-driven.
- Current pain: too many good resources, too much decision fatigue, not enough evidence.
- Existing resources: AI Skills, Cursor, Dometrain, roadmap.sh, Neetcode.
- Primary current project: Unity Native Boundary Lab.
- The app must reduce decision fatigue and tell the player what to do next.

Core career path:

Unity Mobile Production Engineer
→ Unity/C++ Boundary & Runtime Tooling Engineer
→ Headless C++ Deterministic Simulation Builder
→ Deterministic Realtime Simulation Infrastructure Engineer

The app must turn this transformation into a playable personal career RPG.

============================================================
1. CORE PRODUCT VISION
============================================================

This is NOT:

- A generic todo app.
- A generic learning tracker.
- A course tracker.
- A Notion clone.
- A social app.
- A backend app.
- A productivity dashboard with superficial gamification.
- A random AI-generated roadmap.
- A system that rewards passive course watching.

This IS:

- A private, single-player career RPG.
- A daily cockpit.
- A quest system.
- A warm academy home base.
- A skill tree.
- A fog-of-war world map.
- An evidence vault.
- A reflection journal.
- A review deck.
- A bonus dungeon shop.
- A system that turns project work into visible career evidence.

The app should answer five questions every time the player opens it:

1. Where am I in my transformation?
2. What should I do today?
3. Why does this quest matter?
4. What counts as completion?
5. What career evidence did I create?

The core rule:

No artifact, no mastery XP.

The system may reward small effort lightly, but real progression must come from evidence:
- commits
- screenshots
- benchmark exports
- README sections
- architecture docs
- debug notes
- tests
- interview explanations
- LinkedIn/blog/portfolio-ready artifacts

============================================================
2. NARRATIVE SETTING
============================================================

Setting:

The Simulation Forge Academy / 仿真铸造学院

This is a cozy academy-guild-forge hybrid for engineers who are transforming from production developers into systems-level simulation engineers.

Visual mood:

- Warm
- Friendly
- Cartoon-like
- Cozy
- Home-like
- Slightly magical
- Slightly engineering-themed
- Not childish
- Not corporate
- Not dark fantasy
- Not cyberpunk-heavy
- Not overwhelming

The player starts at:

Hearth Hall / 炉火大厅

This is the home base. It contains:

- Mentor NPC
- Daily Quest Board
- Map Table
- Forge Workshop
- Evidence Vault
- Skill Tree Alcove
- Bonus Dungeon Shop
- Campfire Reflection Corner

Core NPC:

Name: Professor Mira / 米拉导师
Role: Forge Mentor
Tone:
- warm
- direct
- precise
- encouraging
- gently strict
- never cheesy
- never toxic
- never guilt-tripping
- never overwhelming

Mira should speak like a mentor who understands that the player already has production experience, but must now forge explicit systems-level evidence.

Example tone:

"今天不需要理解整个 C++ 世界。今天只需要让 Unity 听见 native runtime 的第一句回应。完成 NblGetVersion，记录一次失败，提交一条证据。这就是今天的胜利。"

The NPC must not randomly suggest new technologies.
The NPC must always respect the current unlocked region and main quest.

============================================================
3. GAMEPLAY DESIGN
============================================================

Primary gameplay loop:

1. Enter Hearth Hall.
2. Read Mentor Mira's short contextual greeting.
3. Accept today's recommended quest.
4. Complete a warm-up recall prompt.
5. Enter the Workshop for instructions, AI prompt, resource links, and DoD.
6. Work outside the app in Cursor / Unity / terminal / docs.
7. Return and submit evidence.
8. Receive rewards.
9. Unlock skills, map nodes, artifacts, and review cards.
10. Complete campfire reflection.

The app must support three play modes:

A. Low Energy Mode
For tired weekdays.
- 1 review card
- 1 tiny reflection
- read current quest
- no streak punishment
- small gold reward
- no mastery XP unless evidence is submitted

B. Normal Mode
Default daily play.
- 1 main quest step
- 1 evidence item
- 1 reflection
- normal XP/gold

C. Deep Work Sprint
For high-energy days.
- Player can complete multiple unlocked quests in one sitting.
- After completing a quest, show "Continue Adventure" to attempt next unlocked quest.
- Still require evidence per quest.
- Boss Gates still block progression until strict conditions are met.
- At the end, generate a Session Recap.

Important:
Daily quest is a recommendation, not a hard lock.
The player may advance multiple levels in one day if they produce required evidence.

But:
No quest can be completed without evidence.
No region can be skipped.
No far-future map details should be visible.
No bonus dungeon can unlock before its prerequisites.

============================================================
4. WORLD MAP AND FOG OF WAR
============================================================

Implement a campaign map with fog of war.

Visibility rules:

- Current unlocked region: fully visible.
- Immediately next region: visible only as silhouette / locked preview, with name and vibe only.
- Far future regions: hidden behind fog. Do not show quest details.
- Locked regions should create curiosity, not anxiety.
- Avoid huge visible task lists.

World structure:

ACT I: The Boundary Apprentice
Current main act.

Region 0: Hearth Hall / 炉火大厅
Purpose:
- onboarding
- player profile
- current career class
- first quest

Region 1: Bridge Village / 边界新手村
Covers:
- M0 Project Scaffold
- M1 CMake Native Library
- M2 First P/Invoke Call
- M3 Context Lifetime
Boss: The First Signal Gate

Region 2: Benchmark Plains / 基准测试平原
Covers:
- M4 Agent Data Schema
- M5 Native Batched Step
- M6 Per-Agent Anti-pattern
- M7 Benchmark Runner + HUD
- M8 Burst Baseline
Boss: The Boundary Cost Trial

Region 3: Layout Archives / 布局档案馆
Covers:
- M9 Memory Layout Lab
Boss: The Blittable Contract

Region 4: Safety Clinic / 安全边界诊所
Covers:
- M10 Safety & Error Boundary
Boss: The Recoverable Failure Trial

Region 5: Package Harbor / 包管理港口
Covers:
- M11 UPM Packaging
Boss: The Developer-Facing Package

Region 6: Mobile Gate / 移动端之门
Covers:
- M12 Android IL2CPP Validation
Boss: The ARM64 Passage

Region 7: Observatory Annex / 观测台附楼
Covers:
- M13 Optional XR or Render Thread
This is optional / late-stage.

ACT II: The Kernel Builder
Locked behind fog initially.
Only show silhouette until Act I Public Demo Slice is complete.

Regions:
- Fixed Timestep Garden
- Input Log Workshop
- State Hash Tower
- Snapshot Keep
- Replay Chamber
- Headless CLI Arena
- Unity Visualizer Bridge

ACT III: The Determinism Architect
Locked behind deep fog initially.

Regions:
- Multi-Agent Scenario Lab
- Replay Viewer Observatory
- Debug Timeline Cathedral
- Simulation Infrastructure Citadel
- Portfolio Hall of Fame

============================================================
5. CURRENT MAIN PROJECT CONTENT
============================================================

The current main project is Unity Native Boundary Lab.

Project thesis:

Native C++ is not automatically faster than C# or Burst.
Boundary design, batching, layout, lifetime, and diagnostics decide whether interop helps or hurts.

Public demo slice:

Agent Swarm Boundary Benchmark:
Compare:
- managed C# naive loop
- C# Jobs + Burst baseline
- native per-agent P/Invoke anti-pattern
- native batched C++ path

The app must contain seed content for Unity Native Boundary Lab milestones M0-M13.

Each milestone must be implemented as a quest with:

- id
- title
- region
- narrative hook
- objective
- why it matters
- prerequisites
- definition of done
- evidence required
- skills unlocked
- artifacts unlocked
- rewards
- AI Skill / Cursor prompt
- resource suggestions
- common traps
- interview explanation
- next risk
- unlocks

Use the following quest content as seed data.

------------------------------------------------------------
M0 — Project Scaffold
------------------------------------------------------------

Region:
Bridge Village

Narrative hook:
Before a bridge can carry signals, it needs foundations.

Objective:
Create the repository scaffold for Unity Native Boundary Lab.

Why it matters:
This proves the player can scope the project as serious boundary research, not a random native DLL demo.

Definition of Done:
- GitHub repository exists or local repo is initialized.
- Folders exist: native/, unity/, docs/.
- README has a one-paragraph thesis.
- docs skeleton exists.
- Unity project folder exists.
- UPM package folder exists.
- First commit is made.

Evidence required:
- commit hash
- repo tree screenshot or text
- README thesis paragraph
- 3-line reflection

Artifact unlocked:
Foundation Stone: Boundary Lab Scaffold

Interview explanation:
"I scoped the project as boundary research, not a random native DLL demo."

Common traps:
- Writing too much documentation before code.
- Starting XR, Android, SIMD, or render-thread too early.
- Making it a generic Unity demo.

------------------------------------------------------------
M1 — CMake Native Library
------------------------------------------------------------

Region:
Bridge Village

Narrative hook:
The native runtime must speak before Unity can listen.

Objective:
Create a CMake native library exposing NblGetVersionMajor/Minor/Patch.

Definition of Done:
- CMake project builds.
- Native library artifact is produced.
- nbl_api.h and nbl_api.cpp exist.
- NblGetVersionMajor/Minor/Patch are exported.
- A native smoke test or manual validation confirms version functions exist.
- Unity plugin file location is prepared.

Evidence required:
- commit hash
- build output screenshot or copied log
- short note explaining Debug vs Release
- one failure/debug note if any

Artifact unlocked:
Native Version Stone

Skills:
- CMake
- native binary
- symbol export
- C ABI

Interview explanation:
"I can build a native library outside Unity and reason about binary artifacts."

Common traps:
- Hardcoding platform-specific assumptions too early.
- Not separating header and implementation.
- Forgetting export macros.

------------------------------------------------------------
M2 — First P/Invoke Call
------------------------------------------------------------

Region:
Bridge Village

Narrative hook:
The native runtime has spoken. Today Unity must hear it.

Objective:
Call NblGetVersionMajor/Minor/Patch from Unity C# via DllImport.

Definition of Done:
- C# DllImport declarations compile.
- Native library is placed where Unity can load it.
- Unity Editor scene prints native version.
- Failure case is documented cleanly.
- The player can explain why extern "C" matters.

Evidence required:
- commit hash
- Unity Editor screenshot
- debug note for DLL load or symbol issue
- 90-second explanation in text

Artifact unlocked:
First Signal: Unity Heard Native

Skills:
- P/Invoke
- DllImport
- native plugin loading
- C ABI

Interview explanation:
"I understand how managed Unity code discovers and calls unmanaged functions."

Common traps:
- EntryPointNotFoundException due to missing extern "C".
- Wrong plugin file name.
- Wrong architecture.
- Unity import settings not configured.

------------------------------------------------------------
M3 — Context Lifetime
------------------------------------------------------------

Region:
Bridge Village

Narrative hook:
A signal is not enough. The bridge needs ownership rules.

Objective:
Implement NblCreateContext / NblDestroyContext and a C# NativeBoundaryContext : IDisposable wrapper.

Definition of Done:
- Native context can be created and destroyed.
- C# wrapper privately owns IntPtr.
- Gameplay layer does not touch raw native handle.
- Double Dispose is safe.
- Invalid handle behavior is tested or documented.
- Ownership model is written down.

Evidence required:
- commit hash
- code snippet or screenshot of IDisposable wrapper
- ownership table
- double-dispose validation note
- short interview answer

Artifact unlocked:
Opaque Handle Contract

Skills:
- RAII
- IDisposable
- opaque handle
- lifetime ownership

Interview explanation:
"I used opaque handles and explicit lifetime instead of leaking C++ objects across ABI."

Common traps:
- Letting MonoBehaviour hold raw IntPtr.
- Non-idempotent Dispose.
- Assuming native memory bugs are harmless.
- Letting C++ objects cross ABI.

Boss Gate:
The First Signal Gate

Boss Gate requirements:
- M0-M3 completed.
- Evidence exists for each.
- Player writes a 5-sentence Bridge Village summary.
- Player can explain:
  "Why C ABI?"
  "Why opaque handle?"
  "Why IDisposable?"

Unlocks:
Benchmark Plains

------------------------------------------------------------
M4 — Agent Data Schema
------------------------------------------------------------

Region:
Benchmark Plains

Objective:
Define blittable NblAgent in C++ and matching C# struct.

Definition of Done:
- C++ NblAgent exists.
- C# matching Agent struct exists.
- C++ static_assert validates size and offsets.
- C# size check validates layout.
- README or docs explain blittable boundary.

Evidence required:
- commit hash
- C++ static_assert screenshot or code snippet
- C# size check screenshot or code snippet
- short explanation of blittable

Artifact unlocked:
Blittable Agent Contract

Interview explanation:
"I can design data structs that are safe to pass across the managed/unmanaged boundary."

Common traps:
- Using string, object, managed arrays, or references in boundary structs.
- Defaulting to Pack=1 as fake optimization.
- Assuming C# Vector3 and C++ struct always match.

------------------------------------------------------------
M5 — Native Batched Step
------------------------------------------------------------

Region:
Benchmark Plains

Objective:
Implement NblStepAgents for batched agent update.

Definition of Done:
- NblStepAgents updates an array of agents.
- 100 agents update correctly.
- Checksum validates.
- Native call count is one per batch.
- Unity visual sample can show agent movement or simplified visualization.

Evidence required:
- commit hash
- screenshot/GIF of agents or debug output
- checksum note
- 3-line explanation of batching

Artifact unlocked:
Batched Native Step

Interview explanation:
"I intentionally use batched calls to avoid per-entity boundary overhead."

Common traps:
- One P/Invoke call per entity.
- Rendering cost dominating simulation measurement.
- No checksum validation.

------------------------------------------------------------
M6 — Per-Agent Anti-pattern
------------------------------------------------------------

Region:
Benchmark Plains

Objective:
Add native per-agent mode as a deliberate anti-pattern for benchmark contrast.

Definition of Done:
- Native per-agent mode exists.
- Native calls/frame equals agent count.
- Output matches batched mode within tolerance.
- UI clearly labels it as anti-pattern.

Evidence required:
- commit hash
- screenshot of native calls/frame
- short note: why this is intentionally bad
- comparison note with batched path

Artifact unlocked:
Anti-pattern Specimen

Interview explanation:
"I can demonstrate why naive native integration can be worse than C#."

Common traps:
- Presenting per-agent P/Invoke as recommended.
- Comparing modes without same input data.
- Forgetting tolerance validation.

------------------------------------------------------------
M7 — Benchmark Runner + HUD
------------------------------------------------------------

Region:
Benchmark Plains

Objective:
Add fixed seed, warmup, measured frames, median/p95, GC alloc, HUD, CSV/JSON export.

Definition of Done:
- Benchmark runner supports 1k / 5k / 10k agents.
- Same fixed seed is used across modes.
- Warmup frames excluded.
- Median and p95 reported.
- GC allocation recorded.
- Runtime HUD displays mode, agent count, native calls/frame, ms/frame, GC alloc, checksum.
- CSV or JSON export works.

Evidence required:
- commit hash
- HUD screenshot
- exported CSV/JSON sample
- benchmark methodology note
- LinkedIn draft seed

Artifact unlocked:
Boundary Cost Report

Interview explanation:
"I measure interop instead of guessing."

Common traps:
- Reporting best frame only.
- Mixing rendering cost with simulation cost.
- Comparing invalid outputs.
- Running native Debug build and pretending it is final.

------------------------------------------------------------
M8 — Burst Baseline
------------------------------------------------------------

Region:
Benchmark Plains

Objective:
Add C# Jobs + Burst mode for fair comparison.

Definition of Done:
- Burst mode exists.
- Burst output validates against other modes.
- Benchmark report includes Burst mode.
- Documentation explicitly says this is not C++ worship.

Evidence required:
- commit hash
- benchmark report including Burst
- short fairness explanation
- updated README paragraph

Artifact unlocked:
Fairness Trial Seal

Interview explanation:
"I do not claim C++ is automatically faster; I compare against Unity's high-performance path."

Boss Gate:
The Boundary Cost Trial

Boss Gate requirements:
- M4-M8 completed.
- Benchmark output exported.
- HUD screenshot exists.
- Player writes a 90-second explanation:
  "How did I design the benchmark so it measures boundary cost rather than rendering cost?"
- Player drafts first LinkedIn/GitHub showcase note.

Unlocks:
Layout Archives

------------------------------------------------------------
M9 — Memory Layout Lab
------------------------------------------------------------

Region:
Layout Archives

Objective:
Build AoS/SoA, natural/packed, copy/pointer path experiments.

Definition of Done:
- AoS and SoA variants exist.
- Natural and packed layout comparison exists.
- Layout sizes are reported.
- Pointer path is documented as advanced and constrained.
- Native does not retain borrowed Unity pointers beyond call duration.
- Memory layout report is created.

Evidence required:
- commit hash
- layout report
- table screenshot
- short explanation: why Pack=1 is not magic

Artifact unlocked:
Memory Layout Codex

Interview explanation:
"I understand data layout and boundary contracts, not just syntax."

------------------------------------------------------------
M10 — Safety & Error Boundary
------------------------------------------------------------

Region:
Safety Clinic

Objective:
Implement ResultCode, LastError, native catch boundary, logging callback, invalid input tests.

Definition of Done:
- Recoverable failures return result codes.
- LastError can be queried.
- Invalid handle test exists.
- Buffer-too-small test exists.
- Double Dispose remains safe.
- Native exceptions do not intentionally cross C ABI.
- Documentation warns that memory corruption can still crash the process.

Evidence required:
- commit hash
- diagnostics screenshot
- failure injection note
- safety boundary explanation

Artifact unlocked:
Recoverable Failure Protocol

Interview explanation:
"The wrapper makes native code safer to consume from gameplay code."

------------------------------------------------------------
M11 — UPM Packaging
------------------------------------------------------------

Region:
Package Harbor

Objective:
Move runtime/editor code into a clean UPM package with Samples~ and asmdefs.

Definition of Done:
- Package folder structure exists.
- Runtime asmdef exists.
- Editor asmdef exists.
- Samples~ includes HelloNative and AgentSwarmBenchmark.
- Fresh Unity project can import package and run sample.
- Package README exists.

Evidence required:
- commit hash
- package folder screenshot
- fresh project validation note
- README package quickstart

Artifact unlocked:
Developer-Facing Package

Interview explanation:
"I can ship developer-facing Unity tooling, not just a scene demo."

------------------------------------------------------------
M12 — Android IL2CPP Validation
------------------------------------------------------------

Region:
Mobile Gate

Objective:
Build Android ARM64 .so, configure plugin import settings, run IL2CPP development build.

Definition of Done:
- Android ARM64 native library generated or planned.
- Plugin import settings documented.
- IL2CPP development build attempted.
- Success or failure documented.
- Android notes explain blocker and fix path.

Evidence required:
- commit hash
- build screenshot or error log
- Android IL2CPP notes
- mobile packaging reflection

Artifact unlocked:
Mobile Boundary Passage

Interview explanation:
"I validated mobile native packaging, which connects to my Unity mobile background."

------------------------------------------------------------
M13 — Optional XR or Render Thread
------------------------------------------------------------

Region:
Observatory Annex

Type:
Optional late-stage side expansion.

Objective:
Add XR simulator pose diagnostics or render-thread event sample after core bridge is solid.

Definition of Done:
- Optional demo runs.
- Documentation explains limitation.
- It does not rewrite the core architecture.
- It does not replace main deterministic simulation path.

Evidence required:
- commit hash
- screenshot/GIF
- limitation note
- optional LinkedIn draft

Artifact unlocked:
Engine-Adjacent Observatory

Interview explanation:
"I explored engine/XR-adjacent extension points after the core bridge was solid."

============================================================
6. BONUS DUNGEON SHOP
============================================================

Implement a shop where gold can unlock optional bonus dungeons.

Rules:

- Bonus dungeons are optional.
- Bonus dungeons cannot block main progress.
- Bonus dungeons cost gold.
- Bonus dungeons are only visible after prerequisites.
- Bonus dungeons must be short, independent, portfolio-relevant, and scoped.
- Bonus dungeons must not become new huge projects.

Initial bonus dungeons:

1. Benchmark Chart Alchemist
Unlock after M7.
Purpose:
Turn benchmark CSV/JSON into beautiful charts/report viewer.
Portfolio value:
Makes Native Boundary Lab more presentable.
Cost:
300 gold.

2. AI Chatbot Mini Forge
Unlock after M3.
Purpose:
Build a tiny local/mock career mentor chatbot UI.
No real AI API in MVP.
Portfolio value:
Shows UI state, prompt design, product polish.
Cost:
250 gold.

3. Replay Timeline Toy
Unlock after M8.
Purpose:
Build a simple timeline scrubber over precomputed frames.
Portfolio value:
Prepares for deterministic simulation replay viewer.
Cost:
400 gold.

4. Shader Potion Lab
Unlock after M5.
Purpose:
Create small visual effects or shader-style UI experiments.
Portfolio value:
Keeps visual/game-dev energy alive.
Cost:
200 gold.

5. Particle Stress Garden
Unlock after M7.
Purpose:
Explore scalable visualization ideas in safe progressive tiers.
Important:
Do not actually attempt extreme particle counts in the web app MVP.
Use safety tiers and performance guards.
Portfolio value:
Performance visualization intuition.
Cost:
500 gold.

============================================================
7. EVIDENCE VAULT
============================================================

Evidence Vault is one of the most important systems.

It should feel like a trophy room / artifact collection.

Each artifact should show:

- artifact name
- rarity
- quest source
- skills proven
- evidence submitted
- career value
- LinkedIn suggestion
- blog suggestion
- portfolio suggestion
- resume bullet suggestion
- interview explanation

Artifact rarities:

- Common
- Uncommon
- Rare
- Epic
- Legendary

Seed artifacts:

1. Foundation Stone: Boundary Lab Scaffold
Source: M0
Rarity: Common

2. Native Version Stone
Source: M1
Rarity: Common

3. First Signal: Unity Heard Native
Source: M2
Rarity: Uncommon

4. Opaque Handle Contract
Source: M3
Rarity: Rare

5. Blittable Agent Contract
Source: M4
Rarity: Rare

6. Batched Native Step
Source: M5
Rarity: Rare

7. Anti-pattern Specimen
Source: M6
Rarity: Epic

8. Boundary Cost Report
Source: M7
Rarity: Epic

9. Fairness Trial Seal
Source: M8
Rarity: Epic

10. Memory Layout Codex
Source: M9
Rarity: Epic

11. Recoverable Failure Protocol
Source: M10
Rarity: Epic

12. Developer-Facing Package
Source: M11
Rarity: Legendary

13. Mobile Boundary Passage
Source: M12
Rarity: Legendary

14. Engine-Adjacent Observatory
Source: M13
Rarity: Legendary

When an artifact is unlocked, the reward ceremony should say:

"New Evidence Collected"

Then show:

- What it proves.
- Why it matters for the career transition.
- Where to showcase it.
- Suggested next public-facing action.

Example:

Artifact:
Boundary Cost Report

What it proves:
You can design and measure managed/native interop cost instead of guessing.

Suggested LinkedIn action:
Draft a post explaining why per-agent P/Invoke is an anti-pattern and why batching matters.

Suggested portfolio action:
Add benchmark screenshot, CSV sample, and short methodology note.

Suggested resume bullet:
Created an Agent Swarm benchmark comparing managed C#, Burst, native per-call P/Invoke, and native batched execution with median/p95, GC allocation, checksum validation, and CSV export.

Do not auto-post anywhere.
Only generate suggestions and copyable drafts.

============================================================
8. SKILL TREE
============================================================

Implement a visual skill tree.

Skill trees:

A. C++ Runtime Tree
Nodes:
- CMake Basics
- Header/Source Organization
- Symbol Export
- extern "C"
- C ABI
- Opaque Handle
- RAII
- std::unique_ptr
- std::span internal use
- ResultCode
- No Exceptions Across ABI

B. Unity Interop Tree
Nodes:
- Native Plugin Loading
- DllImport
- Plugin Import Settings
- IntPtr Boundary
- IDisposable Wrapper
- NativeArray Boundary
- Runtime HUD
- Editor Diagnostics
- UPM Package

C. C# Runtime / Performance Tree
Nodes:
- Value vs Reference
- Blittable Types
- StructLayout
- GC Allocation
- Hot Path Rules
- Benchmarking
- Jobs/Burst Baseline
- Unsafe Pointer Contract

D. CS Systems Foundation Tree
Nodes:
- Compilation
- Linking
- Dynamic Library
- Stack vs Heap
- Memory Layout
- ABI
- Process Basics
- Thread Basics
- Profiling

E. Deterministic Simulation Tree
Initially mostly locked/fogged.
Nodes:
- Fixed Timestep
- Input Log
- State Hash
- Snapshot
- Replay
- Event Ordering
- Floating Point Caveats
- Validation Harness

F. Interview / Communication Tree
Nodes:
- Architecture Explanation
- Trade-off Explanation
- Benchmark Methodology
- Failure Mode Explanation
- Resume Bullet
- LinkedIn Post
- Blog Post
- Interview Defense

Skill unlocks must be evidence-based.
Do not unlock a skill just because a video/course was watched.

============================================================
9. REVIEW DECK
============================================================

Implement a small spaced-review deck.

This is not a full Anki clone.
MVP can use a simple spaced repetition system.

Each review card has:

- prompt
- answer
- related quest
- skill
- difficulty
- nextReviewDate
- interval
- ease or simple confidence rating

User ratings:
- Forgot
- Hard
- Good
- Easy

Review card examples:

Q:
Why do we use extern "C" at the managed/native boundary?
A:
To avoid C++ name mangling and expose stable C ABI symbols that C# DllImport can discover.

Q:
Why should C++ classes not cross the ABI boundary?
A:
C++ ABI is compiler/platform-specific. Keep C++ classes internal and expose POD structs, opaque handles, and C-compatible functions.

Q:
Why is per-agent P/Invoke an anti-pattern?
A:
It crosses the managed/native boundary once per agent, multiplying transition overhead and often erasing any native performance advantage.

Q:
What makes a struct blittable?
A:
It contains only fields with the same binary representation across managed/unmanaged memory and no managed references.

Q:
Why is Burst baseline necessary?
A:
To avoid naive "C++ is faster" claims and compare native code against Unity's own high-performance C# path.

Q:
Why should benchmark use median and p95?
A:
To avoid cherry-picking best frames and to show typical and tail performance.

============================================================
10. LEARNING SCIENCE DESIGN
============================================================

The app must implement these learning principles through UX, not as boring theory:

1. Retrieval practice
Before a quest starts, ask a warm-up question.

2. Spaced repetition
Old review cards return over time.

3. Desirable difficulty
Each quest should be a little uncomfortable but achievable.

4. Project-based learning
All mastery comes from creating artifacts.

5. Interleaving
Daily recommendations may include a tiny review/drill, but never enough to distract from main quest.

6. Reflection
Each quest completion requires a small reflection.

7. Evidence-based confidence
The player sees proof accumulating over time.

Avoid:
- streak guilt
- shame
- punishment for rest
- huge lists
- fake dopamine
- rewarding passive video consumption too much

Use a gentle "Momentum Flame" rather than harsh streaks.
If the player misses days, welcome them back warmly.

============================================================
11. REWARDS AND PROGRESSION
============================================================

Currencies:

1. XP
Main character progression.
Earned from completed quests and boss fights.

2. Gold
Earned from daily completion, reviews, and small tasks.
Used for bonus dungeons and cosmetic unlocks.

3. Skill Points
Earned when skill evidence is submitted.
Used to unlock skill tree nodes.

4. Reputation
Earned from public-facing artifacts:
- README
- LinkedIn draft
- blog draft
- portfolio card
- resume bullet

5. Insight Gems
Earned from high-quality reflections and interview explanations.

Rules:
- Watching a resource gives small gold only.
- Completing artifact-backed quests gives XP.
- Boss fights give large XP and reputation.
- Evidence Vault unlocks give career-focused rewards.
- Gold cannot buy main quest completion.
- Bonus dungeons cost gold.

Character classes / titles:

Start:
Unity Production Engineer

Then:
Boundary Initiate
Native Signal Apprentice
Interop Bridgewright
Boundary Benchmark Builder
Runtime Tooling Adept
C++ Kernel Apprentice
Determinism Engineer Candidate
Simulation Infrastructure Architect

Use class titles visually in the profile panel.

============================================================
12. UI / UX REQUIREMENTS
============================================================

Visual style:

- Cozy academy
- Warm fantasy workshop
- Cartoon-friendly
- Clean and modern
- Soft gradients
- Warm cream, wood, amber, moss green, soft blue, gentle purple
- Rounded cards
- Polished microinteractions
- Subtle glow for unlocked nodes
- Fog visual for locked map
- Responsive layout

Avoid:
- corporate dashboard look
- cyberpunk overload
- sharp harsh colors
- dark anxiety-inducing UI
- noisy particle effects
- too many emojis
- clutter
- giant text walls on the home screen

Pages/screens:

1. Hearth Hall / Home
Must show:
- Mentor greeting
- Current class/title
- Momentum Flame
- Today's recommended quest
- Low / Normal / Deep Work mode selection
- Quick access to Map, Skill Tree, Evidence Vault, Review Deck, Bonus Shop

2. Quest Detail / Workshop
Must show:
- narrative hook
- objective
- why it matters
- definition of done
- evidence required
- AI Skill / Cursor prompt
- common traps
- interview explanation
- submit evidence form
- complete quest button disabled until required evidence fields are filled

3. Campaign Map
Must show:
- current region fully
- adjacent region locked preview
- far regions fogged
- quest nodes
- boss gates
- animated unlocks

4. Skill Tree
Must show:
- skill trees
- locked/unlocked/available states
- evidence requirement per skill
- connection lines if possible

5. Evidence Vault
Must show:
- artifact collection
- rarity
- source quest
- career value
- LinkedIn/blog/portfolio/resume suggestions

6. Review Deck
Must show:
- due cards
- prompt first
- reveal answer
- confidence rating
- next review update

7. Bonus Dungeon Shop
Must show:
- available bonus dungeons
- locked bonus dungeons
- gold cost
- prerequisites
- portfolio value

8. Campfire Journal
Must show:
- completed quest history
- reflections
- session recaps
- export/import save data

9. Reward Ceremony Overlay
Must show after quest completion:
- XP gained
- gold gained
- skills unlocked
- artifact unlocked
- evidence suggestions
- next unlocked quest
- continue adventure button

Animation:
Use Framer Motion or equivalent.
Animations should be smooth, purposeful, and restrained.
Respect prefers-reduced-motion.
Transitions:
- map node click zoom/slide
- quest completion glow
- artifact collected animation
- reward count-up
- skill unlock shimmer

============================================================
13. TECHNICAL REQUIREMENTS
============================================================

Build a static, local-first PWA-ready web app.

Recommended stack:
- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Zustand or reducer-based state
- localStorage for MVP persistence
- Optional IndexedDB abstraction if needed, but do not overcomplicate
- Vitest for core engine tests

No backend.
No login.
No cloud sync.
No external AI API.
No external database.
No paid service.
No server components.
No real social posting integration.
No analytics tracking.

The app should be deployable to GitHub Pages.

Include:
- package.json
- vite config
- TypeScript config
- Tailwind config
- README.md
- clean source structure
- sample seed data
- tests for unlock/reward/review engines
- export/import save JSON

Use mock data and local state.

============================================================
14. ARCHITECTURE REQUIREMENTS
============================================================

This codebase must be clean, elegant, maintainable, and scalable.

Do NOT create a giant App.tsx.
Do NOT hardcode quest logic inside JSX.
Do NOT mix content data with rendering logic.
Do NOT use dozens of booleans for complex progression.
Do NOT create copy-pasted components.
Do NOT implement fake buttons that do nothing.
Do NOT create a beautiful but unmaintainable prototype.
Do NOT create a backend.
Do NOT make the app depend on network calls.

Use a feature-based structure:

src/
  app/
    App.tsx
    routes.tsx or navigation.ts
    providers.tsx
  content/
    campaigns.ts
    quests.ts
    skills.ts
    artifacts.ts
    reviewCards.ts
    bonusDungeons.ts
    npcDialogues.ts
  engine/
    unlockEngine.ts
    questEngine.ts
    rewardEngine.ts
    reviewEngine.ts
    evidenceEngine.ts
    sprintEngine.ts
  features/
    hall/
    map/
    quests/
    skills/
    evidence/
    review/
    shop/
    journal/
    rewards/
  components/
    ui/
    layout/
    icons/
  store/
    playerStore.ts
    persistence.ts
  types/
    domain.ts
  lib/
    date.ts
    ids.ts
    formatting.ts
  tests/
    unlockEngine.test.ts
    rewardEngine.test.ts
    reviewEngine.test.ts

Domain types should include:

PlayerState
Campaign
Region
MapNode
Quest
QuestProgress
EvidenceSubmission
Artifact
SkillNode
ReviewCard
BonusDungeon
RewardBundle
NPCDialogue
SessionRecap
EnergyMode

Core engines:

unlockEngine:
- determines available quests
- determines map visibility
- handles fog of war
- checks prerequisites
- prevents skipping

questEngine:
- selects today's recommended quest
- handles quest completion eligibility
- supports Deep Work Sprint next quest

rewardEngine:
- calculates XP/gold/skill/reputation/insight
- unlocks artifacts
- unlocks titles

reviewEngine:
- handles due cards
- updates review interval based on rating

evidenceEngine:
- validates evidence submission
- maps artifacts to LinkedIn/blog/portfolio/resume suggestions

sprintEngine:
- lets player complete multiple quests in one session
- creates session recap

============================================================
15. CONTENT MODEL
============================================================

Use strongly typed TypeScript content files.

Example Quest type:

type Quest = {
  id: string;
  title: string;
  code: string;
  regionId: string;
  type: "main" | "training" | "drill" | "reflection" | "boss" | "bonus";
  narrativeHook: string;
  objective: string;
  whyItMatters: string;
  prerequisites: string[];
  definitionOfDone: string[];
  evidenceRequired: EvidenceRequirement[];
  skills: string[];
  artifactIds: string[];
  rewards: RewardBundle;
  aiPrompt: string;
  resources: ResourceRef[];
  commonTraps: string[];
  interviewExplanation: string;
  nextRisk: string;
  unlocks: string[];
};

EvidenceRequirement should support:
- commit_hash
- screenshot_note
- text_reflection
- benchmark_file
- doc_section
- code_snippet
- blog_draft
- linkedin_draft
- portfolio_note

For MVP, evidence fields can be text fields.
Do not implement real file upload unless simple and safe.
Allow optional URL/path fields for screenshots and reports.

============================================================
16. AI SKILL / CURSOR PROMPTS INSIDE APP
============================================================

Each quest detail page must include a copyable "AI Skill / Cursor Prompt".

Example prompt for M2:

"You are helping me complete Unity Native Boundary Lab M2 — First P/Invoke Call only.

Do not jump to M3, Agent Swarm, Benchmark, Android, XR, SIMD, or render-thread work.

My goal:
Unity C# calls native NblGetVersionMajor/Minor/Patch through DllImport and prints the version in the Unity Editor.

Please guide me with:
1. Concept graph
2. File changes
3. Implementation steps
4. Validation
5. Debugging checklist
6. Performance notes
7. Interview explanation
8. Commit message

Keep the scope tight."

Each quest should have a tailored prompt like this.

============================================================
17. PERSONAL SHOWCASE PROMPTS
============================================================

Evidence Vault must generate showcase prompts.

For artifacts such as Boundary Cost Report, generate:

- LinkedIn draft outline
- blog post outline
- portfolio card copy
- resume bullet
- interview answer

Example:

LinkedIn prompt:
"Draft a technical LinkedIn post explaining why native C++ is not automatically faster in Unity interop. Use my Agent Swarm Benchmark as evidence. Mention C# naive, Burst baseline, native per-agent anti-pattern, and native batched path. Keep the tone humble and engineering-focused."

Blog prompt:
"Write a blog outline for my Unity Native Boundary Lab benchmark methodology. Focus on fixed seed, warmup, median/p95, GC allocation, native calls/frame, checksum validation, and why rendering cost must be separated."

Resume bullet:
"Built a Unity 6.3 UPM package backed by a C++20 native runtime, exposing a stable C ABI and SDK-style C# wrapper; implemented benchmark tooling comparing managed C#, Burst, native per-call P/Invoke, and native batched execution."

============================================================
18. BINGE / DEEP WORK SPRINT DESIGN
============================================================

The player asked specifically whether they can push many levels when feeling good.

Implement this explicitly.

After completing a quest:
- Show Reward Ceremony.
- Show "Rest at Campfire" and "Continue Adventure" buttons.
- Continue Adventure should load the next unlocked quest if available.
- If next quest is a boss, clearly label it.
- If no quest is available because evidence is missing, explain what is missing.
- If next region is locked, show boss gate requirements.

Deep Work Sprint session:
- Begins when user selects Deep Work Mode.
- Tracks quests completed in this session.
- Tracks artifacts collected.
- Tracks skills unlocked.
- At session end, generate Session Recap:
  - completed quests
  - evidence created
  - public showcase suggestions
  - next risk
  - next recommended quest

Do not time-lock progression by day.
Do not require waiting until tomorrow.
The app should support both daily rhythm and high-energy sprints.

============================================================
19. GUARDRAILS AGAINST SCOPE CREEP
============================================================

The app must actively prevent distraction.

Examples:
- XR, Android, SIMD, render-thread, Unreal, and full deterministic kernel are fogged/locked early.
- Bonus dungeons are locked until prerequisites.
- Today's recommendation should never include far-future topics.
- UI should not display long future task lists.
- Mentor dialogue should remind player to focus on current region.

Include a "Forbidden For Now" panel in quest details:
For early quests M0-M3:
- Do not start XR.
- Do not start Android.
- Do not start SIMD.
- Do not start render-thread plugin events.
- Do not build full deterministic simulation kernel.
- Do not open random courses unless they unblock the current quest.

============================================================
20. LANGUAGE AND TONE
============================================================

The app's main UI language should be Chinese.

Use English technical terms when appropriate, especially:
- Unity
- C++
- C#
- P/Invoke
- C ABI
- RAII
- IDisposable
- Burst
- Benchmark
- Native Plugin
- UPM
- Android IL2CPP
- Deterministic Simulation

Tone:
- warm
- precise
- motivating
- not childish
- not cringe
- not over-gamified
- not corporate
- not too verbose on the main screen

Use concise UI copy.
Long explanations belong in quest detail pages.

============================================================
21. ACCESSIBILITY AND QUALITY
============================================================

Requirements:
- Keyboard navigable.
- Clear focus states.
- Sufficient contrast.
- Responsive desktop/tablet/mobile layout.
- Reduced motion support.
- No autoplay audio.
- No hidden critical information.
- Buttons must have clear labels.
- Empty states must be friendly and useful.
- Loading states if needed.
- Error states for invalid save import.

Performance:
- Avoid heavy animations.
- Avoid huge particle systems.
- Avoid excessive re-renders.
- Use memoization only where useful.
- Keep state predictable.

============================================================
22. MVP ACCEPTANCE CRITERIA
============================================================

The MVP is done only if:

1. App runs locally with npm install and npm run dev.
2. App builds with npm run build.
3. No TypeScript errors.
4. Home / Hearth Hall is functional.
5. Campaign Map is functional with fog of war.
6. Quest Detail page is functional.
7. Evidence submission works.
8. Quest completion updates persistent state.
9. Reward ceremony appears.
10. Artifacts unlock and appear in Evidence Vault.
11. Skill nodes unlock.
12. Review Deck has due cards and rating interaction.
13. Bonus Dungeon Shop displays locked/unlocked dungeons.
14. Deep Work Sprint supports completing multiple quests.
15. Save data persists across refresh.
16. Export/import save JSON works.
17. Core engine tests pass.
18. README explains how to run and deploy.
19. Code structure follows the architecture above.
20. No major feature is a fake non-functional placeholder.

============================================================
23. DELIVERABLES
============================================================

Create all necessary files.

At minimum include:

- package.json
- index.html
- vite.config.ts
- tsconfig files
- tailwind config
- src/ with full implementation
- README.md
- optional docs/ARCHITECTURE.md
- tests for engines
- seed content for M0-M13
- seed artifacts
- seed skills
- seed review cards
- seed bonus dungeons
- seed NPC dialogue

After implementation:
- Run formatting if configured.
- Run tests.
- Run build.
- Fix errors.
- In your final response, summarize:
  - what was built
  - how to run
  - how to deploy
  - how to edit content
  - remaining limitations

============================================================
24. DESIGN QUALITY BAR
============================================================

Aim for a polished, emotionally compelling MVP.

This app should make the player feel:

- "I know exactly what to do today."
- "I am not drowning in resources."
- "My path is visible, but not overwhelming."
- "My project work is turning into career evidence."
- "I want to come back tomorrow."
- "When I have energy, I can push further."
- "This feels like my personal academy."

Do not optimize only for visual beauty.
Optimize for daily return, clarity, evidence, progression, and maintainability.

The final product should feel like:
Duolingo's daily clarity
+ a cozy RPG academy
+ a game developer's quest map
+ a serious engineering portfolio system
+ a personal transformation cockpit.

Build it now.