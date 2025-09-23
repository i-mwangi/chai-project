import "dotenv/config"
import { createRequire } from 'module'

// If the developer intends to disable investor KYC (or wants to run the
// app in an environment without native SQLite bindings), we provide a
// minimal in-memory mock DB to allow seeding and server startup without
// depending on `better-sqlite3` or other native modules.

const FORCE_IN_MEMORY = (process.env.DISABLE_INVESTOR_KYC || 'false').toLowerCase() === 'true'

let dbVar: any = null

function createInMemoryMockDb() {
  type TableKey = any
  const tableMap = new Map<TableKey, string>()
  const storage = new Map<string, any[]>()
  let tableCounter = 1

  function tableNameFor(table: any) {
    if (tableMap.has(table)) return tableMap.get(table) as string
    const name = `table_${tableCounter++}`
    tableMap.set(table, name)
    if (!storage.has(name)) storage.set(name, [])
    return name
  }

  const mockDb: any = {
    select(projection?: any) {
      const qb: any = {
        _projection: projection,
        _tableName: null,
        _where: null,
        _orderBy: null,
        _limit: null,
        _joins: [] as any[],
        _offset: null as number | null,
        from(table: any) {
          this._tableName = tableNameFor(table)
          return this
        },
        where(predicate: any) {
          this._where = predicate
          return this
        },
        orderBy(_arg: any) {
          this._orderBy = _arg
          return this
        },
        innerJoin(joinTable: any, _predicate?: any) {
          this._joins.push({ tableName: tableNameFor(joinTable) })
          return this
        },
        limit(n: number) {
          this._limit = n
          return this
        },
        offset(n: number) {
          this._offset = n
          return this
        },
        async execute() {
          const arr = (storage.get(this._tableName) || []).slice()
          let results = arr

          const p = this._where
          if (p) {
            if (typeof p === 'function') {
              results = results.filter(p)
            } else if (typeof p === 'object') {
              results = results.filter((row: any) => {
                try {
                  for (const k of Object.keys(p)) {
                    const v = (p as any)[k]
                    if (v && typeof v === 'object') {
                      if (v.op && 'right' in v) {
                        const leftVal = row[k]
                        const rightVal = v.right
                        switch (v.op) {
                          case 'gte': if (!(leftVal >= rightVal)) return false; break
                          case 'lte': if (!(leftVal <= rightVal)) return false; break
                          case 'gt': if (!(leftVal > rightVal)) return false; break
                          case 'lt': if (!(leftVal < rightVal)) return false; break
                          case 'neq': if (leftVal === rightVal) return false; break
                          default: if (leftVal !== rightVal) return false; break
                        }
                      } else if ('right' in v) {
                        if (row[k] !== v.right) return false
                      } else {
                        if (row[k] !== v) return false
                      }
                    } else {
                      if (row[k] !== v) return false
                    }
                  }
                  return true
                } catch (e) {
                  return false
                }
              })
            }
          }

          if (this._joins && this._joins.length > 0) {
            for (const j of this._joins) {
              const joinArr = (storage.get(j.tableName) || []).slice()
              results = results.map((baseRow: any) => {
                const keys = Object.keys(baseRow)
                let matched: any = null
                for (const k of keys) {
                  if (k.toLowerCase().endsWith('id')) {
                    const val = baseRow[k]
                    matched = joinArr.find(jr => jr && jr.id === val)
                    if (matched) break
                  }
                }
                if (matched) {
                  return { ...matched, ...baseRow }
                }
                return baseRow
              })
            }
          }

          const offset = typeof this._offset === 'number' ? this._offset : 0
          if (typeof this._limit === 'number') {
            results = results.slice(offset, offset + this._limit)
          } else if (offset) {
            results = results.slice(offset)
          }

          if (this._projection && typeof this._projection === 'object') {
            const projKeys = Object.keys(this._projection)
            results = results.map((row: any) => {
              const out: any = {}
              for (const k of projKeys) {
                if (k in row) out[k] = row[k]
                else if (row[k] === undefined) {
                  out[k] = row[k]
                } else {
                  out[k] = row[k]
                }
              }
              return out
            })
          }

          return results
        },
        then(onFulfilled: any, onRejected: any) {
          return this.execute().then(onFulfilled, onRejected)
        }
      }

      return qb
    },
    async delete(table: any) {
      const t = tableNameFor(table)
      storage.set(t, [])
      return Promise.resolve()
    },
    insert(table: any) {
      const t = tableNameFor(table)
      return {
        values: (vals: any) => {
          const rows: any[] = Array.isArray(vals) ? vals.slice() : [vals]
          const stored = storage.get(t) || []
          for (const r of rows) {
            if (r && (r.id === undefined || r.id === null)) {
              r.id = stored.length + 1
            }
            stored.push(r)
          }
          storage.set(t, stored)
          return {
            returning: async (_sel?: any) => rows.map((r: any) => ({ ...r }))
          }
        }
      }
    },
    update(table: any) {
      const t = tableNameFor(table)
      return {
        set: (obj: any) => ({
          where: async (_predicate: any) => {
            const arr = storage.get(t) || []
            for (let i = 0; i < arr.length; i++) {
              arr[i] = { ...arr[i], ...obj }
            }
            storage.set(t, arr)
            return Promise.resolve()
          }
        })
      }
    },
    query: new Proxy({}, {
      get(_, tableObj: any) {
        return {
          findFirst: async ({ where }: any = {}) => {
            const t = tableNameFor(tableObj)
            const arr = storage.get(t) || []
            if (!where) return arr[0] || null
            for (const row of arr) {
              let ok = true
              if (typeof where === 'function') return row
              for (const k of Object.keys(where)) {
                const v = where[k]
                if (v && typeof v === 'object' && 'right' in v) {
                  const val = v.right
                  if (row[k] !== val) { ok = false; break }
                } else {
                  if (row[k] !== v) { ok = false; break }
                }
              }
              if (ok) return row
            }
            return null
          },
          findMany: async ({ where }: any = {}) => {
            const t = tableNameFor(tableObj)
            const arr = storage.get(t) || []
            if (!where) return arr.slice()
            return arr.filter((row: any) => {
              for (const k of Object.keys(where)) {
                const v = where[k]
                if (v && typeof v === 'object' && 'right' in v) {
                  if (row[k] !== v.right) return false
                } else {
                  if (row[k] !== v) return false
                }
              }
              return true
            })
          }
        }
      }
    })
  }

  return mockDb
}

if (FORCE_IN_MEMORY) {
  dbVar = createInMemoryMockDb()

} else {
  // Use dynamic require to avoid top-level import errors when native
  // modules are unavailable in some environments.
  try {
    const require = createRequire(import.meta.url)
    const drizzleMod = require('drizzle-orm/better-sqlite3')
    const BetterSqlite3 = require('better-sqlite3')
    const schema = require('./schema')

    const sqliteInstance = new BetterSqlite3('./local-store/sqlite/sqlite.db')
    dbVar = drizzleMod.drizzle(sqliteInstance, { schema })
  } catch (e) {
    console.warn('Failed to load native SQLite bindings; falling back to in-memory DB for demo/testing.', e)
    dbVar = createInMemoryMockDb()
  }
}

export const db: any = dbVar
