#!/bin/bash

# Script to apply the liked_products table migration

echo "Creating liked_products table in Supabase..."

# Read the migration file
MIGRATION_SQL=$(cat supabase/migrations/20260518_create_liked_products_table.sql)

# Execute using psql via the database connection
psql "$POSTGRES_URL" -c "$MIGRATION_SQL"

echo "Migration completed successfully!"
