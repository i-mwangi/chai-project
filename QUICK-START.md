# ⚡ Quick Start - Chai Coffee Platform

## Fastest Way to Start

### Windows (Recommended)
```bash
restart-all-servers.bat
```
Then open: http://localhost:3000

### Cross-Platform
```bash
# Terminal 1 - Backend
tsx api/server.ts

# Terminal 2 - Frontend
node frontend/api-server.js
```

---

## Common Commands

| What You Want | Command |
|---------------|---------|
| **Start everything** | `restart-all-servers.bat` |
| **Frontend only** | `npm run dev` |
| **Full stack** | `npm run dev:full` |
| **View database** | `npm run studio` |
| **Run tests** | `npm run test` |

---

## Ports

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **Database Studio**: http://localhost:4983

---

## First Time Setup

```bash
# 1. Install dependencies
npm install

# 2. Initialize database
npm run init-db

# 3. Start servers
restart-all-servers.bat
```

---

## Troubleshooting

**Port in use?**
```bash
restart-all-servers.bat  # Automatically kills old processes
```

**Database issues?**
```bash
npm run init-db
```

**Module errors?**
```bash
npm install
```

---

See [START-PROJECT.md](START-PROJECT.md) for detailed documentation.
