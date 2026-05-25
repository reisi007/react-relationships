---
domain: technical
topic: api
status: approved
---

# Technical Concept: Google Cloud & API Integration

## 🛠 Technical Details & Architecture
- **Authentication:** Client-side OAuth 2.0 Flow. Tokens (Access/Refresh) stored securely in `localStorage`.
- **Google People API:**
  - **Scope:** `https://www.googleapis.com/auth/contacts`
  - **Usage:** Read contacts, search/filter, and write custom fields (`userDefined` array) for evaluation history.
- **Google Tasks API:**
  - **Scope:** `https://www.googleapis.com/auth/tasks`
  - **Usage:** Create 3, 6, or 12-month reminder tasks in the `@default` task list.
  - **Task Format:** - Title: `[Netzwerk-Re-Evaluierung] - {LastName}, {FirstName}`
    - Notes: Last evaluation comment + deep link to the app (e.g., `https://network.reisinger.pictures/contacts?id={contactId}`).