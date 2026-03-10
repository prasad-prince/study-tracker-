# 🔧 Quick Fix for Path Error

## The Problem
You have Express 5.x installed, which has breaking changes with route paths. The `*` syntax is no longer supported.

## ✅ Solution (Choose One)

### Option 1: Downgrade to Express 4 (Recommended)

Run these commands:

```bash
cd backend
npm uninstall express
npm install express@4.18.2
npm install node-fetch@2.7.0
npm start
```

### Option 2: Fix the Route for Express 5

If you want to keep Express 5, update line 210 in `server.js`:

**Change this:**
```javascript
app.get('*', (req, res) => {
```

**To this:**
```javascript
app.get('/:path(*)', (req, res) => {
```

Or simply remove that catch-all route entirely since static files are already being served:

**Delete these lines (around line 210-212):**
```javascript
// Catch-all route - serve index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
```

## ⚡ Fastest Fix (3 Commands)

```bash
cd backend
npm install express@4.18.2 node-fetch@2.7.0 --save
npm start
```

## 📁 Check Your Structure

Make sure you have this structure:

```
forntad/
└── backend/
    ├── server.js
    ├── package.json
    ├── .env
    ├── node_modules/
    └── public/
        ├── index.html
        ├── login.html
        └── ... (other HTML files)
```

## 🧪 Test After Fix

After applying the fix, you should see:

```
✨ Study Tracker Server running on port 4000
🌐 Access at: http://localhost:4000
📊 Health check: http://localhost:4000/api/health
```

Then open: http://localhost:4000

## 🚨 Still Having Issues?

### Issue: "Cannot find module 'node-fetch'"

**Fix:**
```bash
npm install node-fetch@2.7.0
```

### Issue: Port already in use

**Fix:**
```bash
# Kill process on port 4000
# Windows:
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:4000 | xargs kill -9
```

### Issue: "Cannot find public/index.html"

**Fix:** Create a `public` folder in the `backend` directory and move all HTML files there.

---

## 💡 Alternative: Fresh Install

If nothing works, start fresh:

```bash
cd backend

# Delete everything
rm -rf node_modules package-lock.json

# Reinstall with correct versions
npm install express@4.18.2 cors@2.8.5 dotenv@16.3.1 node-fetch@2.7.0

# Start
npm start
```

---

## ✅ Success Checklist

- [ ] Express 4.18.2 installed (check package.json)
- [ ] node-fetch installed
- [ ] Server starts without errors
- [ ] Can access http://localhost:4000

---

**Try Option 1 first - it's the fastest and most reliable!**