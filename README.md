# FixItMY

A community-driven platform for reporting and resolving local issues.

## Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) (Deployed on [Vercel](https://vercel.com/))
- **Backend**: [FastAPI](https://fastapi.tiangolo.com/) (Deployed on [Render](https://render.com/) Free Tier with spin-down time after 15 minutes of inactivity)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Location Services**: [Geoapify](https://www.geoapify.com/)
- **PWA**: [Serwist](https://serwist.pages.dev/) (Offline support & Service Workers)

## Setup

### Clone Repository

```bash
git clone https://github.com/Joyanne05/fixitmy.git
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

## Folder Structure

```
/backend
  /app
    /dependencies # API dependencies (auth)
    /routers      # API endpoints (auth, reports, users)
    /schemas      # Pydantic models
    /services     # Business logic & external services
    /utils        # Helper functions
    main.py       # Application entry point
  schema.sql      # Database schema definition

/frontend
  /app
    /auth         # Auth pages & components
    /dashboard    # Main user dashboard
    /reports      # Report detail pages
    /profile      # User profile & stats
  /lib            # API & Supabase clients
  /public         # Static assets & PWA icons
  /shared
    /components   # Reusable UI components
    /context      # Global state (Auth, Toast)
  /types          # TypeScript definitions
```

## Features

- **Google Single Sign-On**: Secure login via Supabase.
- **On-the-spot Reporting**: Integrated camera support allowing users to capture and report issues instantly with photos, category, descriptions, and location.
- **Anonymous Mode**: Report issues without revealing identity.
- **Comment**: Update progress on issues.
- **Gamification**: Earn points and badges for reporting (10pts), verifying (5pts), and commenting (2pts).
- **Mobile-First**: Fully responsive design with PWA capabilities.
- **Offline Mode**: View previously loaded reports without internet through runtime caching.

## Assumptions

- Expect delay in loading due to spin-down time of backend server (15 minutes of inactivity).
