import { db } from './db/index.js'

console.log('\n🔍 Checking database type...\n')

if ((db as any).__dumpStorage) {
    console.log('❌ Using IN-MEMORY mock database')
    console.log('   This means data is not persisted!')
    console.log('\n💡 To use real SQLite database:')
    console.log('   - Make sure DISABLE_INVESTOR_KYC is not set to "true" in .env')
    console.log('   - Or remove the DISABLE_INVESTOR_KYC environment variable')
} else {
    console.log('✅ Using real SQLite database')
    console.log('   Data will be persisted to disk')
}

console.log('\nEnvironment variables:')
console.log('  DISABLE_INVESTOR_KYC:', process.env.DISABLE_INVESTOR_KYC || '(not set)')
console.log('  NETWORK:', process.env.NETWORK || '(not set)')
