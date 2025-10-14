const sqlite3 = require('better-sqlite3');
const db = sqlite3('./db/coffee-platform.db');

console.log('Checking withdrawal tables...\n');

const tables = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' 
    AND (name LIKE '%withdrawal%' OR name LIKE '%balance%')
`).all();

console.log('Found tables:', tables);

if (tables.length === 0) {
    console.log('\n❌ No withdrawal tables found. Running migration...\n');
    const fs = require('fs');
    const sql = fs.readFileSync('./db/migrations/add-withdrawal-tables.sql', 'utf8');
    db.exec(sql);
    console.log('✅ Migration completed!\n');
    
    const newTables = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        AND (name LIKE '%withdrawal%' OR name LIKE '%balance%')
    `).all();
    console.log('Tables after migration:', newTables);
} else {
    console.log('\n✅ Withdrawal tables exist');
}

db.close();
