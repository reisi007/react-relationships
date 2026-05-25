# 🕸️ Network Tracker

Network Tracker ist eine React-basierte Anwendung, die entwickelt wurde, um dein privates und berufliches Netzwerk systematisch zu analysieren, zu bewerten und zu pflegen. Sie integriert sich direkt in Google Contacts und Google Tasks, um echte Kontakte zu synchronisieren und intelligente Follow-up-Erinnerungen einzurichten.

## 🌟 Features
* **Google Integration**: Sichere Authentifizierung über den Google OAuth 2.0 Flow.
* **Kontakt-Synchronisation**: Lese und synchronisiere Kontakte über die Google People API.
* **Evaluierungs-Workflow**: Bewerte Kontakte im Bereich "Privat" oder "Business" mit interaktiven Slidern.
* **Dashboard Pyramiden**: Visualisiere die Verteilung deines Netzwerks über 4 Stufen basierend auf den Evaluierungs-Scores.
* **Smarte Erinnerungen**: Erstelle automatisch Follow-up-Tasks in Google Tasks (in 3, 6 oder 12 Monaten).

## 🛠️ Tech Stack
* **Frontend**: React (v19), TypeScript, Vite
* **Styling**: Tailwind CSS (v4), daisyUI (v5)
* **Routing**: React Router (v7)
* **Forms**: react-hook-form, zod

## 🚀 Getting Started
1. Abhängigkeiten installieren: `npm install`
2. Lege eine `.env` Datei mit deiner Google Client ID an: `VITE_GOOGLE_CLIENT_ID=deine_client_id_hier`
3. Starte den Development Server: `npm run "⚡ dev"`
