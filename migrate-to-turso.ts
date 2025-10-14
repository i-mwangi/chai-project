#!/usr/bin/env tsx
/**
 * Migrate local SQLite data to Turso
 * Run this after setting up Turso to copy your local data
 */

import 'dotenv/config'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import BetterSqlite3 from 'better-sqlite3'
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3'
import * as schema from './db/schema'

async function migrateToTurso() {
  console.log('🚀 Starting migration to Turso...\n')

  // Check environment variables
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  if (!tursoUrl || !tursoToken) {
    console.error('❌ Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in .env')
    console.log('\nAdd these to your .env file:')
    console.log('TURSO_DATABASE_URL=libsql://chai-platform-yourname.turso.io')
    console.log('TURSO_AUTH_TOKEN=your-token-here')
    process.exit(1)
  }

  try {
    // Connect to local SQLite
    console.log('📁 Connecting to local SQLite database...')
    const localDb = new BetterSqlite3('./local-store/sqlite/sqlite.db')
    const localDrizzle = drizzleSqlite(localDb, { schema })

    // Connect to Turso
    console.log('☁️  Connecting to Turso database...')
    const tursoClient = createClient({
      url: tursoUrl,
      authToken: tursoToken
    })
    const tursoDrizzle = drizzle(tursoClient, { schema })

    console.log('✅ Connected to both databases\n')

    // Get list of tables to migrate
    const tables = [
      { name: 'coffeeGroves', schema: schema.coffeeGroves },
      { name: 'tokenHoldings', schema: schema.tokenHoldings },
      { name: 'harvestRecords', schema: schema.harvestRecords },
      { name: 'revenueDistributions', schema: schema.revenueDistributions },
      { name: 'farmerBalances', schema: schema.farmerBalances },
      { name: 'farmerWithdrawals', schema: schema.farmerWithdrawals },
      { name: 'liquidityWithdrawals', schema: schema.liquidityWithdrawals },
      { name: 'transactionHistory', schema: schema.transactionHistory },
      // Add more tables as needed
    ]

    console.log('📊 Migrating data...\n')

    for (const table of tables) {
      try {
        console.log(`  Migrating ${table.name}...`)
        
        // Read from local
        const data = await localDrizzle.select().from(table.schema)
        
        if (data.length === 0) {
          console.log(`    ⚠️  No data in ${table.name}`)
          continue
        }

        // Write to Turso
        await tursoDrizzle.insert(table.schema).values(data)
        console.log(`    ✅ Migrated ${data.length} rows from ${table.name}`)
      } catch (error: any) {
        console.log(`    ⚠️  Error migrating ${table.name}: ${error.message}`)
      }
    }

    console.log('\n✅ Migration complete!')
    console.log('\nNext steps:')
    console.log('1. Verify data in Turso: turso db shell chai-platform')
    console.log('2. Update Vercel environment variables')
    console.log('3. Deploy to Vercel')

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message)
    process.exit(1)
  }
}

migrateToTurso()
