# LimitTracker - Planned User Stories

User stories for the next product iteration of LimitTracker. This document is intentionally forward-looking: it describes the desired inline workflow for tools, session ranges, and credentials so the work can be split across implementation agents.

Terminology for this plan:
- Tool = current `Product`
- Session range = current tool-level `Cycle`
- Credential = current `Account`
- Session state = current per-account `limits[cycleId]`

Format:
- each story uses the standard As a / I want / So that format
- each story includes acceptance criteria that can be used for implementation and review

Total: 13 stories across 4 themes.

- Tools and selection flow - 3
- Session range management - 3
- Credentials and per-session control - 6
- Interaction polish - 1

---

## 1. Tools and selection flow

### US-01 - Inline add tool from left sidebar
**As a** user tracking multiple AI tools
**I want to** add a tool directly from the left sidebar
**So that** I can create and start configuring it without leaving the main workflow.

**Acceptance criteria**
- The left sidebar continues to be the primary tool selector.
- A new-tool action appears in the sidebar.
- Triggering the action opens an inline text input inside the tool list.
- Pressing Enter creates the tool.
- The new tool becomes selected immediately after creation.
- Empty submissions do not create a tool.

### US-02 - Rename selected tool inline
**As a** user
**I want to** rename the selected tool by double-clicking its title
**So that** I can keep tool labels accurate without opening a separate edit screen.

**Acceptance criteria**
- The selected tool title in the main panel is editable on double click.
- Enter or blur saves the updated name.
- Escape cancels the rename and restores the previous value.
- The updated name is reflected everywhere the tool appears.

### US-03 - Left-side tool tabs remain the main navigation
**As a** user with many tracked tools
**I want to** keep tools as left-side tabs
**So that** switching between tools stays fast and predictable.

**Acceptance criteria**
- The sidebar remains the primary navigation for tools.
- Selecting a tool updates the main panel without a route change.
- The selected state is obvious.
- Adding a tool does not interrupt the ability to switch to another tool.

---

## 2. Session range management

### US-04 - Manage reusable session ranges on the selected tool
**As a** user
**I want to** manage reusable session ranges under the selected tool title
**So that** every credential under that tool can use a shared set of limit types.

**Acceptance criteria**
- The selected tool view includes a dedicated range management area below the title.
- I can create a new session range for the selected tool.
- I can edit an existing session range.
- I can delete an existing session range.
- Changes apply only to the selected tool.

### US-05 - Create a session range with value and unit
**As a** user
**I want to** define a range using a numeric value and unit
**So that** I can express limits like 15 minutes, 5 hours, 7 days, or 1 month.

**Acceptance criteria**
- The reusable range editor includes a numeric input.
- The reusable range editor includes a unit selector with `minutes`, `hours`, `days`, and `months`.
- Saving a valid value creates a readable session range label.
- Invalid values are rejected cleanly.

### US-06 - Keep tool-level ranges reusable and flexible
**As a** user
**I want to** define ranges once at the tool level
**So that** I can reuse them across multiple credentials without retyping them every time.

**Acceptance criteria**
- Tool-level ranges are stored on the tool, not duplicated as standalone definitions per credential.
- Credentials can attach one or more of the tool's ranges for tracking.
- Removing a range from the tool has a defined effect on existing credential session state and is documented in implementation notes.

---

## 3. Credentials and per-session control

### US-07 - Inline add credential under selected tool
**As a** user
**I want to** add a credential directly in the selected tool view
**So that** I can build my list of accounts quickly.

**Acceptance criteria**
- The credential area includes an inline add input or open add area.
- Typing a credential name and pressing Enter creates it.
- The new credential appears immediately in the list.
- Empty submissions do not create a credential.

### US-08 - Rename credential inline
**As a** user
**I want to** rename a credential by double-clicking its name
**So that** I can label accounts like Work, Personal, Team A, or Account 2 without extra friction.

**Acceptance criteria**
- Double-clicking a credential name opens inline edit mode.
- Enter or blur saves the new name.
- Escape cancels the edit.

### US-09 - Show credentials in a compact row with sessions
**As a** user
**I want to** see each credential as a compact row containing its session items
**So that** I can scan status and update multiple accounts quickly.

**Acceptance criteria**
- Each credential row presents the credential name, attached session items, an add-session action, and a delete action.
- The delete action is only visible when the row is active, hovered, or focused.
- The row supports multiple attached session items.

### US-10 - Toggle session reached/available with one click
**As a** user
**I want to** single-click a session item to toggle whether that limit is currently reached
**So that** I can update session state with minimal friction.

**Acceptance criteria**
- Single click toggles a session between available and reached.
- The visual state updates immediately.
- The toggled state persists to local storage and cloud sync.

### US-11 - Edit or remove a credential session item
**As a** user
**I want to** edit or delete a session item from a credential
**So that** I can correct dates or remove ranges I do not want to track on that account.

**Acceptance criteria**
- Double click or long press on a session item reveals edit and delete actions.
- Edit opens the session-value editor for that item.
- Delete removes only that session item from the credential.
- Deleting a session item does not delete the tool-level range definition.

### US-12 - Set the next session end value with a simple date-time picker
**As a** user
**I want to** set or update the next session end date and time for a session item
**So that** I can track exactly when the account becomes available again.

**Acceptance criteria**
- Editing a session item opens a simple date-time picker.
- The picker supports setting a new value, changing an existing value, and clearing the value.
- Saved values are reflected immediately in the credential row.
- The updated value persists to local storage and cloud sync.

---

## 4. Interaction polish

### US-13 - Keep the workflow fast, flexible, and low-friction
**As a** user making frequent small updates
**I want to** rely on direct inline actions instead of modal-heavy flows
**So that** tracking limits feels more like using a productivity tool than filling out forms.

**Acceptance criteria**
- Single click is reserved for quick toggle actions.
- Double click is used for inline editing where appropriate.
- Long press or secondary affordances expose less-common session actions.
- Empty states guide the next obvious action without tutorials.
- The interface remains readable with many tools, many credentials, and multiple session items per credential.

---

## Out of scope for this iteration

- Usage history or analytics
- Bulk actions across all credentials
- Automatic live quota detection from provider APIs
- Reordering tools or credentials by drag-and-drop
- Service worker or push-based background notifications
