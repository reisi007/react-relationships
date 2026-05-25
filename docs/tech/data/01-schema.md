---
domain: technical
topic: data
status: approved
---

# Technical Concept: Data Schemas & Validation

## 🛠 Technical Details & Architecture
- **Questionnaire Data (`/src/data/questions.json`):**
  - Fields: `id` (string), `sphere` (enum: `PRIVAT` | `BUSINESS`), `isActive` (boolean), `label` (string), `sliderDescription` (string).
- **Zod Schemas:**
  - `EvaluationHistoryItemSchema`: Defines the history object injected into Google Contacts. Fields include `timestamp` (date), `score` (number), `tier` (number 1-4), `comment` (string), `taskId` (string).
  - Dynamic Form Schema: Generated dynamically based on `isActive: true` questions.