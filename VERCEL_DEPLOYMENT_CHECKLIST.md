# Vercel Deployment Checklist ✅

Print this and check off items as you complete them!

## 📋 Pre-Deployment

### Code Fixes
- [ ] Run `node fix-css-paths.js` to fix CSS/JS paths
- [ ] Verify `vercel.json` is updated with correct routes
- [ ] Check `vite.config.js` has `base: '/'` set
- [ ] Commit all changes to git

### Local Testing
- [ ] Run `pnpm run frontend:build` successfully
- [ ] Check `frontend/dist/` folder exists
- [ ] Verify `frontend/dist/css/` has all CSS files
- [ ] Verify `frontend/dist/js/` has all JS files
- [ ] Verify `frontend/dist/public/` has all images
- [ ] Run `pnpm run frontend:preview`
- [ ] Test `http://localhost:4173/` loads with styles
- [ ] Test `http://localhost:4173/app.html` loads with styles
- [ ] Check browser console - no 404 errors
- [ ] Test navigation between pages
- [ ] Test button clicks

## 🚀 Deployment

### Vercel Setup
- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Login to Vercel: `vercel login`
- [ ] Link project: `vercel link` (first time only)

### Environment Variables (in Vercel Dashboard)
- [ ] `HEDERA_NETWORK` = testnet
- [ ] `HEDERA_OPERATOR_ID` = your-operator-id
- [ ] `HEDERA_OPERATOR_KEY` = your-private-key
- [ ] `VITE_WALLETCONNECT_PROJECT_ID` = your-project-id
- [ ] `VITE_HEDERA_NETWORK` = testnet
- [ ] `DATABASE_URL` = your-database-url (if using cloud DB)

### Deploy
- [ ] Run `vercel --prod`
- [ ] Wait for deployment to complete
- [ ] Note the deployment URL

## ✅ Post-Deployment Verification

### Basic Checks
- [ ] Open deployment URL in browser
- [ ] Homepage (`/`) loads
- [ ] Homepage has styles (not plain HTML)
- [ ] App page (`/app.html`) loads
- [ ] App page has styles
- [ ] All images load
- [ ] No broken images (check for 404s)

### Developer Tools Checks
- [ ] Open DevTools (F12)
- [ ] **Console tab**: No red errors
- [ ] **Network tab**: Filter by CSS - all files status 200
- [ ] **Network tab**: Filter by JS - all files status 200
- [ ] **Network tab**: Filter by Img - all files status 200
- [ ] **Sources tab**: CSS files are present
- [ ] **Sources tab**: JS files are present

### Functionality Checks
- [ ] Navigation buttons work
- [ ] "Sign Up" button works
- [ ] FAQ link works
- [ ] Notifications dropdown works
- [ ] Can navigate to Farmer Portal
- [ ] Can navigate to Investor Portal
- [ ] Sidebar buttons work in Farmer Portal
- [ ] Sidebar buttons work in Investor Portal
- [ ] "Connect Wallet" button appears
- [ ] Modals open/close correctly

### API Checks (if applicable)
- [ ] Test `/api/health` endpoint
- [ ] Test `/api/groves` endpoint
- [ ] Check API responses in Network tab
- [ ] Verify CORS headers work

## 🐛 Troubleshooting

If something doesn't work, check:

### CSS Not Loading
- [ ] View page source - CSS links start with `/`
- [ ] Check Network tab - CSS files return 200 not 404
- [ ] Check `vercel.json` has CSS route configured
- [ ] Check build output has CSS files

### JS Not Loading
- [ ] Check Network tab - JS files return 200 not 404
- [ ] Check Console for module loading errors
- [ ] Verify `type="module"` in script tags
- [ ] Check MIME type headers in `vercel.json`

### Images Not Loading
- [ ] Check image paths start with `/public/`
- [ ] Verify images exist in `frontend/dist/public/`
- [ ] Check Network tab for 404s
- [ ] Verify `vercel.json` has public route

### Buttons Not Working
- [ ] Check Console for JavaScript errors
- [ ] Verify all JS files loaded
- [ ] Test locally first with `pnpm run frontend:preview`
- [ ] Check if event listeners are attached

### API Not Working
- [ ] Check Vercel Function Logs
- [ ] Verify environment variables are set
- [ ] Check API route in `vercel.json`
- [ ] Test API endpoint directly in browser

## 📊 Performance Checks (Optional)

- [ ] Run Lighthouse audit
- [ ] Check page load time < 3 seconds
- [ ] Check First Contentful Paint < 1.5s
- [ ] Check Time to Interactive < 3.5s
- [ ] Verify images are optimized
- [ ] Check bundle size is reasonable

## 🔒 Security Checks (Optional)

- [ ] HTTPS is enabled (automatic on Vercel)
- [ ] No sensitive data in client-side code
- [ ] Environment variables not exposed
- [ ] API keys not in frontend code
- [ ] CORS configured correctly

## 📱 Mobile Testing (Optional)

- [ ] Test on mobile device
- [ ] Check responsive design works
- [ ] Verify touch interactions work
- [ ] Check mobile navigation
- [ ] Test on different screen sizes

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ All pages load with proper styling
- ✅ No console errors
- ✅ All assets load (CSS, JS, images)
- ✅ Navigation works
- ✅ Buttons are clickable
- ✅ Modals open/close
- ✅ API endpoints respond (if applicable)
- ✅ Wallet connection works (if applicable)

## 📝 Notes

**Deployment URL**: _______________________________

**Date Deployed**: _______________________________

**Issues Found**: 
- _______________________________
- _______________________________
- _______________________________

**Resolved**: 
- _______________________________
- _______________________________
- _______________________________

---

**Pro Tip**: Keep this checklist handy for future deployments!
