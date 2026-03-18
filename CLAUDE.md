# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fill Station is a web application for tracking scuba diving equipment fills and service maintenance at a dive shop. Built with Next.js 16 (App Router), React 19, TypeScript, Redux Toolkit + React Query, Sequelize ORM with MariaDB, and Tailwind CSS v4.

## Commands

- `npm run dev` — start Next.js dev server
- `npm run build` — production build
- `npm run lint` — run prettier + eslint with auto-fix
- `npm run knip` — check for unused exports/imports (production profile)
- `docker compose up` — start MariaDB + app locally
- `npx sequelize-cli db:migrate` — run pending database migrations
- `npx sequelize-cli db:migrate:undo` — revert last migration

No test framework is configured.

Always run `npm run lint` after making code changes.

## Architecture

### Data Flow

```
API Routes (src/app/api/) → Sequelize Models (src/lib/models/)
                ↕
API Client (src/app/_api/index.ts) — Axios with date interceptor
                ↕
Custom Hooks (src/hooks/) — React Query fetch → Redux dispatch
                ↕
Components (src/components/) — select from Redux store
```

### State Management

- **Redux Toolkit** (`src/redux/`): UI/form state — fill entries, modals, selections
- **React Query**: Server state — fetching, caching, refetching after mutations
- **Pattern**: Custom `useLoad*` hooks bridge React Query responses into Redux slices. Some hooks accept `{ enabled }` to skip fetching when server-rendered data is passed as props (e.g., dashboard tables).
- **Server components**: Pages that fetch data server-side (e.g., dashboard, settings, detail pages) use `'use server'` and query Sequelize directly. Pass serialized data (`JSON.parse(JSON.stringify(...))`) as props to client components.

### Authentication

NextAuth v5 (beta) with Authelia OIDC and Google OAuth providers. Middleware in `src/proxy.ts` protects all routes except `/`, `/about`, `/contact`, and `/api/auth/*`. Every protected API route checks `auth()` session. Session augmented with `role` via callback in `src/auth.ts` and typed in `src/types/next-auth.d.ts`. Admin routes check `session.user.role !== 'admin'`; admin API routes live under `src/app/api/users/`.

A custom Account model in `src/auth.ts` overrides the default SequelizeAdapter Account to use TEXT columns for `access_token` and `refresh_token` — Google returns tokens that exceed VARCHAR(255).

**Roles**: `user` (default, read-only dashboard), `filler` (create fills), `inspector` (create visual inspections), `admin` (full access + user management). Role checked via `requireRole()` in `src/lib/permissions-server.ts`.

### Database

Sequelize with sequelize-typescript. Config loaded via nconf (env vars override `config.yaml` override defaults). Models: Fill, Cylinder, Client, Visual, Maintenance, Contact, User, AuditLog. Class-based definitions using `Model<InferAttributes, InferCreationAttributes>`. Use class methods (`findByPk`, `findAll`, `save`) — not raw queries. User model overrides NextAuth default via `SequelizeAdapter({ models: { User, Account } })`.

**Migrations**: CJS format in `migrations/` directory. Config in `migrations/config/config.cjs`. Configured via `.sequelizerc`. New migrations should follow existing naming: `YYYYMMDDNNNNNN-description.cjs`.

Environment variables use double-underscore nesting: `DATABASE__HOST`, `DATABASE__DATABASE`, `DATABASE__USERNAME`, `DATABASE__PASSWORD`. All nconf variables are documented in `.env.example` — update that file when adding new nconf config keys.

## Code Conventions

- **Formatting**: Prettier with single quotes, no semicolons, tabs, 80 char width. Tailwind class sorting via prettier plugin.
- **Components**: PascalCase files, `'use client'` directive required for interactive components. Inline Tailwind classes throughout — no CSS modules.
- **Types**: Exported from `src/types/` directory, one file per domain entity.
- **Redux**: Feature-based slices in `src/redux/<feature>/`. Use typed hooks from `src/redux/hooks.ts` (`useAppDispatch`, `useAppSelector`).
- **API routes**: RESTful handlers in `src/app/api/<resource>/route.ts`. Return JSON with proper status codes. Auth-gated with `auth()`.
- **Icons**: Custom SVG components in `src/icons/`.
- **UI primitives**: Headless UI for accessible components, Heroicons for icons, react-toastify for notifications.
- **Theming**: CSS custom properties in `src/app/global.css` define all colors (`:root` for light, `.dark` for dark) and register them as Tailwind utilities via `@theme`. Use theme tokens like `bg-background`, `text-text`, `border-border` — not hardcoded Tailwind colors. Do NOT add `dark:` variants of theme classes (e.g., `dark:bg-background` is redundant since the CSS variable already switches). `ThemeProvider` in `src/components/Providers/ThemeProvider.tsx` applies `dark` class on `<html>`. User theme stored in DB (`User.theme`).
- **Form constants**: Reusable select/listbox options defined in `src/app/constants/FormConstants.ts`.
- **ClientPicker / ListBox**: Support both Redux-connected (default) and controlled modes via optional `value`/`onChange` props. Use controlled mode when embedding in non-Redux contexts (e.g., admin tables).
- **Dates**: dayjs — Axios interceptor auto-parses ISO 8601 strings from API responses.

## Deployment

Standalone Next.js output in a multi-stage Docker build (Node 24-alpine). CI via GitHub Actions builds and pushes images to Docker Hub and GHCR on pushes to `main`.
