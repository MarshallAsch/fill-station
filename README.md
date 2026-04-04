# Fill Station

A web application for tracking scuba diving equipment fills and service maintenance at a dive shop. Manages cylinder inventories, gas fill records, visual inspections, compressor maintenance logs, and customer accounts.

Built with Next.js 16 (App Router), React 19, TypeScript, Redux Toolkit, React Query, Sequelize ORM, MariaDB, and Tailwind CSS v4.

## Features

- **Gas fill tracking** -- record air, nitrox, and trimix fills with start/end pressures
- **Visual inspections** -- full PSI inspection workflow with per-section grading
- **Cylinder management** -- track hydro dates, visual dates, O2 clean status, manufacturer, and service pressure
- **Customer accounts** -- manage clients, certifications, and their cylinder inventories
- **Compressor maintenance** -- log oil changes, filter changes, air tests, and service hours
- **Email notifications** -- automated reminders when hydro tests or visual inspections are due
- **Role-based access** -- user, filler, inspector, and admin roles with route-level permissions
- **Authentication** -- OIDC (Authelia) and Google OAuth via NextAuth v5

## Quick Start with Docker Compose

The easiest way to run locally. This starts MariaDB, Mailpit (for email testing), and the app with hot reload:

```bash
docker compose up --build
```

The app will be available at [http://localhost:3000](http://localhost:3000). Mailpit UI is at [http://localhost:8025](http://localhost:8025).

On first startup the container automatically runs pending database migrations and seed data.

### Authentication Setup

User accounts are created on first login via an OAuth provider. For local development, configure an OIDC provider (like Authelia) or Google OAuth. Set the credentials in the compose `environment` block:

- `AUTH_SECRET` -- a random secret for NextAuth session encryption
- `AUTH_AUTHELIA_CLIENT_ID` / `AUTH_AUTHELIA_CLIENT_SECRET` -- Authelia OIDC client credentials
- `AUTH_GOOGLE_CLIENT_ID` / `AUTH_GOOGLE_CLIENT_SECRET` -- Google OAuth credentials (optional)

## Local Development (without Docker)

### Prerequisites

- Node.js 24+
- MariaDB (or MySQL)

### Setup

```bash
# Install dependencies
npm install

# Configure the database
# Option 1: Set environment variables
export DATABASE__HOST=localhost
export DATABASE__DATABASE=fills
export DATABASE__USERNAME=fills
export DATABASE__PASSWORD=fills

# Option 2: Create a config.yaml in the project root
# database:
#   host: localhost
#   database: fills
#   username: fills
#   password: fills

# Run database migrations
npx sequelize-cli db:migrate

# (Optional) Seed the database with demo data
npx sequelize-cli db:seed:all

# Start the dev server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Configuration

Configuration is loaded via nconf with the following priority (highest first):

1. **Environment variables** -- use double-underscore nesting (e.g., `DATABASE__HOST`)
2. **Container config** -- `/config/config.yaml` (for Docker production deployments)
3. **Local config** -- `config.yaml` in the project root
4. **Defaults** -- built-in fallbacks

### Key Environment Variables

| Variable | Description |
|---|---|
| `DATABASE__HOST` | MariaDB host |
| `DATABASE__DATABASE` | Database name |
| `DATABASE__USERNAME` | Database user |
| `DATABASE__PASSWORD` | Database password |
| `AUTH_SECRET` | NextAuth session secret |
| `AUTH_AUTHELIA_CLIENT_ID` | Authelia OIDC client ID |
| `AUTH_AUTHELIA_CLIENT_SECRET` | Authelia OIDC client secret |
| `AUTH_GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `AUTH_GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `SMTP__HOST` | SMTP server host |
| `SMTP__PORT` | SMTP server port |
| `SMTP__USER` | SMTP username |
| `SMTP__PASSWORD` | SMTP password |
| `SMTP__FROM` | Sender email address |

## Database Migrations

Migrations are managed with sequelize-cli. Migration files are CJS format in the `migrations/` directory.

```bash
# Run all pending migrations
npx sequelize-cli db:migrate

# Revert the last migration
npx sequelize-cli db:migrate:undo

# Seed the database with demo data
npx sequelize-cli db:seed:all

# Undo all seeds
npx sequelize-cli db:seed:undo:all
```

### Creating a New Migration

Follow the existing naming convention:

```bash
# Name format: YYYYMMDDNNNNNN-description.cjs
touch migrations/20260404000002-add-some-column.cjs
```

Migration config is in `migrations/config/config.cjs` and reads from the same `DATABASE__*` environment variables.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run Prettier and ESLint with auto-fix |
| `npm run knip` | Check for unused exports/imports |

## Production Deployment

### Docker

The production Dockerfile uses a multi-stage build with standalone Next.js output:

```bash
docker build -t fill-station .
docker run -p 3000:3000 \
  -e DATABASE__HOST=your-db-host \
  -e DATABASE__DATABASE=fills \
  -e DATABASE__USERNAME=fills \
  -e DATABASE__PASSWORD=your-password \
  -e AUTH_SECRET=your-secret \
  -v /path/to/config:/config \
  fill-station
```

The production container reads config from `/config/config.yaml` if mounted. Run migrations separately before starting the app:

```bash
npx sequelize-cli db:migrate
```

### CI/CD

GitHub Actions builds and pushes Docker images to Docker Hub (`marshallasch/fill-station`) and GHCR (`ghcr.io/marshallasch/fill-station`) on pushes to `main`.

## Roles

| Role | Permissions |
|---|---|
| `user` | View dashboard, manage own cylinders |
| `filler` | Create fills, manage clients and cylinders |
| `inspector` | Create visual inspections, all filler permissions |
| `admin` | Full access including user management and settings |

Roles are assigned by an admin via the Settings > Users page. New users default to `user`.
