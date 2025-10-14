/**
 * Manually create transaction_history table
 */

import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'local-store', 'sqlite', 'sqlite.db')
console.log('Database path:', dbPath)

const db = new Database(dbPath)

const createTableSQL = `
CREATE TABLE IF NOT EXISTS transaction_history (
    id TEXT PRIMARY KEY NOT NULL UNIQUE,
    type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    asset TEXT NOT NULL,
    from_address TEXT NOT NULL,
    to_address TEXT NOT NULL,
    status TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    transaction_hash TEXT,
    block_explorer_url TEXT,
    metadata TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
);
`

const createIndexes = `
CREATE INDEX IF NOT EXISTS transaction_history_from_idx ON transaction_history(from_address);
CREATE INDEX IF NOT EXISTS transaction_history_to_idx ON transaction_history(to_address);
CREATE INDEX IF NOT EXISTS transaction_history_type_idx ON transaction_history(type);
CREATE INDEX IF NOT EXISTS transaction_history_status_idx ON transaction_history(status);
CREATE INDEX IF NOT EXISTS transaction_history_timestamp_idx ON transaction_history(timestamp);
`

try {
    console.log('Creating transaction_history table...')
    db.exec(createTableSQL)
    console.log('✓ Table created')
    
    console.log('Creating indexes...')
    db.exec(createIndexes)
    console.log('✓ Indexes created')
    
    console.log('\n✅ Success! transaction_history table is ready.')
} catch (error) {
    console.error('❌ Error:', error)
} finally {
    db.close()
}
