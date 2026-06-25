# Talent Dashboard - Setup & Run Guide

Your dashboard is now **fully editable with auto-save to files**.

## Quick Start (3 steps)

### 1. Install Node.js
Download and install from: https://nodejs.org/ (LTS version recommended)

Verify installation:
```bash
node --version
npm --version
```

### 2. Install Dependencies
Open Terminal/Command Prompt in your dashboard folder and run:

```bash
npm install express
```

### 3. Start the Server
In the same terminal, run:

```bash
node server.js
```

You should see:
```
✓ Talent Dashboard Server Running

📍 Open in browser: http://localhost:3000

✎ Dashboard is now editable with auto-save to files
```

### 4. Open in Browser
Go to: **http://localhost:3000**

---

## How to Edit & Save

### Edit Candidate Records
1. Click on a candidate in the pipeline table
2. View their details in the "Candidate Detail" section
3. Click on any field to edit:
   - Candidate name
   - Stage
   - Interview score
   - Risk level
   - Next step
   - Comments

### Auto-Save
- Changes are automatically saved when you click away from a field
- Status bar shows: "💾 Auto-saving..." then "✓ Synced to file - [time]"
- Your changes are written directly to `data-loader.js`

### Manual Save
Click the blue **"Save locally"** button to manually sync all changes:
- Status updates
- Candidate information
- Funnel data

---

## What Gets Saved

When you save, these files are updated:
- ✅ `data-loader.js` — Main data file (auto-updated)
- ✅ `data/candidates.json` — Backup reference (manual update via UPLOAD.md)
- ✅ Browser localStorage — Editable title/summary text

**Not saved** (excluded for security):
- ❌ Salary expectations
- ❌ Work authorization info
- ❌ Personal contact details

---

## Troubleshooting

### "Cannot GET /" or connection refused
**Problem:** Server not running
**Solution:** Make sure you ran `node server.js` in terminal and it shows "Server Running"

### "Connection error - check if server is running"
**Problem:** Browser can't reach server
**Solution:** 
1. Check terminal shows server running
2. Try navigating to http://localhost:3000 directly
3. Restart server: Stop (Ctrl+C) and run `node server.js` again

### Changes not saving
**Problem:** Server connection issue
**Solution:**
1. Check status bar says "✓ Synced to file"
2. Manually click "Save locally" button
3. Restart server and try again

### "npm: command not found"
**Problem:** Node.js not installed
**Solution:** Install from https://nodejs.org/ and restart terminal

---

## File Locations

| File | Purpose |
|------|---------|
| `data-loader.js` | **Main data** - Updated by server on every save |
| `data/candidates.json` | Backup (see UPLOAD.md to sync) |
| `data/roles.json` | Role metadata |
| `data/funnel.json` | Funnel statistics |
| `server.js` | Node.js server (handles file saves) |

---

## Keeping the Server Running

**During development:**
- Leave the terminal open with `node server.js` running
- Restart server if you make code changes

**For production:**
- Consider using `pm2` or `forever` to keep server running automatically
- Or host on a platform like Heroku, AWS, etc.

```bash
# Optional: install process manager
npm install -g pm2
pm2 start server.js --name talent-dashboard
```

---

## Syncing Changes

### From Dashboard → Files
✅ Automatic when you edit fields  
✅ Click "Save locally" button to sync manually

### From Files → Dashboard
1. Stop server (Ctrl+C)
2. Edit `data-loader.js` manually
3. Restart server (`node server.js`)
4. Refresh browser (F5)

### From ATS/Excel → Dashboard
1. Export candidates from your ATS (CSV)
2. Follow instructions in `DATA_FIELD_MAPPING.md`
3. Update `data-loader.js`
4. Save via dashboard UI or manual save button

---

## Next Steps

1. ✅ Install Node.js
2. ✅ Run `npm install express`
3. ✅ Start server: `node server.js`
4. ✅ Open http://localhost:3000
5. ✅ Edit candidates and watch them auto-save
6. ✅ Share your pipeline with your team (see SHAREPOINT.md)

---

## Support

**Error messages:**
- Check terminal where server is running - it logs all requests
- Browser DevTools (F12) shows network errors
- Status bar shows real-time save feedback

**Data issues:**
- See `DATA_FIELD_MAPPING.md` for field definitions
- See `SCHEMA_REFERENCE.md` for valid values
- See `FUNNEL_SUMMARY.md` for how counts work

**Want to stop editing?**
- Just close the browser or stop the server (Ctrl+C in terminal)
- Your data is safe - changes are only written when you save
