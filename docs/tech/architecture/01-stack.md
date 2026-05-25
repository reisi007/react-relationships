---
domain: technical
topic: architecture
status: approved
---

# Technical Concept: Frontend Stack & UI

## 🛠 Technical Details & Architecture
- **Framework:** React (v18+) with TypeScript, bundled via Vite.
- **Styling:** Tailwind CSS (v4) and daisyUI (v5).
- **Routing:** React Router v7 (or latest stable v6).
- **Form Handling & Validation:** `react-hook-form` coupled with `@hookform/resolvers` and `zod`.
- **Language Policy:** All user-facing UI elements (buttons, labels, dialogs) MUST be in German. All underlying code, variable names, and comments MUST be in English.
- **Directory Structure:**
  - `/src/components`: Reusable UI elements (Navbar, Modals, Pyramid visualization).
  - `/src/pages`: Main views (`Dashboard`, `ContactList`).
  - `/src/data`: Static configurations (`questions.json`).
  - `/src/services`: Google API endpoints & OAuth logic.
  - `/src/hooks`: Custom React hooks for data fetching.