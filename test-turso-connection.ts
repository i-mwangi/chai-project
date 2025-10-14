#!/usr/bin/env tsx
/**
 * Test Turso database connection
 * Run: tsx test-turso-connection.ts
 */

import 'dotenv/config'
import { createClient } from '@libsql/client'

async function testConnection() {
  console.log('🧪 Testing Turso Connection...\n')

  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  // Check environment variables
  if (!tursoUrl) {
    console.error('❌ TURSO_DATABASE_URL is not set in .env')
    console.log('\nAdd this to your .env file:')
    console.log('TURSO_DATABASE_URL=libsql://chai-platform-yourname.turso.io')
    process.exit(1)
  }

  if (!tursoToken) {
    console.error('❌ TURSO_AUTH_TOKEN is not set in .env')
    console.log('\nAdd this to your .env file:')
    console.log('TURSO_AUTH_TOKEN=your-token-here')
    process.exit(1)
  }

  console.log('✅ Environment variables found')
  console.log(`   URL: ${tursoUrl}`)
  console.log(`   Token: ${tursoToken.substring(0, 20)}...`)
  console.log()

  try {
    // Create client
    console.log('🔌 Connecting to Turso...')
    const client = createClient({
      url: tursoUrl,
      authToken: tursoToken
    })

    // Test query
    console.log('📊 Running test query...')
    const result = await client.execute('SELECT 1 as test')
    
    if (result.rows.length > 0) {
      console.log('✅ Connection successful!')
      console.log(`   Test query returned: ${JSON.stringify(result.rows[0])}`)
    }

    // Check tables
    console.log('\n📋 Checking tables...')
    const tables = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `)

    if (tables.rows.length === 0) {
      console.log('⚠️  No tables found. Run migrations:')
      console.log('   pnpm run migrate')
    } else {
      console.log(`✅ Found ${tables.rows.length} tables:`)
      tables.rows.forEach((row: any) => {
        console.log(`   - ${row.name}`)
      })
    }

    console.log('\n🎉 Turso is ready to use!')
    console.log('\nNext steps:')
    console.log('1. Run migrations if needed: pnpm run migrate')
    console.log('2. Add these to Vercel environment variables')
    console.log('3. Deploy: vercel --prod')

  } catch (error: any) {
    console.error('\n❌ Connection failed:', error.message)
    console.log('\nTroubleshooting:')
    console.log('1. Check your TURSO_DATABASE_URL is correct')
    console.log('2. Verify your TURSO_AUTH_TOKEN is valid')
    console.log('3. Run: turso db tokens list chai-platform')
    console.log('4. Create new token if needed: turso db tokens create chai-platform')
    process.exit(1)
  }
}

testConnection()
