import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "./schema"

const sqlite = new Database('local-store/sqlite/sqlite.db');
export const db = drizzle<typeof schema>({ client: sqlite, schema  });
