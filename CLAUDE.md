# La Ligue Informatique

Sports league management app with NestJS backend + React frontend.

## Quick Start

```bash
# Backend (port 3000)
cd backend && npm run start:dev

# Frontend (port 5173)
cd frontend && npm run dev

# Database
cd backend && npx prisma migrate dev   # run migrations
cd backend && npx prisma generate      # regenerate Prisma client after schema changes
npm run db:seed                        # seed demo data (from root)
npm run db:studio                      # open Prisma Studio (from root)
```

## Tech Stack

- **Backend:** NestJS 10, Prisma 5, SQLite, JWT (Passport.js), bcryptjs
- **Frontend:** React 18, Vite, Tailwind CSS 3, React Router 6
- **Database:** SQLite (`backend/prisma/dev.db`) - no external DB needed
- **Language:** TypeScript (strict mode) on both sides

## Project Structure

```
backend/src/
  auth/           # JWT auth, login/signup, roles guard & decorator
  dashboard/      # User stats endpoint
  sports/         # Sport CRUD
  equipes/        # Team CRUD + member management
  evenements/     # Event CRUD
  matchs/         # Match CRUD (extends Evenement via XT inheritance)
  reponses/       # Event responses (present/absent/peut-etre)
  inscriptions/   # Sport subscriptions (user <-> sport)
  prisma/         # PrismaService wrapper

frontend/src/
  pages/          # Route pages (auth, sports, equipes, evenements, matchs, calendar, profil, dashboard)
  components/     # Layout, Navbar, ProtectedRoute, AdminRoute, SportSelectionModal
  context/        # AuthContext (global auth state, user profile, role, subscribed sports)
  api/            # HTTP client (client.ts) - base URL: http://localhost:3000/api
```

## Architecture Notes

### Database Schema (Prisma)

Key models: `Utilisateur`, `Sport`, `Equipe`, `Evenement`, `Match`, `Reponse`, `Appartenir`, `EquipeParticipante`, `SportInscription`.

- Schema at: `prisma/schema.prisma` (root level, shared with backend via path config)
- Match uses XT inheritance: `Match` has 1:1 relation to `Evenement` (cascade delete)
- **Equipe belongs to a Sport** (`sportId` FK) — teams with the same name but different sports are distinct teams
- All N:N relations use explicit join tables with `@@unique` constraints
- Cascade deletes configured on all foreign keys

### Key Entity Relationships

- `Sport` 1:N `Equipe` — each team belongs to one sport
- `Sport` 1:N `Evenement` — each event belongs to one sport
- `Evenement` 1:1? `Match` — a match IS an event (XT inheritance)
- `Match` N:N `Equipe` (via `EquipeParticipante`, cardinality 2,2) — exactly 2 teams per match
- `Utilisateur` N:N `Equipe` (via `Appartenir`) — team membership
- `Utilisateur` N:N `Sport` (via `SportInscription`) — sport subscriptions
- `Utilisateur` N:N `Evenement` (via `Reponse`) — event responses

### Authentication & Roles

- JWT stored in `localStorage` under key `'token'`
- Two roles: `"admin"` and `"utilisateur"` (default on signup)
- Backend enforces roles via `RolesGuard` + `@Roles('admin')` decorator on write endpoints
- Frontend uses `AdminRoute` component to guard admin-only pages (`/sports/new`, `/equipes/new`, `/evenements/new`, `/matchs/new`)
- `AuthContext` exposes: `isAdmin`, `hasSports`, `subscribedSportIds`, `refreshProfile()`

### Role Permissions

**Admin only** (backend-enforced via `@Roles('admin')` + UI-hidden for users):
- Create/update/delete sports, teams, events, matches
- Set match winner (`PUT /matchs/:id`)
- Add/remove team members

**Any authenticated user:**
- View sports, teams, events, matches, calendar, dashboard
- Subscribe/unsubscribe from sports (profile page)
- Respond to events (present/absent/peut-etre)
- View team details and match details

### Sport Selection & Filtering

- New users MUST select at least one sport before accessing the app (`SportSelectionModal` in `ProtectedRoute` blocks all routes until `hasSports` is true)
- **Events, matches, teams, and calendar are filtered by user's subscribed sports** on the frontend
- `subscribedSportIds` from `AuthContext` is the source of truth for filtering
- Match creation form filters available teams by the selected sport
- Teams list only shows teams for the user's subscribed sports

### API Endpoints

All prefixed with `/api`, protected by `JwtAuthGuard` (except `POST /auth/signup` and `POST /auth/login`).

- `GET /auth/me` returns full profile including `sportsInscrits` and `appartenances`
- Events support `?sportId=` query param for server-side filtering
- Equipes include `sport` relation in all responses (`findAll`, `findOne`, `create`)
- Responses use upsert pattern (unique constraint on `[utilisateurId, evenementId]`)

## Code Conventions

- 2-space indentation, semicolons, single quotes for imports
- React components: PascalCase files (e.g., `SportsListPage.tsx`)
- Backend modules: kebab-case folders, dot-separated files (e.g., `sports.service.ts`, `sport.dto.ts`)
- French naming in domain models (Utilisateur, Equipe, Evenement, etc.) and UI text
- English for code structure (controllers, services, guards, hooks)
- No test files currently exist
- Demo accounts: `alice@example.com`, `bob@example.com`, `claire@example.com` (admin), `david@example.com`, `emma@example.com`, `francois@example.com` (user). Password: `Password1!`

## Common Patterns

- Backend controllers: `@UseGuards(JwtAuthGuard, RolesGuard)` at class level, `@Roles('admin')` on specific methods
- Frontend data fetching: `useEffect` + `api.get()` in each page, local state with `useState`
- Frontend role checks: `const { isAdmin } = useAuth()` then conditional rendering
- Sport filtering: `const sportIds = new Set(subscribedSportIds); items.filter(e => sportIds.has(e.sportId))`
- After toggling sport subscription on profile page, call `refreshProfile()` to sync `AuthContext`
