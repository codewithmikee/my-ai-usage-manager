# LimitTracker - Inline Workflow Enhancement Plan

**Status:** Proposed  
**Last updated:** 2026-06-07  
**Goal:** Rework the core tracking flow so tools stay in the left sidebar, tool-level session ranges are managed inline, and credentials can toggle or edit session state with minimal friction.

---

## Product intent

The target experience is a compact operational workflow:

- tools remain the main navigation on the left
- creating a tool is inline and immediate
- each selected tool owns a reusable set of session ranges
- credentials live directly under the selected tool
- each credential can attach, toggle, edit, and remove session items quickly
- inline editing is preferred over modal-heavy flows

This plan is intended as a handoff document for implementation agents.

---

## Current model mapping

The implementation should build on the current data model rather than inventing a parallel one.

- `Product` maps to **Tool**
- `Cycle` maps to **Session range**
- `Account` maps to **Credential**
- `Account.limits[cycleId]` maps to **per-credential session state**

This means the planned UX is primarily a workflow and interaction refactor layered onto the existing persisted store and sync model.

---

## Objectives

- **Inline-first workflow:** add and edit tools and credentials directly in context.
- **Reusable ranges:** define session ranges once at the tool level and reuse them across credentials.
- **Fast session control:** single click toggles reached/available, while double click or long press handles edit/delete.
- **Low-friction maintenance:** make common actions visible and secondary actions contextual.
- **Keep current persistence model:** preserve local storage persistence and Supabase sync.

## Non-goals

- No provider API integrations or automatic quota detection.
- No usage history, analytics, charts, or prediction logic.
- No bulk actions across all credentials.
- No routing overhaul.
- No drag-and-drop ordering in this iteration.

---

## Phase 0 - Model alignment and guardrails

**Goal:** Confirm that implementation targets the current cycle-based store shape rather than older legacy timer assumptions.

### Deliverables
- Confirm `Product` / `Cycle` / `Account` / `limits` remain the canonical persisted model.
- Identify any remaining legacy assumptions in docs or UI logic that still treat `availableAt` as the primary source of truth.
- Document how the new workflow maps onto existing import/export and Supabase sync behavior before feature work starts.

### Likely files
- [AGENTS.md](C:/Users/Dell%20XPS/projects/my-ai-usage-manager/AGENTS.md)
- [USER_STORIES.md](C:/Users/Dell%20XPS/projects/my-ai-usage-manager/USER_STORIES.md)
- [ENHANCEMENT_PLAN.md](C:/Users/Dell%20XPS/projects/my-ai-usage-manager/ENHANCEMENT_PLAN.md)
- [lib/store.ts](C:/Users/Dell%20XPS/projects/my-ai-usage-manager/lib/store.ts)
- [components/SupabaseSync.tsx](C:/Users/Dell%20XPS/projects/my-ai-usage-manager/components/SupabaseSync.tsx)

### Notes
- This is a short prerequisite phase, not a major refactor.
- The goal is to prevent implementation work from being planned against stale documentation or legacy field behavior.

---

## Phase 1 - Tool workflow refactor

**Goal:** Keep tools as left-side tabs and make tool creation/rename inline.

### Deliverables
- Sidebar remains the primary tool selector.
- Add-tool flow becomes an inline input inside the sidebar list.
- Pressing Enter creates and selects the new tool.
- Selected tool title in the main panel supports double-click rename.

### Likely files
- [src/App.tsx](C:/Users/Dell%20XPS/projects/my-ai-usage-manager/src/App.tsx)
- [components/EditableText.tsx](C:/Users/Dell%20XPS/projects/my-ai-usage-manager/components/EditableText.tsx)
- [lib/store.ts](C:/Users/Dell%20XPS/projects/my-ai-usage-manager/lib/store.ts)

### Notes
- The current add-tool popover should be replaced or simplified.
- Tool creation should avoid forcing a preset-only workflow.
- Existing preset support can remain as an optional quick-start path if it does not complicate the inline flow.

---

## Phase 2 - Tool-level session range management

**Goal:** Add a dedicated range management area under the selected tool title.

### Deliverables
- Show all reusable session ranges for the selected tool.
- Support add, edit, and delete for ranges.
- Introduce a reusable range editor with:
  - numeric input
  - unit selector: minutes, hours, days, months
- Save ranges back into the existing tool/cycle model.

### Likely files
- [src/App.tsx](C:/Users/Dell%20XPS/projects/my-ai-usage-manager/src/App.tsx)
- [lib/store.ts](C:/Users/Dell%20XPS/projects/my-ai-usage-manager/lib/store.ts)
- [lib/cycles.ts](C:/Users/Dell%20XPS/projects/my-ai-usage-manager/lib/cycles.ts)
- new component(s) for range editing and display

### Notes
- Existing preset cycles can seed tools but should not block custom range creation.
- The current `Cycle` type may need a slightly clearer editable shape for value/unit-based ranges.
- If the current persisted shape only stores `durationMs`, the UI layer may need helper conversion logic for months.

---

## Phase 3 - Credential list restructure

**Goal:** Turn the main credential area into a compact list that supports inline add, rename, contextual delete, and attached session items.

### Deliverables
- Inline credential creation area under the selected tool.
- Credential name supports double-click inline edit.
- Credential rows follow the structure:
  - account name
  - attached session items
  - add-session action
  - contextual delete action
- Row delete remains hidden until active/hovered/focused.

### Likely files
- [src/App.tsx](C:/Users/Dell%20XPS/projects/my-ai-usage-manager/src/App.tsx)
- [components/AccountRow.tsx](C:/Users/Dell%20XPS/projects/my-ai-usage-manager/components/AccountRow.tsx)
- [components/EditableText.tsx](C:/Users/Dell%20XPS/projects/my-ai-usage-manager/components/EditableText.tsx)
- [lib/store.ts](C:/Users/Dell%20XPS/projects/my-ai-usage-manager/lib/store.ts)

### Notes
- The current account row is oriented around active limit chips and "Hit X" buttons.
- This phase changes the row shape from action-first to session-management-first.

---

## Phase 4 - Per-credential session item behavior

**Goal:** Make each attached session item directly interactive.

### Deliverables
- A credential can attach one or more of the tool's ranges.
- Single click toggles whether the session is currently reached.
- Double click or long press reveals edit and delete actions.
- Delete removes the session item from that credential only.
- State changes persist to the existing store and sync flow.

### Likely files
- [components/AccountRow.tsx](C:/Users/Dell%20XPS/projects/my-ai-usage-manager/components/AccountRow.tsx)
- [lib/store.ts](C:/Users/Dell%20XPS/projects/my-ai-usage-manager/lib/store.ts)
- supporting UI components for session item rendering/actions

### Notes
- The current store assumes a `limits` map keyed by cycle id, which is a good fit.
- Decide whether every tool-level range should be automatically visible on every credential, or whether credentials opt into specific session items.
- The chosen behavior must be consistent across add, edit, delete, import/export, and sync.

---

## Phase 5 - Session value editing

**Goal:** Let users set or update the next session end date and time quickly.

### Deliverables
- Editing a session item opens a simple date-time picker.
- The editor supports set, update, and clear actions.
- Updated values are visible immediately on the row.
- Editing works cleanly for both available and reached states.

### Likely files
- [components/LimitTimerPopover.tsx](C:/Users/Dell%20XPS/projects/my-ai-usage-manager/components/LimitTimerPopover.tsx)
- [components/AccountRow.tsx](C:/Users/Dell%20XPS/projects/my-ai-usage-manager/components/AccountRow.tsx)
- [lib/store.ts](C:/Users/Dell%20XPS/projects/my-ai-usage-manager/lib/store.ts)

### Notes
- The existing time popover may be reusable if simplified.
- If toggling a session to reached should auto-fill an end value, that logic belongs here and must be specified explicitly.

---

## Phase 6 - Empty states, polish, and cleanup

**Goal:** Make the new workflow easy to understand and resilient in edge cases.

### Deliverables
- Clear empty state when no tools exist.
- Clear empty state when a tool has no ranges yet.
- Clear empty state when a tool has no credentials yet.
- Contextual visibility for destructive actions.
- Consistent inline edit behavior across tools and credentials.
- Preserve current sync, notifications, and theme behavior unless directly affected by the workflow refactor.

### Likely files
- [src/App.tsx](C:/Users/Dell%20XPS/projects/my-ai-usage-manager/src/App.tsx)
- [components/SyncIndicator.tsx](C:/Users/Dell%20XPS/projects/my-ai-usage-manager/components/SyncIndicator.tsx)
- [components/NotificationManager.tsx](C:/Users/Dell%20XPS/projects/my-ai-usage-manager/components/NotificationManager.tsx)

---

## Suggested ticket split

1. **Sidebar tool flow**
   - inline add tool
   - select tool
   - double-click rename selected tool

2. **Tool-level session range manager**
   - list ranges
   - add/edit/delete range
   - reusable value + unit editor

3. **Credential list refactor**
   - inline add credential
   - inline rename
   - contextual delete
   - compact row structure

4. **Session item interactions**
   - attach range to credential
   - single-click toggle
   - double-click or long-press actions
   - delete session item

5. **Session date-time editor**
   - simple picker
   - set/update/clear next value
   - connect to persisted session state

6. **QA and polish**
   - empty states
   - interaction consistency
   - sync/import/export regression pass

---

## Open decisions

These need to be answered before implementation is fully parallelized:

1. **Credential attachment model**
   - Should every tool-level range automatically exist on every credential?
   - Or should credentials opt into specific ranges individually?

2. **Toggle behavior**
   - When toggling a session from available to reached, should the app:
     - only flip the boolean/state, or
     - also auto-populate the next end value from the range duration?

3. **Range deletion behavior**
   - If a tool-level range is deleted, should all related credential session state be deleted automatically?

4. **Month handling**
   - If `months` are supported in the editor, should they remain calendar-aware or be converted to a fixed millisecond approximation in persistence?

---

## Risks and implementation watch-outs

- **Store/UI mismatch:** the current UI uses cycle buttons and active-limit chips; the new workflow is more direct-manipulation oriented.
- **Legacy data behavior:** legacy `availableAt` fields still exist in some migration paths and should not leak into the new UX logic.
- **Sorting logic:** current account sorting still leans on legacy availability assumptions and may need to be redefined once per-session attachment behavior is finalized.
- **Import/export compatibility:** any change to how ranges attach to credentials must remain backward-compatible with existing exported data, or include migration logic.
- **Sync stability:** the Supabase sync layer should continue to treat tool, range, and credential edits as normal store mutations without introducing write loops.

---

## Definition of done

- Tools are still selected from the left sidebar, and new tools can be added inline.
- The selected tool can be renamed inline and manage its reusable session ranges directly.
- Credentials can be added inline, renamed inline, and removed contextually.
- Each credential can toggle, edit, and remove session items with the intended single-click and double-click/long-press behaviors.
- Session values can be set with a simple date-time picker.
- Local persistence and Supabase sync continue to work for the new flow.
