# Migration Rollback Guide

This guide explains how to use the migration rollback functionality in the Chai Coffee Tree Platform.

## Overview

The migration system now includes:
- **Migration History Tracking**: All applied migrations are recorded in the `migration_history` table
- **Rollback Support**: Ability to rollback the last applied migration
- **Migration Status**: View all applied migrations with timestamps
- **Idempotent Migrations**: Migrations are only run once, even if the server restarts

## Migration History Table

The `migration_history` table tracks all migrations:

```sql
CREATE TABLE migration_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    migration_name TEXT NOT NULL UNIQUE,
    applied_at INTEGER NOT NULL,
    rolled_back_at INTEGER DEFAULT NULL
);
```

## CLI Commands

### Show Applied Migrations

View all migrations that have been applied:

```bash
pnpm migration:show
```

Example output:
```
📋 Applied Migrations:
────────────────────────────────────────────────────────────────────────────────
✓ 0009_user_settings_table.sql
  Applied: 2025-01-20T10:30:45.000Z

✓ 0008_transaction_history_table.sql
  Applied: 2025-01-20T10:30:44.000Z

Total: 2 migrations applied
```

### Rollback Last Migration

Rollback the most recently applied migration:

```bash
pnpm migration:rollback
```

This will:
1. Find the last applied migration
2. Execute the corresponding rollback SQL file
3. Mark the migration as rolled back in the history table

Example output:
```
🔄 Rolling back migration: 0009_user_settings_table.sql
✅ Successfully rolled back migration: 0009_user_settings_table.sql
```

### Run Pending Migrations

Run all migrations that haven't been applied yet:

```bash
pnpm migration:run
```

This will:
1. Check which migrations have already been applied
2. Skip already-applied migrations
3. Execute only new migrations
4. Record each migration in the history table

## Rollback Files

Each migration has a corresponding rollback file in `db/migrations/rollback/`:

```
db/migrations/
  ├── 0009_user_settings_table.sql
  └── rollback/
      └── 0009_user_settings_table.rollback.sql
```

### Creating Rollback Files

When creating a new migration, also create a rollback file:

**Migration**: `db/migrations/0011_add_feature.sql`
```sql
CREATE TABLE new_feature (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE INDEX idx_new_feature_name ON new_feature(name);
```

**Rollback**: `db/migrations/rollback/0011_add_feature.rollback.sql`
```sql
DROP INDEX IF EXISTS idx_new_feature_name;
DROP TABLE IF EXISTS new_feature;
```

### Rollback Best Practices

1. **Reverse Order**: Drop indexes before tables, drop foreign keys before referenced tables
2. **Use IF EXISTS**: Always use `IF EXISTS` to make rollbacks idempotent
3. **Test Rollbacks**: Test rollback files before deploying to production
4. **Data Loss**: Be aware that rollbacks may cause data loss
5. **Backup First**: Always backup the database before rolling back

## Programmatic Usage

You can also use the migration functions programmatically:

```typescript
import { 
  runMigrations, 
  showAppliedMigrations, 
  getAppliedMigrations,
  rollbackLastMigration 
} from './db/migrate.js'

// Run migrations
const result = await runMigrations()
if (result.success) {
  console.log('Migrations completed')
}

// Show applied migrations
await showAppliedMigrations()

// Get applied migrations as data
const migrations = await getAppliedMigrations()
console.log(`${migrations.length} migrations applied`)

// Rollback last migration
const rollbackResult = await rollbackLastMigration()
if (rollbackResult.success) {
  console.log(`Rolled back: ${rollbackResult.migrationRolledBack}`)
}
```

## Migration Workflow

### Normal Development Flow

1. Create a new migration:
   ```bash
   pnpm generate
   ```

2. Create the corresponding rollback file in `db/migrations/rollback/`

3. Run migrations:
   ```bash
   pnpm migration:run
   ```

4. Verify migrations:
   ```bash
   pnpm migration:show
   ```

### Rollback Flow

1. Check current migrations:
   ```bash
   pnpm migration:show
   ```

2. Rollback the last migration:
   ```bash
   pnpm migration:rollback
   ```

3. Verify rollback:
   ```bash
   pnpm migration:show
   ```

4. Re-run migrations if needed:
   ```bash
   pnpm migration:run
   ```

## Testing

Test the rollback functionality:

```bash
tsx test-migration-rollback.ts
```

This will:
- Run all pending migrations
- Show applied migrations
- Test the rollback functionality (when uncommented)

## Limitations

1. **In-Memory Database**: Rollback is not supported for in-memory databases
2. **Single Rollback**: Only the last migration can be rolled back at a time
3. **Data Loss**: Rolling back migrations may cause data loss
4. **Manual Intervention**: Some complex migrations may require manual intervention

## Troubleshooting

### Rollback File Not Found

If you see "Rollback file not found", create the rollback file:

```bash
# Create rollback directory if it doesn't exist
mkdir -p db/migrations/rollback

# Create rollback file
touch db/migrations/rollback/XXXX_migration_name.rollback.sql
```

### Migration Already Applied

If a migration is already applied, it will be skipped:

```
⏭️  Skipping already applied migration: 0009_user_settings_table.sql
```

### Rollback Failed

If a rollback fails, check:
1. The rollback SQL syntax is correct
2. The objects being dropped exist
3. There are no foreign key constraints preventing the rollback

## Examples

### Example 1: Rollback User Settings Table

```bash
# Show current migrations
pnpm migration:show

# Rollback user_settings table
pnpm migration:rollback

# Verify rollback
pnpm migration:show

# Re-apply migration
pnpm migration:run
```

### Example 2: Create and Rollback New Migration

```bash
# Generate new migration
pnpm generate

# Create rollback file
# Edit db/migrations/rollback/XXXX_new_migration.rollback.sql

# Run migration
pnpm migration:run

# Test rollback
pnpm migration:rollback

# Re-apply
pnpm migration:run
```

## Integration with Server Startup

Migrations run automatically on server startup:

```typescript
// api/server.ts
import { runMigrations } from './db/migrate.js'

// Run migrations before starting server
const migrationResult = await runMigrations()
if (!migrationResult.success) {
  console.error('Migration failed, server not started')
  process.exit(1)
}
```

The migration runner will:
- Check which migrations have been applied
- Skip already-applied migrations
- Run only new migrations
- Record each migration in the history table

## Security Considerations

1. **Backup First**: Always backup the database before rolling back
2. **Production Caution**: Be extremely careful when rolling back in production
3. **Data Loss**: Understand that rollbacks may cause data loss
4. **Test First**: Always test rollbacks in development before production
5. **Access Control**: Restrict access to rollback commands in production

## Future Enhancements

Potential future improvements:
- Rollback multiple migrations at once
- Rollback to a specific migration
- Dry-run mode to preview rollback effects
- Automatic backup before rollback
- Migration dependencies and ordering
- Migration versioning and branching
