# TCM Brain Clinical Session - Complete Asset Inventory (DNA Map)
## Version: 2026-01-09 | Status: Production

---

## A. VISUAL LAYOUT MAP (XY Grid)

### 1. Page Container Structure

```
┌─────────────────────────────────────────────────────────────────┐
│ HEADER (sticky top-0 z-50)                                      │
│ bg-gradient-to-r from-emerald-900/20 via-emerald-800/10         │
├─────────────────────────────────────────────────────────────────┤
│ AI TRUST HEADER (AITrustHeader component)                       │
├─────────────────────────────────────────────────────────────────┤
│ TCM TURBO DASHBOARD (TcmTurboDashboard - status indicator)      │
│ px-4 py-2 border-b                                              │
├─────────────────────────────────────────────────────────────────┤
│                        MAIN SPLIT LAYOUT                        │
│ ┌─────────────────────────────┬─────────────────────────────┐   │
│ │  LEFT COLUMN (66%)          │  RIGHT COLUMN (33%)         │   │
│ │  lg:col-span-8              │  lg:col-span-4              │   │
│ │                             │                             │   │
│ │  - Phase Indicator          │  - Clinical Stacking Btn    │   │
│ │  - Session Header Boxes     │  - Hebrew Topic Questions   │   │
│ │  - Customizable Toolbar     │  - Quick Actions            │   │
│ │  - Main Tabs (6 tabs)       │  - Pediatric Assistant      │   │
│ │                             │  - Herb Encyclopedia        │   │
│ │                             │  - Hebrew Q&A Dropdowns     │   │
│ │                             │  - Q&A Suggestions          │   │
│ └─────────────────────────────┴─────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│ ECONOMY MONITOR (Fixed position: bottom-5 right-5 z-[9999])     │
│ #economy-monitor - Fixed overlay, NO document flow impact       │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Container Classes & Dimensions

| Container | Class | Position | Z-Index |
|-----------|-------|----------|---------|
| Page Root | `min-h-screen bg-background flex flex-col overflow-hidden` | Static | - |
| Header | `border-b bg-gradient-to-r ... sticky top-0 z-50` | Sticky | 50 |
| Turbo Dashboard | `px-4 py-2 border-b shrink-0` | Static | - |
| Left Column | `lg:col-span-8 flex flex-col h-full border-r bg-card/30` | Static | - |
| Right Column | `lg:col-span-4 h-full overflow-y-auto bg-slate-50 dark:bg-slate-900/50 p-4` | Static | - |
| Economy Monitor | `fixed bottom-5 right-5 z-[9999]` | **FIXED** | 9999 |

### 3. Fixed/Sticky Elements

| Element | CSS Position | Location |
|---------|--------------|----------|
| Header | `sticky top-0` | Top |
| Economy Monitor | `fixed bottom-5 right-5` | Bottom-Right |
| Dialogs | `fixed` (Radix default) | Centered |

---

## B. CLINICAL CONTENT INVENTORY

### 1. Hebrew Question Box Mappings (20 Indexed Prompts)

**Source File:** `src/data/tcm-prompt-mapping.ts`  
**Data Structure:** `PromptMapping[]` with Map indexes for O(1) lookup

| ID | Hebrew Label | Role | Icon |
|----|--------------|------|------|
| `kidney-yin-yang` | סימנים יין/יאנג כליות | Clinical Differential | 🫘 |
| `liver-stagnation-rising` | סטגנציה מול עליית יאנג | Clinical Differential | 🌿 |
| `spleen-damp-heat` | לחות חמה בטחול | Treatment Strategy | 💧 |
| `auricular-shen` | נקודות Shen באוזן | Point Selection | 👂 |
| `liver-spleen-ke` | מעגל הבקרה כבד/טחול | Pathology Analysis | 🔄 |
| `lung-kidney-respiration` | ריאות וכליות - נשימה | Physiology | 🫁 |
| `wei-qi-strengthen` | חיזוק Wei Qi | Preventive | 🛡️ |
| `pulse-deficiency-stagnation` | דופק חוסר מול סטגנציה | Diagnosis | 💓 |
| `tongue-spleen-qi` | חולשת צ׳י בטחול | Diagnosis | 👅 |
| `san-jiao-functions` | San Jiao תפקודים | Physiology | 🔥 |
| `blood-stasis` | סטגנציית דם | Clinical Differential | 🩸 |
| `phlegm-patterns` | דפוסי ליחה | Treatment Strategy | ☁️ |
| `heart-kidney-axis` | ציר לב-כליות | Physiology | ❤️ |
| `wind-patterns` | דפוסי רוח | Pathology Analysis | 🌬️ |
| `jing-essence` | ג׳ינג - מהות | Physiology | ✨ |
| `zang-fu-relationships` | יחסי זאנג-פו | Pathology Analysis | 🏛️ |
| `qi-flow-disorders` | הפרעות זרימת צ׳י | Clinical Differential | 🌊 |
| `yin-deficiency-heat` | חום מחוסר יין | Treatment Strategy | 🌙 |
| `yang-deficiency-cold` | קור מחוסר יאנג | Treatment Strategy | ❄️ |
| `shen-disturbance` | הפרעות שן | Point Selection | 🧠 |

**Data Loading:** Pulled from TypeScript module, NOT hard-coded HTML.  
**Indexed Retrieval:** Uses `Map<string, PromptMapping>` for O(1) lookups.

### 2. Quick Action Boxes (13 Total, 6 Active Default)

**Source File:** `src/components/tcm-brain/QuickActionBoxes.tsx`  
**Storage Key:** `tcm-brain-quick-action-boxes-v2`

| ID | Name | Hebrew | Icon | Prompt |
|----|------|--------|------|--------|
| `pattern-id` | Pattern ID | זיהוי דפוס | Wand2 | TCM pattern diagnosis |
| `protocol-gen` | Protocol Gen | יצירת פרוטוקול | ClipboardList | Full treatment protocol |
| `auto-notes` | Auto Notes | הערות אוטו | ScrollText | Session notes generation |
| `herbal-rx` | Herbal Rx | מרשם צמחי | Pill | Herbal prescription |
| `acu-points` | Acu Points | נקודות דיקור | Target | Acupoint recommendations |
| `patient-handout` | Patient Handout | דף למטופל | Lightbulb | Patient education |
| `intake-review` | Intake Review | סקירת קליטה | ClipboardCheck | Form review |
| `diff-patterns` | Diff Patterns | דפוסים מבדילים | Brain | Pattern differentiation |
| `next-steps` | Next Steps | צעדים הבאים | Activity | Follow-up planning |
| `safety-check` | Safety Check | בדיקת בטיחות | Shield | Risk assessment |
| `case-report` | Case Report | דוח מקרה | BookOpen | Documentation |
| `ai-second-opinion` | AI 2nd Opinion | דעה שנייה AI | Sparkles | AI consultation |
| `wellness-plan` | Wellness Plan | תוכנית בריאות | Heart | Lifestyle guidance |

**Default Active:** `['pattern-id', 'protocol-gen', 'auto-notes', 'herbal-rx', 'acu-points', 'patient-handout']`

### 3. Knowledge Assets (28 Total)

**Source File:** `src/components/tcm-brain/KnowledgeAssetTabs.tsx`  
**Categories:** diagnostics, treatment, specialties, lifestyle, reference

| Category | Count | Examples |
|----------|-------|----------|
| Diagnostics | 6 | Chief Complaints, Pulse Reference, Tongue Diagnosis |
| Treatment | 8 | Treatment Planning, Acupuncture Points, Herbal Formulas |
| Specialties | 9 | Women's Health, Brain Health, Grief/Trauma Q&A |
| Lifestyle | 3 | Diet & Nutrition, Stress & Burnout, Weather |
| Reference | 2 | Allergies, Professional Q&A |

---

## C. LOGIC & API MAPPING

### 1. Main Input Prompt Box

**Component:** `DiagnosticsTab.tsx`  
**Location:** Lines 106-117  
**Element:** `<Input>` inside "Auto-Chain Diagnostic Workflow" Card

```tsx
<Input
  placeholder="Describe patient symptoms..."
  value={input}
  onChange={(e) => setInput(e.target.value)}
  onKeyDown={(e) => e.key === 'Enter' && handleRunWorkflow()}
  disabled={isLoading}
  className="flex-1"
/>
```

**Handler:** `handleRunWorkflow()` → Dispatches `tcm-query-start` event → Calls `onSendMessage(input.trim())`

### 2. RAG Output Container

**Component:** `AIResponseDisplay` (referenced in DiagnosticsTab line 251)  
**Props:** `content`, `query`, `isLoading`, `onViewBodyMap`

```tsx
<AIResponseDisplay
  isLoading={isLoading}
  content={lastAssistantMessage?.content || ''}
  query={lastUserMessage?.content || ''}
  onViewBodyMap={onViewBodyMap}
/>
```

### 3. Token/Time Counter Logic (Economy Monitor)

**Component:** `src/components/tcm-brain/EconomyMonitor.tsx`  
**Position:** `fixed bottom-5 right-5 z-[9999]`  
**NO SCREEN SHAKING** - Uses `position: fixed` and `pointerEvents: 'none'`

```tsx
<div 
  id="economy-monitor"
  className="fixed bottom-5 right-5 bg-black/95 text-green-400 p-4 rounded-xl 
             font-mono text-xs z-[9999] border border-green-500/30 shadow-2xl 
             shadow-green-900/20 min-w-[220px] backdrop-blur-sm"
  style={{ pointerEvents: 'none' }}
>
```

**Cost Calculation:** `src/hooks/useClinicalSession.ts`
```typescript
const COST_PER_1K_TOKENS = 0.0001; // Gemini Flash rate
totalCost = (totalTokens / 1000) * COST_PER_1K_TOKENS;
```

### 4. Multi-Query Stacking System

**Hook:** `src/hooks/useClinicalSession.ts`  
**State:** `stackedQueries: PromptMapping[]`

| Function | Purpose |
|----------|---------|
| `addToStack(mapping)` | Add to basket (prevents duplicates) |
| `removeFromStack(id)` | Remove single item |
| `clearStack()` | Clear all |
| `buildCombinedPrompt()` | Concatenate all `fullAiPrompt` into single API call |
| `updateMetrics(tokens, timeMs)` | Update economy monitor |

**Prompt Template:**
```
SYSTEM: You are a TCM Clinical Assistant. Use ONLY the provided clinical context.

=== DIRECT CLINICAL CONTEXT (Pre-indexed) ===
[1] {hebrewLabel}
{fullAiPrompt}
---
[2] {hebrewLabel}
{fullAiPrompt}

=== OUTPUT INSTRUCTIONS ===
Combined Diagnosis | Primary Points | Herbal Formula | Clinical Notes
```

---

## D. ASSET MANIFEST

### 1. Body Figures & SVG Assets

**Component:** `src/components/tcm-brain/BodyMapTab.tsx`  
**Sub-components:**
- `BodyFigureSelector` - Browse all body figures
- `RAGBodyFigureDisplay` - AI-suggested points overlay

**Body Figure Files Referenced:**
- Anterior/Posterior body maps
- Meridian pathway diagrams
- Auricular (ear) charts
- Hand/foot reflexology maps

### 2. Tab Z-Index Stack (Resolved Order)

| Element | Z-Index | Notes |
|---------|---------|-------|
| Economy Monitor | 9999 | Always on top |
| Dialogs (Radix) | ~50-100 | Modal overlays |
| Header | 50 | Sticky navigation |
| Main Content | Auto | Normal flow |
| Body Map Canvas | Auto | Within tab content |

### 3. Main Tabs Structure

**Location:** TcmBrain.tsx lines 430-467

| Tab ID | Label | Icon | Description |
|--------|-------|------|-------------|
| `diagnostics` | Diagnostics | Stethoscope | P1-P2 Priority |
| `symptoms` | Symptoms | Brain | P3 Priority |
| `treatment` | Treatment | Pill | P4-P6 Priority |
| `bodymap` | Body Map | UserIcon | Point visualization |
| `session` | Session | FileText | Notes |
| `history` | History | Clock | Patient records |

---

## E. THIRD-PARTY CONNECTIONS

### 1. AI API Endpoint

**Primary:** Lovable AI with supported models (Gemini Flash 2.5, GPT-5, etc.)  
**Invocation:** `streamChat()` from `useTcmBrainState` hook  
**No direct Gemini API key required** - Uses Lovable Cloud proxy

### 2. External AI Fallback

**Component:** `ExternalAIFallbackCard`  
**Providers:** Perplexity, ChatGPT, Claude (popup logic)  
**Trigger:** When RAG returns 0 chunks

### 3. Turbo Dashboard Status

**States:** `standby` | `scanning` | `locked` | `external` | `fail`

```typescript
const turboDashboardStatus = useMemo(() => {
  if (isLoading || isStreaming) return 'scanning';
  if (!lastRagStats || lastRagStats.chunksFound === 0) return 'fail';
  if (lastRagStats.isExternal) return 'external';
  return lastRagStats.chunksFound > 0 ? 'locked' : 'fail';
}, [isLoading, isStreaming, lastRagStats]);
```

---

## F. STATE MANAGEMENT SUMMARY

### Local Storage Keys

| Key | Purpose | Component |
|-----|---------|-----------|
| `tcm-brain-quick-action-boxes-v2` | Quick Action config | QuickActionBoxes |
| `tcm-qa-favorites` | Favorited questions | HebrewTopicQuestionsDialog |
| `tcm-point-presets` | Saved point combinations | BodyMapTab |
| `tcm-brain-favorite-assets` | Favorited knowledge assets | KnowledgeAssetTabs |

### Key Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useTcmBrainState` | hooks/useTcmBrainState.ts | Main AI state, messages, patients |
| `useClinicalSession` | hooks/useClinicalSession.ts | Multi-query stacking |
| `useSessionPhase` | hooks/useSessionPhase.ts | Session phase tracking |
| `useAutoSave` | hooks/useAutoSave.ts | Auto-save functionality |
| `useSessionHeaderBoxes` | hooks/useSessionHeaderBoxes.ts | Shared action box config |

---

## G. FILE MANIFEST

### Core Files

```
src/pages/TcmBrain.tsx              # Main page (645 lines)
src/data/tcm-prompt-mapping.ts      # 20 indexed prompts (217 lines)
src/hooks/useClinicalSession.ts     # Stacking logic (100 lines)
src/components/tcm-brain/
  ├── EconomyMonitor.tsx            # Fixed token counter (108 lines)
  ├── ClinicalStackingDialog.tsx    # Multi-query dialog
  ├── ClinicalStackBar.tsx          # Basket visualization
  ├── DiagnosticsTab.tsx            # Main input tab (260 lines)
  ├── QuickActionBoxes.tsx          # 13 action boxes (406 lines)
  ├── BodyMapTab.tsx                # Body figures (283 lines)
  ├── KnowledgeAssetTabs.tsx        # 28 assets (801 lines)
  ├── HebrewQADropdowns.tsx         # Hebrew Q&A
  ├── HebrewTopicQuestionsDialog.tsx # 450+ questions
  └── [16 more components...]
```

---

*Document generated: 2026-01-09*  
*Purpose: Pre-reorganization asset preservation*
