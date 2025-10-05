GenAI Health — Multi-Page Frontend + Architecture Notes
=======================================================

What I provided:
- A multi-page static frontend in `frontend_multi/`:
    - index.html (Dashboard)
    - patients.html (List)
    - patient.html (Patient detail; accepts ?id=)
    - reports.html
    - settings.html
    - nav.html and footer.html included via includes.js
    - styles.css with accessible, mild-color design
- Welcome text changed to: "Welcome, Keerthana"
- Accessibility improvements: skip link, focus outlines, semantic roles, keyboard navigation.

How this maps to your requested platform features:
- GenAI recommendations:
    - Use OpenAI GPT-4 (or Google Gemini) on the server-side to generate health recommendations, culturally-appropriate diet plans, exercise routines, and progress report narratives.
    - Keep requests minimal (summaries) to meet the 30s analysis time requirement.
- Data analysis:
    - Use Python with pandas/scikit-learn in a secure API service for trend detection and alert generation.
- Mobile app:
    - Use React Native for the patient-facing mobile app (offline reminders via local notifications/storage).
- Database & security:
    - PostgreSQL with encryption (PGP or column-level encryption) for patient data at rest; TLS for transit.
    - Field-level encryption for PHI and encrypted backups.
- Integrations:
    - Limit to 2 external APIs (e.g., a wearable data provider like Fitbit/Google Fit and a pharmacy API).
    - Telemedicine integration: provide a secure link to a telemedicine provider or embed via a backend proxy.
- Offline & low-connectivity:
    - Web: Use Service Worker to cache essential pages and medication reminders, and IndexedDB/localStorage for queued data.
    - Mobile: React Native should store critical reminders locally and sync when online.
- Multilingual:
    - Provide translations via i18n framework on frontend and ensure AI prompts include desired language/localization instructions.
- Privacy & Compliance:
    - Audit logs, access control, HIPAA-like controls (encrypt, minimize retention, patient consent).
    - Do not send raw PHI to model providers unless using a compliant business arrangement.
- Response time:
    - Precompute frequently-used insights and use async job queues to ensure live requests complete within 30s. Use lightweight summaries for UI.

How to use this package:
1. Download and unzip `genai_health_genai_platform.zip`.
2. Open `frontend_multi/index.html` in your browser to explore the static, multi-page UI.
3. To integrate with backend:
    - Implement REST APIs for patient lists, vitals, reports.
    - Point frontend fetch calls to your API endpoints (currently this is static).
    - Implement server-side AI adapter that calls OpenAI GPT-4 / Google Gemini (ensure compliance).

Files included:
- frontend_multi/ (static UI)
- README (this file)
- The original project files (if present) are included in the zip root — I didn't modify server files.

Notes:
- This is a static prototype; to enable offline reminders and live telemedicine, you need to wire up backend/mobile app components as described above.
- If you'd like, I can:
  * Replace your existing frontend with this multi-page UI,
  * Add a simple service worker for caching/offline reminders,
  * Or scaffold a minimal backend (Flask) that demonstrates integration with OpenAI GPT-4 and shows encrypted PostgreSQL storage (demo).
