# FixItMY

A community-driven platform for reporting and resolving local issues.
<img width="700" alt="screen_mockups" src="https://github.com/user-attachments/assets/3186b773-a047-4b60-bc5f-c41374d384e3" />

## Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) (Deployed on [Vercel](https://vercel.com/))
- **Backend**: [FastAPI](https://fastapi.tiangolo.com/) (Deployed on [Render](https://render.com/))
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Location Services**: [Geoapify](https://www.geoapify.com/), [Leaflet](https://leafletjs.com/)
- **PWA**: [Serwist](https://serwist.pages.dev/) (Offline support & Service Workers)

## Setup

### Clone Repository

```bash
git clone https://github.com/Joyanne05/fixit-my.git
```

### Backend (FastAPI)

1. **Navigate**: `cd backend`
2. **Install**:
   ```bash
   # Install dependencies (creates .venv automatically)
   uv sync
   ```
3. **Env Setup**: Create `.env` with:
   ```bash
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_service_role_key
   ```
4. **Run**: `uv run uvicorn app.main:app --reload`
   - Server runs at: `http://localhost:8000`
   - Swagger UI: `http://localhost:8000/docs`

### Database (Supabase)

1. **Create Project**: Start a new project on [Supabase.com](https://supabase.com).
2. **SQL Editor**: Go to the SQL Editor in your dashboard.
3. **Run Schema**: Copy and run the contents of `backend/schema.sql` to create all tables and RLS policies.
4. **Get Keys**: Copy `Project URL` and `anon key` to your `.env.local` file.

### Frontend (Next.js)

1. **Navigate**: `cd frontend`
2. **Install**: `npm install`
3. **Env Setup**: Create `.env.local` with:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_BASE_URL=http://localhost:8000/
   GEOAPIFY_API_KEY=your_geoapify_key
   ```
4. **Run**: `npm run dev`
   - App runs at: `http://localhost:3000`

## Features

- **Google Single Sign-On**: Secure login via Supabase.
- **On-the-spot Reporting**: Integrated camera support allowing users to capture and report issues instantly with photos, category, descriptions, and location.
- **Community Verification**: Issues marked as "Closed" require community verification votes to ensure they are truly resolved.
- **Admin Dashboard**: Dedicated interface for administrators to manage reports, users, and oversee platform activity.
- **Anonymous Mode**: Report issues without revealing identity.
- **Comments & Updates**: Follow reports to get notified on progress and discuss with the community.
- **Gamification**: Earn points and badges for reporting (10pts), verifying (5pts), and following/commenting (2pts).
- **Maps View**: Visualize report data with colour-coded markers and heatmaps to identify high-density areas.
- **PWA Capable**: Installable as a native-like app with offline capabilities.

## Project Assumptions & Constraints

To ensure the best experience while testing **FixItMY**, please note the following technical assumptions:

- **Initial Visit Requirement:** The application requires a stable internet connection during the **first load**. This allows the Service Worker to register and pre-cache the "App Shell". Once this process is complete, the app is fully available for offline use.
- **Backend "Cold Starts":** This project uses the **Render Free Tier** for hosting the FastAPI backend. The server automatically spins down after **15 minutes of inactivity**. If the service is "sleeping," the first request may take **30–50 seconds** to wake up. Subsequent requests will be near-instant.
- **Browser Compatibility:** For the best PWA experience (including "Add to Home Screen" prompts), it is assumed users are using a Chromium-based browser (Chrome, Edge) or Safari on iOS.
