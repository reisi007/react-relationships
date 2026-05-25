# 🕸️ Network Tracker Task Queue

## Phase 1: Project Setup & Architecture (Days 1-2)
- [x] Initialize Vite project with React & TS, clear boilerplate
- [x] Install Core Libraries (Tailwind, daisyUI v5, React Router v7, react-hook-form, zod)
- [x] Setup basic folder structure (/components, /pages, /data, /services, /hooks)
- [x] Create root-level AGENTS.md rulebook

## Phase 2: Google Cloud Console & API-Auth (Days 3-4)
- [x] Configure Google Cloud Project (Enable People API & Tasks API)
- [x] Set up OAuth 2.0 Consent Screen & Test Users
- [x] Implement Authentication in React (OAuth2 Implicit Flow via `googleAuth.ts`)

## Phase 3: JSON Data Structures & Zod Validation (Day 5)
- [x] Create Questionnaire Data (`/src/data/questions.json` with psychological questions)
- [x] Define Zod Schemas (`/src/data/schemas.ts` for evaluation history and dynamic forms)

## Phase 4: UI Development with daisyUI & React Router (Days 6-8)
- [x] Set up Routing (`App.tsx` with `/` and `/contacts`)
- [x] Implement Contact List & Search (Live filtering by name/email, evaluation badges)
- [x] Build Dashboard Pyramids (Two columns for Private/Business, active sphere tabs, tier filtering)

## Phase 5: The Evaluation Workflow (Days 9-11)
- [x] Develop Evaluation Modal (Dynamic range sliders, comment textarea, interval dropdown)
- [x] Program Calculation Logic (Calculate % score from sliders, assign tier 1-4)
- [x] Set up Google Update Process (Read/Append history to `userDefined` array via People API)

## Phase 6: Google Tasks Reminder System (Day 12)
- [x] Calculate Due Date based on interval (3, 6, 12 months)
- [x] Build Deep-Link Generator (Using target domain `https://network.reisinger.pictures/contacts?id=...`)
- [x] Integrate Google Tasks API Call (Create task in `@default` list, store returned `taskId`)

## Phase 7: Testing & Deployment (Days 13-14)
- [ ] **E2E Testing of the Workflow** (Create test contact, perform evaluation, verify Google Contacts custom fields, verify Google Tasks creation)
- [ ] **Build & Deployment** (Run `npm run build`, deploy to static hosting platform e.g., Vercel/Netlify/GitHub Pages)
- [ ] **Google Cloud Configuration** (Update OAuth Redirect URIs in Google Cloud Console for the live production domain)
