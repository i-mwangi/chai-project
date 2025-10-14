/**
 * Integration Tests: Database Migrations
 * 
 * Tests the migration runner functionality including:
 * - Running migrations on fresh database
 * - Idempotent migration execution
 * - Table schema verification
 * - Migration tracking and skipping
 * - Transaction rollback on failure
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 5.1, 5.2, 5.3, 5.4
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { MigrationRunner } from '../../db/migrate.js'
import { db } from '../../db/index.js'
import { existsSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'fs'
import { join } from 'path'

describe('Database Migrations - Integration Tests', () => {
  
  const testMigrationsDir = './tests/Integration/test-migrations'
  const testRollbackDir = './tests/Integration/test-migrations/rollback'
  let migrationRunner: MigrationRunner
  let isInMemoryDB: boolean

  beforeAll(async () => {
    // Check if we're using in-memory DB
    isInMemoryDB = !!(db as any).__dumpStorage
    
    if (isInMemoryDB) {
      console.log('⚠️  Running migration tests with in-memory database (limited functionality)')
    }

    // Create test migrations directory
    if (!existsSync(testMigrationsDir)) {
      mkdirSync(testMigrationsDir, { recursive: true })
    }
    if (!existsSync(testRollbackDir)) {
      mkdirSync(testRollbackDir, { recursive: true })
    }
  })

  afterAll(async () => {
    // Cleanup test migrations directory
    if (existsSync(testMigrationsDir)) {
      rmSync(testMigrationsDir, { recursive: true, force: true })
    }
  })

  beforeEach(async () => {
    // Clean up test migrations before each test
    if (existsSync(testMigrationsDir)) {
      const files = require('fs').readdirSync(testMigrationsDir)
      for (const file of files) {
        if (file.endsWith('.sql')) {
          rmSync(join(testMigrationsDir, file), { force: true })
        }
      }
    }
  })

  describe('Migration Execution on Fresh Database', () => {
    
    it('should run migrations successfully on fresh database', async () => {
      // Requirement 1.1, 1.2: Execute pending migrations in order
      
      if (isInMemoryDB) {
        console.log('⏭️  Skipping test for in-memory database')
        return
      }

      // Create test migration files
      const migration1 = `
        CREATE TABLE IF NOT EXISTS test_table_1 (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          created_at INTEGER DEFAULT (strftime('%s', 'now'))
        );
      `
      
      const migration2 = `
        CREATE TABLE IF NOT EXISTS test_table_2 (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          value TEXT NOT NULL,
          test_table_1_id INTEGER,
          FOREIGN KEY (test_table_1_id) REFERENCES test_table_1(id)
        );
      `

      writeFileSync(join(testMigrationsDir, '0001_test_migration_1.sql'), migration1)
      writeFileSync(join(testMigrationsDir, '0002_test_migration_2.sql'), migration2)

      // Run migrations
      migrationRunner = new MigrationRunner(testMigrationsDir, testRollbackDir)
      const result = await migrationRunner.runMigrations()

      // Verify
      expect(result.success).toBe(true)
      expect(result.migrationsRun).toContain('0001_test_migration_1.sql')
      expect(result.migrationsRun).toContain('0002_test_migration_2.sql')
      expect(result.errors).toHaveLength(0)

      // Verify tables were created
      try {
        if (db.execute) {
          await db.execute('SELECT 1 FROM test_table_1 LIMIT 1')
          await db.execute('SELECT 1 FROM test_table_2 LIMIT 1')
        }
      } catch (error) {
        throw new Error('Migration tables were not created')
      }

      // Cleanup
      if (db.execute) {
        await db.execute('DROP TABLE IF EXISTS test_table_2')
        await db.execute('DROP TABLE IF EXISTS test_table_1')
      }
    })

    it('should execute migrations in alphabetical order', async () => {
      // Requirement 1.2: Execute migrations in order
      
      if (isInMemoryDB) {
        console.log('⏭️  Skipping test for in-memory database')
        return
      }

      // Create migrations with dependencies
      const migration1 = `
        CREATE TABLE IF NOT EXISTS ordered_test_base (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL
        );
      `
      
      const migration2 = `
        CREATE TABLE IF NOT EXISTS ordered_test_dependent (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          base_id INTEGER NOT NULL,
          FOREIGN KEY (base_id) REFERENCES ordered_test_base(id)
        );
      `

      // Write in reverse order to test sorting
      writeFileSync(join(testMigrationsDir, '0002_dependent.sql'), migration2)
      writeFileSync(join(testMigrationsDir, '0001_base.sql'), migration1)

      // Run migrations
      migrationRunner = new MigrationRunner(testMigrationsDir, testRollbackDir)
      const result = await migrationRunner.runMigrations()

      // Verify execution order
      expect(result.success).toBe(true)
      expect(result.migrationsRun[0]).toBe('0001_base.sql')
      expect(result.migrationsRun[1]).toBe('0002_dependent.sql')

      // Cleanup
      if (db.execute) {
        await db.execute('DROP TABLE IF EXISTS ordered_test_dependent')
        await db.execute('DROP TABLE IF EXISTS ordered_test_base')
      }
    })

    it('should log success messages for completed migrations', async () => {
      // Requirement 1.3: Log success messages with migration names
      
      if (isInMemoryDB) {
        console.log('⏭️  Skipping test for in-memory database')
        return
      }

      const migration = `
        CREATE TABLE IF NOT EXISTS log_test_table (
          id INTEGER PRIMARY KEY AUTOINCREMENT
        );
      `

      writeFileSync(join(testMigrationsDir, '0001_log_test.sql'), migration)

      // Capture console output
      const consoleLogs: string[] = []
      const originalLog = console.log
      console.log = (...args: any[]) => {
        consoleLogs.push(args.join(' '))
        originalLog(...args)
      }

      migrationRunner = new MigrationRunner(testMigrationsDir, testRollbackDir)
      await migrationRunner.runMigrations()

      // Restore console.log
      console.log = originalLog

      // Verify logging
      const hasSuccessLog = consoleLogs.some(log => 
        log.includes('✅') && log.includes('0001_log_test.sql')
      )
      expect(hasSuccessLog).toBe(true)

      // Cleanup
      if (db.execute) {
        await db.execute('DROP TABLE IF EXISTS log_test_table')
      }
    })
  })

  describe('Idempotent Migration Execution', () => {
    
    it('should run migrations multiple times without errors', async () => {
      // Requirement 1.2: Migrations are idempotent
      
      if (isInMemoryDB) {
        console.log('⏭️  Skipping test for in-memory database')
        return
      }

      const migration = `
        CREATE TABLE IF NOT EXISTS idempotent_test_table (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          data TEXT
        );
      `

      writeFileSync(join(testMigrationsDir, '0001_idempotent_test.sql'), migration)

      migrationRunner = new MigrationRunner(testMigrationsDir, testRollbackDir)

      // Run migrations first time
      const result1 = await migrationRunner.runMigrations()
      expect(result1.success).toBe(true)

      // Run migrations second time
      const result2 = await migrationRunner.runMigrations()
      expect(result2.success).toBe(true)

      // Run migrations third time
      const result3 = await migrationRunner.runMigrations()
      expect(result3.success).toBe(true)

      // Cleanup
      if (db.execute) {
        await db.execute('DROP TABLE IF EXISTS idempotent_test_table')
      }
    })

    it('should skip already-applied migrations', async () => {
      // Requirement 1.5, 5.5: Skip already-applied migrations
      
      if (isInMemoryDB) {
        console.log('⏭️  Skipping test for in-memory database')
        return
      }

      const migration = `
        CREATE TABLE IF NOT EXISTS skip_test_table (
          id INTEGER PRIMARY KEY AUTOINCREMENT
        );
      `

      writeFileSync(join(testMigrationsDir, '0001_skip_test.sql'), migration)

      migrationRunner = new MigrationRunner(testMigrationsDir, testRollbackDir)

      // Run migrations first time
      const result1 = await migrationRunner.runMigrations()
      expect(result1.success).toBe(true)
      expect(result1.migrationsRun).toContain('0001_skip_test.sql')

      // Run migrations second time - should skip
      const result2 = await migrationRunner.runMigrations()
      expect(result2.success).toBe(true)
      expect(result2.migrationsRun).toHaveLength(0) // No new migrations run

      // Cleanup
      if (db.execute) {
        await db.execute('DROP TABLE IF EXISTS skip_test_table')
      }
    })

    it('should handle CREATE TABLE IF NOT EXISTS correctly', async () => {
      // Requirement 1.2: Idempotent migrations with IF NOT EXISTS
      
      if (isInMemoryDB) {
        console.log('⏭️  Skipping test for in-memory database')
        return
      }

      const migration = `
        CREATE TABLE IF NOT EXISTS if_not_exists_test (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL
        );
        
        CREATE INDEX IF NOT EXISTS idx_if_not_exists_test_name 
        ON if_not_exists_test(name);
      `

      writeFileSync(join(testMigrationsDir, '0001_if_not_exists.sql'), migration)

      migrationRunner = new MigrationRunner(testMigrationsDir, testRollbackDir)

      // Run multiple times
      for (let i = 0; i < 3; i++) {
        const result = await migrationRunner.runMigrations()
        expect(result.success).toBe(true)
      }

      // Verify table exists and is functional
      if (db.execute) {
        await db.execute('INSERT INTO if_not_exists_test (name) VALUES (?)', ['test'])
        const rows = await db.execute('SELECT * FROM if_not_exists_test WHERE name = ?', ['test'])
        expect(rows).toBeDefined()
      }

      // Cleanup
      if (db.execute) {
        await db.execute('DROP TABLE IF EXISTS if_not_exists_test')
      }
    })
  })

  describe('Table Schema Verification', () => {
    
    it('should create user_settings table with correct schema', async () => {
      // Requirement 1.1, 1.3: Verify user_settings table creation
      
      if (isInMemoryDB) {
        console.log('⏭️  Skipping test for in-memory database')
        return
      }

      // Use actual migration runner with real migrations
      migrationRunner = new MigrationRunner()
      await migrationRunner.runMigrations()

      // Verify user_settings table exists
      try {
        if (db.execute) {
          await db.execute('SELECT 1 FROM user_settings LIMIT 1')
        }
      } catch (error) {
        throw new Error('user_settings table does not exist')
      }

      // Verify schema by inserting and retrieving data
      const testAccount = '0.0.999888'
      
      if (db.execute) {
        // Insert test data
        await db.execute(
          `INSERT OR REPLACE INTO user_settings 
           (account, skip_farmer_verification, skip_investor_verification, demo_bypass, updated_at) 
           VALUES (?, ?, ?, ?, ?)`,
          [testAccount, 1, 0, 1, Date.now()]
        )

        // Retrieve and verify
        const result = await db.execute(
          'SELECT * FROM user_settings WHERE account = ?',
          [testAccount]
        )

        expect(result).toBeDefined()
        const row = (result as any)[0]
        expect(row.account).toBe(testAccount)
        expect(row.skip_farmer_verification).toBe(1)
        expect(row.skip_investor_verification).toBe(0)
        expect(row.demo_bypass).toBe(1)
        expect(row.updated_at).toBeGreaterThan(0)

        // Cleanup
        await db.execute('DELETE FROM user_settings WHERE account = ?', [testAccount])
      }
    })

    it('should create migration_history table with correct schema', async () => {
      // Requirement 5.1, 5.3: Migration history tracking
      
      if (isInMemoryDB) {
        console.log('⏭️  Skipping test for in-memory database')
        return
      }

      migrationRunner = new MigrationRunner()
      await migrationRunner.runMigrations()

      // Verify migration_history table exists
      try {
        if (db.execute) {
          await db.execute('SELECT 1 FROM migration_history LIMIT 1')
        }
      } catch (error) {
        throw new Error('migration_history table does not exist')
      }

      // Verify schema
      if (db.execute) {
        const result = await db.execute(
          'SELECT id, migration_name, applied_at, rolled_back_at FROM migration_history LIMIT 1'
        )
        expect(result).toBeDefined()
      }
    })

    it('should verify all required tables exist', async () => {
      // Requirement 1.5: Verify all tables exist
      
      if (isInMemoryDB) {
        console.log('⏭️  Skipping test for in-memory database')
        return
      }

      migrationRunner = new MigrationRunner()
      await migrationRunner.runMigrations()

      const verificationResult = await migrationRunner.verifyTables()

      // Should have some existing tables
      expect(verificationResult.existingTables.length).toBeGreaterThan(0)
      
      // user_settings should be in existing tables
      expect(verificationResult.existingTables).toContain('user_settings')
    })
  })

  describe('Migration Tracking and History', () => {
    
    it('should record applied migrations in migration_history', async () => {
      // Requirement 5.3: Track migration history
      
      if (isInMemoryDB) {
        console.log('⏭️  Skipping test for in-memory database')
        return
      }

      const migration = `
        CREATE TABLE IF NOT EXISTS history_test_table (
          id INTEGER PRIMARY KEY AUTOINCREMENT
        );
      `

      writeFileSync(join(testMigrationsDir, '0001_history_test.sql'), migration)

      migrationRunner = new MigrationRunner(testMigrationsDir, testRollbackDir)
      await migrationRunner.runMigrations()

      // Check migration history
      const appliedMigrations = await migrationRunner.getAppliedMigrations()
      
      const historyRecord = appliedMigrations.find(
        m => m.migration_name === '0001_history_test.sql'
      )

      expect(historyRecord).toBeDefined()
      expect(historyRecord?.migration_name).toBe('0001_history_test.sql')
      expect(historyRecord?.applied_at).toBeGreaterThan(0)
      expect(historyRecord?.rolled_back_at).toBeNull()

      // Cleanup
      if (db.execute) {
        await db.execute('DROP TABLE IF EXISTS history_test_table')
        await db.execute(
          'DELETE FROM migration_history WHERE migration_name = ?',
          ['0001_history_test.sql']
        )
      }
    })

    it('should skip migrations that are already in history', async () => {
      // Requirement 5.5: Skip already-applied migrations
      
      if (isInMemoryDB) {
        console.log('⏭️  Skipping test for in-memory database')
        return
      }

      const migration = `
        CREATE TABLE IF NOT EXISTS skip_history_test (
          id INTEGER PRIMARY KEY AUTOINCREMENT
        );
      `

      writeFileSync(join(testMigrationsDir, '0001_skip_history.sql'), migration)

      migrationRunner = new MigrationRunner(testMigrationsDir, testRollbackDir)

      // First run
      const result1 = await migrationRunner.runMigrations()
      expect(result1.migrationsRun).toContain('0001_skip_history.sql')

      // Second run - should skip
      const result2 = await migrationRunner.runMigrations()
      expect(result2.migrationsRun).not.toContain('0001_skip_history.sql')

      // Cleanup
      if (db.execute) {
        await db.execute('DROP TABLE IF EXISTS skip_history_test')
        await db.execute(
          'DELETE FROM migration_history WHERE migration_name = ?',
          ['0001_skip_history.sql']
        )
      }
    })

    it('should show applied migrations with timestamps', async () => {
      // Requirement 5.3, 5.6: Show migration history with dates
      
      if (isInMemoryDB) {
        console.log('⏭️  Skipping test for in-memory database')
        return
      }

      migrationRunner = new MigrationRunner()
      await migrationRunner.runMigrations()

      const appliedMigrations = await migrationRunner.getAppliedMigrations()

      // Should have some migrations
      expect(appliedMigrations.length).toBeGreaterThan(0)

      // Each migration should have required fields
      for (const migration of appliedMigrations) {
        expect(migration.id).toBeGreaterThan(0)
        expect(migration.migration_name).toBeTruthy()
        expect(migration.applied_at).toBeGreaterThan(0)
        
        // Verify timestamp is reasonable (not in future)
        const appliedDate = new Date(migration.applied_at * 1000)
        const now = new Date()
        expect(appliedDate.getTime()).toBeLessThanOrEqual(now.getTime())
      }
    })
  })

  describe('Migration Failure and Rollback', () => {
    
    it('should handle migration failure gracefully', async () => {
      // Requirement 1.4: Log error and prevent server startup on failure
      
      if (isInMemoryDB) {
        console.log('⏭️  Skipping test for in-memory database')
        return
      }

      // Create a migration with invalid SQL
      const invalidMigration = `
        CREATE TABLE invalid_syntax (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          INVALID_SYNTAX_HERE
        );
      `

      writeFileSync(join(testMigrationsDir, '0001_invalid.sql'), invalidMigration)

      migrationRunner = new MigrationRunner(testMigrationsDir, testRollbackDir)
      const result = await migrationRunner.runMigrations()

      // Should fail
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('0001_invalid.sql')
    })

    it('should stop executing migrations after first failure', async () => {
      // Requirement 1.4: Don't continue if migration fails
      
      if (isInMemoryDB) {
        console.log('⏭️  Skipping test for in-memory database')
        return
      }

      // Create valid migration
      const validMigration = `
        CREATE TABLE IF NOT EXISTS stop_test_1 (
          id INTEGER PRIMARY KEY AUTOINCREMENT
        );
      `

      // Create invalid migration
      const invalidMigration = `
        INVALID SQL SYNTAX HERE;
      `

      // Create another valid migration (should not run)
      const validMigration2 = `
        CREATE TABLE IF NOT EXISTS stop_test_2 (
          id INTEGER PRIMARY KEY AUTOINCREMENT
        );
      `

      writeFileSync(join(testMigrationsDir, '0001_valid.sql'), validMigration)
      writeFileSync(join(testMigrationsDir, '0002_invalid.sql'), invalidMigration)
      writeFileSync(join(testMigrationsDir, '0003_should_not_run.sql'), validMigration2)

      migrationRunner = new MigrationRunner(testMigrationsDir, testRollbackDir)
      const result = await migrationRunner.runMigrations()

      // Should fail
      expect(result.success).toBe(false)
      
      // First migration should have run
      expect(result.migrationsRun).toContain('0001_valid.sql')
      
      // Third migration should NOT have run
      expect(result.migrationsRun).not.toContain('0003_should_not_run.sql')

      // Cleanup
      if (db.execute) {
        await db.execute('DROP TABLE IF EXISTS stop_test_1')
        await db.execute('DROP TABLE IF EXISTS stop_test_2')
        await db.execute(
          'DELETE FROM migration_history WHERE migration_name IN (?, ?)',
          ['0001_valid.sql', '0002_invalid.sql']
        )
      }
    })

    it('should log detailed error information on failure', async () => {
      // Requirement 1.4: Log error with details
      
      if (isInMemoryDB) {
        console.log('⏭️  Skipping test for in-memory database')
        return
      }

      const invalidMigration = `
        CREATE TABLE syntax_error (
          id INTEGER PRIMARY KEY,
          SYNTAX ERROR HERE
        );
      `

      writeFileSync(join(testMigrationsDir, '0001_error_test.sql'), invalidMigration)

      // Capture console errors
      const consoleErrors: string[] = []
      const originalError = console.error
      console.error = (...args: any[]) => {
        consoleErrors.push(args.join(' '))
        originalError(...args)
      }

      migrationRunner = new MigrationRunner(testMigrationsDir, testRollbackDir)
      const result = await migrationRunner.runMigrations()

      // Restore console.error
      console.error = originalError

      // Verify error logging
      expect(result.success).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      
      const hasErrorLog = consoleErrors.some(log => 
        log.includes('❌') && log.includes('0001_error_test.sql')
      )
      expect(hasErrorLog).toBe(true)
    })
  })

  describe('In-Memory Database Mode', () => {
    
    it('should skip migrations for in-memory database', async () => {
      // Requirement 1.6: Skip migrations for in-memory DB
      
      if (!isInMemoryDB) {
        console.log('⏭️  Skipping test (not in-memory database)')
        return
      }

      migrationRunner = new MigrationRunner()
      const result = await migrationRunner.runMigrations()

      // Should succeed but not run any migrations
      expect(result.success).toBe(true)
      expect(result.migrationsRun).toHaveLength(0)
      expect(result.errors).toHaveLength(0)
    })

    it('should not require migration files for in-memory database', async () => {
      // Requirement 1.6: In-memory DB works without migrations
      
      if (!isInMemoryDB) {
        console.log('⏭️  Skipping test (not in-memory database)')
        return
      }

      // Create runner with non-existent directory
      migrationRunner = new MigrationRunner('./non-existent-dir')
      const result = await migrationRunner.runMigrations()

      // Should still succeed
      expect(result.success).toBe(true)
    })
  })

  describe('Edge Cases and Error Handling', () => {
    
    it('should handle empty migrations directory', async () => {
      // Edge case: No migration files
      
      if (isInMemoryDB) {
        console.log('⏭️  Skipping test for in-memory database')
        return
      }

      // Ensure directory is empty
      const files = require('fs').readdirSync(testMigrationsDir)
      for (const file of files) {
        if (file.endsWith('.sql')) {
          rmSync(join(testMigrationsDir, file))
        }
      }

      migrationRunner = new MigrationRunner(testMigrationsDir, testRollbackDir)
      const result = await migrationRunner.runMigrations()

      expect(result.success).toBe(true)
      expect(result.migrationsRun).toHaveLength(0)
      expect(result.errors).toHaveLength(0)
    })

    it('should handle migrations with comments', async () => {
      // Edge case: SQL comments in migrations
      
      if (isInMemoryDB) {
        console.log('⏭️  Skipping test for in-memory database')
        return
      }

      const migrationWithComments = `
        -- This is a comment
        CREATE TABLE IF NOT EXISTS comment_test (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          -- Column comment
          name TEXT NOT NULL
        );
        
        -- Another comment
        CREATE INDEX IF NOT EXISTS idx_comment_test_name ON comment_test(name);
      `

      writeFileSync(join(testMigrationsDir, '0001_comments.sql'), migrationWithComments)

      migrationRunner = new MigrationRunner(testMigrationsDir, testRollbackDir)
      const result = await migrationRunner.runMigrations()

      expect(result.success).toBe(true)
      expect(result.migrationsRun).toContain('0001_comments.sql')

      // Cleanup
      if (db.execute) {
        await db.execute('DROP TABLE IF EXISTS comment_test')
        await db.execute(
          'DELETE FROM migration_history WHERE migration_name = ?',
          ['0001_comments.sql']
        )
      }
    })

    it('should handle migrations with multiple statements', async () => {
      // Edge case: Multiple SQL statements in one migration
      
      if (isInMemoryDB) {
        console.log('⏭️  Skipping test for in-memory database')
        return
      }

      const multiStatementMigration = `
        CREATE TABLE IF NOT EXISTS multi_test_1 (
          id INTEGER PRIMARY KEY AUTOINCREMENT
        );
        
        CREATE TABLE IF NOT EXISTS multi_test_2 (
          id INTEGER PRIMARY KEY AUTOINCREMENT
        );
        
        CREATE TABLE IF NOT EXISTS multi_test_3 (
          id INTEGER PRIMARY KEY AUTOINCREMENT
        );
      `

      writeFileSync(join(testMigrationsDir, '0001_multi.sql'), multiStatementMigration)

      migrationRunner = new MigrationRunner(testMigrationsDir, testRollbackDir)
      const result = await migrationRunner.runMigrations()

      expect(result.success).toBe(true)

      // Verify all tables were created
      if (db.execute) {
        await db.execute('SELECT 1 FROM multi_test_1 LIMIT 1')
        await db.execute('SELECT 1 FROM multi_test_2 LIMIT 1')
        await db.execute('SELECT 1 FROM multi_test_3 LIMIT 1')

        // Cleanup
        await db.execute('DROP TABLE IF EXISTS multi_test_3')
        await db.execute('DROP TABLE IF EXISTS multi_test_2')
        await db.execute('DROP TABLE IF EXISTS multi_test_1')
        await db.execute(
          'DELETE FROM migration_history WHERE migration_name = ?',
          ['0001_multi.sql']
        )
      }
    })

    it('should handle non-existent migrations directory', async () => {
      // Edge case: Migrations directory doesn't exist
      
      if (isInMemoryDB) {
        console.log('⏭️  Skipping test for in-memory database')
        return
      }

      migrationRunner = new MigrationRunner('./non-existent-migrations-dir')
      const result = await migrationRunner.runMigrations()

      // Should succeed with no migrations run
      expect(result.success).toBe(true)
      expect(result.migrationsRun).toHaveLength(0)
    })
  })
})
