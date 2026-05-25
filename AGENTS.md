# Architectural Guidelines & Best Practices - Network Tracker

This document summarizes key architectural decisions and workflow rules for the Network Tracker project. All contributions and AI-generated code must adhere to these standards.

## 1. Language Policy
* **Technical Content**: All documentation, code, variable names, database schemas, and comments must be written in **English**.
* **User Interface**: All user-facing strings, including menus, dialogs, labels, and general content, must be implemented in **German** (the project's target audience language).

## 2. AI Interaction & Workflow Guidelines
* **Full Code Output**: Always provide the complete, copy-pasteable code for any modified file. Avoid providing partial snippets or diffs.
* **Proactive Rule Suggestion**: Suggest new rules whenever identifying recurring patterns or to avoid critical mistakes in the future.

## 3. Frontend & Client-Side Interactivity
* **Styling**: Strictly use Tailwind CSS (v4) and daisyUI (v5). Do not write custom CSS in style blocks or separate files unless unavoidable.
* **Technology Choice**: React with TypeScript bundled via Vite. Client-side routing is handled strictly by React Router.
* **Form Handling**: Use `react-hook-form` coupled with `@hookform/resolvers` and `zod` for data schema validation.
* **Type Safety Over Assertions**: Type assertions (`as any`) are prohibited for form mappings and response updates. Use proper structural definitions, typed utility handlers (e.g., `SubmitHandler<T>`), or explicitly assign object types matching the application data interface layer.
* **Asynchronous Side Effects & Mount Safety**: Functions wrapped in `useEffect` that trigger state modifications instantly during rendering should be wrapped inside an async-safe callback container or deferred using structural execution flags (e.g., macro-task `setTimeout`) to prevent cascading layout paint cycles.
* 
## 4. Google API & Integration Standards
* **Google People API**: Used to synchronize contact cards. Historical evaluation logs must be safely bundled into JSON format and written into the contact's `userDefined` custom fields array.
* **Google Tasks API**: Used to generate follow-up tasks in the user's account based on chosen intervals (3, 6, 12 months), incorporating contextual notes and actionable web deep links.