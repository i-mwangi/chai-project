# 🚀 START HERE - Turso Setup in 5 Minutes

## Copy & Paste These Commands

### Step 1: Install Turso (PowerShell)
```powershell
irm get.turso.tech/install.ps1 | iex
```
**Close and reopen your terminal after this!**

---

### Step 2: Sign Up
```bash
turso auth signup
```
(Opens browser - sign up with GitHub/Google)

---

### Step 3: Create Database
```bash
turso db create chai-platform
```

---

### Step 4: Get URL
```bash
turso db show chai-platform --url
```
**Copy the output!** It looks like:
```
libsql://chai-platform-yourname.turso.io
```

---

### Step 5: Get Token
```bash
turso db tokens create chai-platform
```
**Copy the output!** It looks like:
```
eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
```

---

### Step 6: Update .env
Open your `.env` file and add these lines (use YOUR values from steps 4 & 5):

```env
TURSO_DATABASE_URL=libsql://chai-platform-yourname.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...
```

---

### Step 7: Test Connection
```bash
pnpm run test:turso
```
You should see: ✅ Connection successful!

---

### Step 8: Run Migrations
```bash
pnpm run migrate
```

---

### Step 9: Add to Vercel

Go to: **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**

Add these 3 variables:

| Variable Name | Value |
|--------------|-------|
| `TURSO_DATABASE_URL` | `libsql://chai-platform-yourname.turso.io` |
| `TURSO_AUTH_TOKEN` | `eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...` |
| `DATABASE_URL` | Same as `TURSO_DATABASE_URL` |

**Important**: Add to all environments (Production, Preview, Development)

---

### Step 10: Deploy
```bash
vercel --prod
```

---

## ✅ Done!

Your database is now:
- ✅ Free forever
- ✅ 9 GB storage
- ✅ Works on Vercel
- ✅ No credit card needed

---

## 🐛 Troubleshooting

### "turso: command not found"
Restart your terminal after Step 1

### "Connection failed"
- Check your `.env` file has the correct URL and token
- Make sure you copied them exactly (no extra spaces)

### "No tables found"
Run: `pnpm run migrate`

---

## 📚 More Help

- **Detailed Guide**: Open `TURSO-QUICKSTART.md`
- **Full Documentation**: Open `TURSO-SETUP-GUIDE.md`
- **Test Connection**: Run `pnpm run test:turso`

---

**That's it! You're ready to deploy! 🎉**
