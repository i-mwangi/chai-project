import { db } from './db/index.js'

console.log('\n🔍 Checking in-memory database...\n')

if ((db as any).__dumpStorage) {
    console.log('✅ Using in-memory database')
    const storage = (db as any).__dumpStorage()
    console.log('\nTables in storage:')
    for (const [tableName, records] of Object.entries(storage)) {
        console.log(`  ${tableName}: ${(records as any[]).length} records`)
        if ((records as any[]).length > 0 && (records as any[]).length < 10) {
            (records as any[]).forEach((record: any, i: number) => {
                if (record.groveName) {
                    console.log(`    ${i + 1}. ${record.groveName} (ID: ${record.id})`)
                }
            })
        }
    }
} else {
    console.log('Using real SQLite database')
}
