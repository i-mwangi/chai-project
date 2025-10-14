import os
import sqlite3

# Create the database directory structure
db_dir = os.path.join(os.getcwd(), 'local-store', 'sqlite')
print(f"Creating database directory: {db_dir}")

# Create directory recursively
os.makedirs(db_dir, exist_ok=True)
print("Database directory created successfully")

# Create the database file
db_path = os.path.join(db_dir, 'sqlite.db')
print(f"Database file path: {db_path}")

# Create the database file and table
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Create the user_settings table
create_table_sql = '''
CREATE TABLE IF NOT EXISTS user_settings (
    account TEXT PRIMARY KEY NOT NULL,
    skip_farmer_verification INTEGER DEFAULT 0,
    skip_investor_verification INTEGER DEFAULT 0,
    demo_bypass INTEGER DEFAULT 0,
    updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
);
'''

cursor.execute(create_table_sql)
print("User settings table created")

# Insert a default record for testing
insert_sql = '''
INSERT OR IGNORE INTO user_settings (account, skip_farmer_verification, skip_investor_verification, demo_bypass)
VALUES ('0.0.123456', 0, 0, 0);
'''

cursor.execute(insert_sql)
print("Default user settings record inserted")

# Query the table
cursor.execute('SELECT * FROM user_settings')
rows = cursor.fetchall()
print(f"Table contents: {rows}")

# Commit and close
conn.commit()
conn.close()
print("Database operations completed")