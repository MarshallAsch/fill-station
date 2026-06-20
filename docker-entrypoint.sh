#!/bin/sh
set -e

# Optionally run pending database migrations before starting the app.
# Guarded by RUN_MIGRATIONS (default "false") so it can be disabled for
# multi-replica deploys or gated rollouts where migrations run as a
# separate step. A migration failure aborts startup (set -e) so the app
# never serves against a stale or half-migrated schema.
if [ "$RUN_MIGRATIONS" = "true" ]; then
	echo "RUN_MIGRATIONS=true — running database migrations..."
	# The migration tooling lives in /migrate (separate from the standalone
	# app in /app); .sequelizerc there resolves migrations/config paths.
	# --no-install ensures the bundled sequelize-cli is used (no network).
	(cd /migrate && npx --no-install sequelize-cli db:migrate)
	echo "Database migrations complete."
else
	echo "RUN_MIGRATIONS is not 'true' — skipping database migrations."
fi

exec "$@"
