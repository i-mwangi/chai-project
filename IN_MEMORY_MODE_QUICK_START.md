# In-Memory Database Mode - Quick Start

## 🚀 Quick Enable

```bash
# Windows CMD
set DISABLE_INVESTOR_KYC=true

# Windows PowerShell
$env:DISABLE_INVESTOR_KYC="true"

# Linux/Mac
export DISABLE_INVESTOR_KYC=true
```

Or add to `.env`:
```
DISABLE_INVESTOR_KYC=true
```

## ✅ Quick Verify

```bash
pnpm exec tsx verify-in-memory-mode.ts
```

Expected output:
```
✅ ALL VERIFICATIONS PASSED
✨ System is ready!
```

## 📝 Quick Test

```bash
# Windows
test-in-memory-settings.bat

# Or directly
pnpm exec tsx test-in-memory-settings.ts
```

## 📍 Persistence File

Data is saved to:
```
./local-store/inmemory-db.json
```

## 🔄 How It Works

1. **Startup**: Loads data from JSON file (if exists)
2. **Runtime**: All operations work in-memory
3. **Shutdown**: Saves data to JSON file automatically

## ⚡ Key Features

- ✅ No native dependencies required
- ✅ Automatic migration skipping
- ✅ Data persists across restarts
- ✅ Full user settings support
- ✅ Graceful fallback from SQLite

## 📚 Full Documentation

See: `.kiro/specs/user-settings-database/IN_MEMORY_MODE_GUIDE.md`

## 🧪 Test Files

- `test-in-memory-settings.ts` - Full test suite
- `test-in-memory-restart-simulation.ts` - Restart simulation
- `verify-in-memory-mode.ts` - Quick verification

## ⚠️ Important

In-memory mode is for **development/demo only**. Use SQLite for production.
