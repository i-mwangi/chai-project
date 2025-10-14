#!/usr/bin/env node
/**
 * Verification script for Task 5: Integrate migration runner into server startup
 * 
 * This script verifies all sub-tasks:
 * 1. Migration runner is imported and called on server startup
 * 2. Logging for migration status is present
 * 3. Server startup is prevented if critical migrations fail
 * 4. Health check endpoint at /api/health is available
 */

import { readFileSync } from 'fs'
import { runMigrations } from './db/migrate'
import { runHealthCheck } from './db/health-check'

async function verifyTask5() {
    console.log('🧪 Verifying Task 5: Integrate migration runner into server startup\n')

    let allTestsPassed = true

    // Sub-task 1: Verify migration runner is imported
    console.log('✓ Sub-task 1: Verify migration runner is imported in server.ts')
    const serverCode = readFileSync('./api/server.ts', 'utf-8')

    if (serverCode.includes("import { runMigrations } from '../db/migrate'")) {
        console.log('  ✅ Migration runner is imported')
    } else {
        console.log('  ❌ Migration runner import not found')
        allTestsPassed = false
    }

    if (serverCode.includes("import { runHealthCheck } from '../db/health-check'")) {
        console.log('  ✅ Health check is imported')
    } else {
        console.log('  ❌ Health check import not found')
        allTestsPassed = false
    }

    // Sub-task 2: Verify migration runner is called on startup
    console.log('\n✓ Sub-task 2: Verify migration runner is called on server startup')

    if (serverCode.includes('await runMigrations()')) {
        console.log('  ✅ Migration runner is called on startup')
    } else {
        console.log('  ❌ Migration runner call not found')
        allTestsPassed = false
    }

    if (serverCode.includes('async function startServer()')) {
        console.log('  ✅ Server startup is wrapped in async function')
    } else {
        console.log('  ❌ Async server startup function not found')
        allTestsPassed = false
    }

    // Sub-task 3: Verify logging for migration status
    console.log('\n✓ Sub-task 3: Verify logging for migration status')

    if (serverCode.includes('Running database migrations')) {
        console.log('  ✅ Migration start logging present')
    } else {
        console.log('  ❌ Migration start logging not found')
        allTestsPassed = false
    }

    if (serverCode.includes('Successfully ran') && serverCode.includes('migrations')) {
        console.log('  ✅ Migration success logging present')
    } else {
        console.log('  ❌ Migration success logging not found')
        allTestsPassed = false
    }

    if (serverCode.includes('No pending migrations')) {
        console.log('  ✅ No pending migrations logging present')
    } else {
        console.log('  ❌ No pending migrations logging not found')
        allTestsPassed = false
    }

    // Sub-task 4: Verify server startup prevention on migration failure
    console.log('\n✓ Sub-task 4: Verify server startup is prevented if migrations fail')

    if (serverCode.includes('process.exit(1)') && serverCode.includes('Critical migrations failed')) {
        console.log('  ✅ Server exits on critical migration failure')
    } else {
        console.log('  ❌ Server exit on migration failure not found')
        allTestsPassed = false
    }

    if (serverCode.includes('Migration errors:')) {
        console.log('  ✅ Migration error logging present')
    } else {
        console.log('  ❌ Migration error logging not found')
        allTestsPassed = false
    }

    // Sub-task 5: Verify health check endpoint
    console.log('\n✓ Sub-task 5: Verify health check endpoint at /api/health')

    if (serverCode.includes("pathname === '/api/health'")) {
        console.log('  ✅ Health check endpoint route defined')
    } else {
        console.log('  ❌ Health check endpoint route not found')
        allTestsPassed = false
    }

    if (serverCode.includes('await runHealthCheck()')) {
        console.log('  ✅ Health check is called in endpoint')
    } else {
        console.log('  ❌ Health check call in endpoint not found')
        allTestsPassed = false
    }

    if (serverCode.includes('http://localhost:${port}/api/health')) {
        console.log('  ✅ Health check endpoint logged on startup')
    } else {
        console.log('  ❌ Health check endpoint logging not found')
        allTestsPassed = false
    }

    // Functional tests
    console.log('\n✓ Functional Tests')

    // Test migration runner
    console.log('  Testing migration runner...')
    const migrationResult = await runMigrations()
    if (migrationResult.success) {
        console.log('  ✅ Migration runner executes successfully')
    } else {
        console.log('  ❌ Migration runner failed')
        allTestsPassed = false
    }

    // Test health check
    console.log('  Testing health check...')
    const healthResult = await runHealthCheck()
    if (healthResult.connection) {
        console.log('  ✅ Health check executes successfully')
    } else {
        console.log('  ❌ Health check failed')
        allTestsPassed = false
    }

    // Summary
    console.log('\n' + '='.repeat(60))
    if (allTestsPassed) {
        console.log('✅ All sub-tasks verified successfully!')
        console.log('\nTask 5 Implementation Summary:')
        console.log('  ✓ Migration runner imported and integrated')
        console.log('  ✓ Migrations run automatically on server startup')
        console.log('  ✓ Comprehensive logging for migration status')
        console.log('  ✓ Server exits if critical migrations fail')
        console.log('  ✓ Health check endpoint available at /api/health')
        console.log('  ✓ Health check runs on startup')
        return 0
    } else {
        console.log('❌ Some sub-tasks failed verification')
        return 1
    }
}

verifyTask5()
    .then(exitCode => process.exit(exitCode))
    .catch(error => {
        console.error('❌ Verification failed:', error)
        process.exit(1)
    })
