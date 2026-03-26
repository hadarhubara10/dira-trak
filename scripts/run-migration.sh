#!/bin/bash
# Run migration using supabase CLI, reading password from .env.local
set -euo pipefail

# Read SUPABASE_DB_PASSWORD from .env.local
DB_PASSWORD=$(grep '^SUPABASE_DB_PASSWORD=' .env.local | sed 's/^SUPABASE_DB_PASSWORD=//' | tr -d '"')

if [ -z "$DB_PASSWORD" ]; then
  echo "Error: SUPABASE_DB_PASSWORD not found in .env.local"
  exit 1
fi

echo "Pushing migrations..."
supabase db push --password "$DB_PASSWORD"
