# Vercel Build Troubleshooting Guide

## 🐛 Common "vercel build" Issues & Solutions

### Issue 1: No Build Command Specified

**Error**:
```
Error: No Build Command specified
```

**Solution**: Update `vercel.json` to include build command:

```json
{
  "version": 2,
  "buildCommand": "pnpm run frontend:build",
  "outputDirectory": "frontend/dist",
  "builds": [
    {
      "src": "api/server.ts",
      "use": "@vercel/node"
    }
  ]
}
```

---

### Issue 2: Build Script Not Found

**Error**:
```
Error: Script "frontend:build" not found
```

**Check**: Your `package.json` has:
```json
{
  "scripts": {
    "frontend:build": "vite build",
    "frontend:preview": "vite preview"
  }
}
```

**If missing**, add it:
```bash
# Edit package.json and add:
"frontend:build": "vite build",
"frontend:preview": "vite preview"
```

---

### Issue 3: TypeScript Build Errors

**Error**:
```
Error: TypeScript compilation failed
```

**Solution**: Skip TypeScript build for frontend-only deployment:

```json
// vercel.json
{
  "buildCommand": "pnpm run frontend:build",
  "ignoreCommand": "git diff --quiet HEAD^ HEAD ./frontend"
}
```

Or update build script:
```json
// package.json
{
  "scripts": {
    "frontend:build": "vite build --mode production"
  }
}
```

---

### Issue 4: Module Not Found

**Error**:
```
Error: Cannot find module '@hashgraph/sdk'
```

**Solution**: Ensure dependencies are installed:

```json
// vercel.json
{
  "installCommand": "pnpm install --frozen-lockfile"
}
```

Or in Vercel Dashboard:
- Settings → General → Install Command: `pnpm install`

---

### Issue 5: Output Directory Not Found

**Error**:
```
Error: Output directory "frontend/dist" not found
```

**Solution**: Verify Vite config:

```javascript
// vite.config.js
export default defineConfig({
  root: 'frontend',
  build: {
    outDir: 'dist',  // Creates frontend/dist
    emptyOutDir: true
  }
});
```

---

### Issue 6: CSS/JS Files Not Found After Build

**Error**: Build succeeds but files missing

**Solution**: Check Vite build output:

```javascript
// vite.config.js
export default defineConfig({
  root: 'frontend',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'frontend/index.html'),
        app: path.resolve(__dirname, 'frontend/app.html')
      }
    }
  }
});
```

---

## 🔧 Complete Fix for Your Project

### Step 1: Update vercel.json

Replace your current `vercel.json` with:

```json
{
  "version": 2,
  "buildCommand": "pnpm run frontend:build",
  "outputDirectory": "frontend/dist",
  "installCommand": "pnpm install",
  "framework": null,
  "builds": [
    {
      "src": "api/server.ts",
      "use": "@vercel/node",
      "config": {
        "maxDuration": 30
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/server.ts"
    },
    {
      "src": "/css/(.*)",
      "dest": "/css/$1"
    },
    {
      "src": "/js/(.*)",
      "dest": "/js/$1"
    },
    {
      "src": "/wallet/(.*)",
      "dest": "/wallet/$1"
    },
    {
      "src": "/styles/(.*)",
      "dest": "/styles/$1"
    },
    {
      "src": "/public/(.*)",
      "dest": "/public/$1"
    },
    {
      "src": "/app.html",
      "dest": "/app.html"
    },
    {
      "src": "/",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*).css",
      "headers": [
        {
          "key": "Content-Type",
          "value": "text/css; charset=utf-8"
        }
      ]
    },
    {
      "source": "/(.*).js",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/javascript; charset=utf-8"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

### Step 2: Verify package.json Scripts

Ensure these scripts exist:

```json
{
  "scripts": {
    "frontend:build": "vite build",
    "frontend:preview": "vite preview",
    "frontend:vite": "vite"
  }
}
```

### Step 3: Test Build Locally

```bash
# Clean previous builds
rm -rf frontend/dist

# Run build
pnpm run frontend:build

# Check output
ls frontend/dist/

# Should see:
# - index.html
# - app.html
# - css/ (or assets/)
# - js/ (or assets/)
# - public/
```

### Step 4: Preview Build

```bash
pnpm run frontend:preview

# Open http://localhost:4173/
# Open http://localhost:4173/app.html
# Both should be styled
```

---

## 🧪 Debugging Commands

### Check Vercel Configuration
```bash
vercel --debug
```

### Check Build Output
```bash
pnpm run frontend:build --debug
```

### Check File Structure
```bash
# After build
tree frontend/dist -L 2
# or
ls -la frontend/dist/
```

### Test Specific File
```bash
# Check if CSS exists
ls frontend/dist/css/design-system.css
# or
ls frontend/dist/assets/*.css
```

---

## 🚨 Common Mistakes

### ❌ Wrong: Using "builds" for static files
```json
{
  "builds": [
    {
      "src": "frontend/**",
      "use": "@vercel/static"
    }
  ]
}
```

### ✅ Correct: Using buildCommand and outputDirectory
```json
{
  "buildCommand": "pnpm run frontend:build",
  "outputDirectory": "frontend/dist"
}
```

---

### ❌ Wrong: Relative paths in HTML
```html
<link rel="stylesheet" href="css/design-system.css">
```

### ✅ Correct: Absolute paths in HTML
```html
<link rel="stylesheet" href="/css/design-system.css">
```

---

### ❌ Wrong: No input files in Vite config
```javascript
export default defineConfig({
  root: 'frontend',
  build: {
    outDir: 'dist'
  }
});
```

### ✅ Correct: Specify all HTML entry points
```javascript
export default defineConfig({
  root: 'frontend',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'frontend/index.html'),
        app: path.resolve(__dirname, 'frontend/app.html')
      }
    }
  }
});
```

---

## 📋 Deployment Checklist

Before running `vercel build`:

- [ ] `vercel.json` has `buildCommand` specified
- [ ] `vercel.json` has `outputDirectory` specified
- [ ] `package.json` has `frontend:build` script
- [ ] `vite.config.js` specifies all HTML inputs
- [ ] All CSS/JS paths in HTML are absolute (start with `/`)
- [ ] Local build works: `pnpm run frontend:build`
- [ ] Local preview works: `pnpm run frontend:preview`
- [ ] No TypeScript errors (or ignored)
- [ ] All dependencies in `package.json`

---

## 🎯 Quick Fix Commands

```bash
# 1. Clean everything
rm -rf frontend/dist node_modules

# 2. Reinstall
pnpm install

# 3. Test build
pnpm run frontend:build

# 4. Test preview
pnpm run frontend:preview

# 5. If all works, deploy
vercel --prod
```

---

## 🔍 Vercel Dashboard Settings

Go to: Vercel Dashboard → Your Project → Settings

### Build & Development Settings:
- **Framework Preset**: Other
- **Build Command**: `pnpm run frontend:build`
- **Output Directory**: `frontend/dist`
- **Install Command**: `pnpm install`
- **Node Version**: 18.x or 20.x

### Environment Variables:
Add all required env vars from `.env.example`

---

## 💡 Pro Tips

1. **Always test locally first**
   ```bash
   pnpm run frontend:build && pnpm run frontend:preview
   ```

2. **Check build output size**
   ```bash
   du -sh frontend/dist/
   ```

3. **Verify all files exist**
   ```bash
   find frontend/dist -name "*.css" | head -5
   find frontend/dist -name "*.js" | head -5
   ```

4. **Use Vercel CLI for debugging**
   ```bash
   vercel build --debug
   vercel deploy --debug
   ```

---

## 🆘 Still Having Issues?

### Get Build Logs:
```bash
vercel logs <deployment-url>
```

### Check Specific Error:
1. Go to Vercel Dashboard
2. Click on failed deployment
3. View "Build Logs"
4. Look for red error messages
5. Copy error and search in this guide

### Common Error Patterns:

| Error Contains | Solution |
|----------------|----------|
| "command not found" | Add script to package.json |
| "module not found" | Run `pnpm install` |
| "output directory" | Check vite.config.js |
| "404" | Check routes in vercel.json |
| "MIME type" | Add headers in vercel.json |

---

Need more help? Share the specific error message!
