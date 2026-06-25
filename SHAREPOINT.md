# Sharing the Talent Dashboard via SharePoint (Optional)

This guide explains how to share the dashboard with your team via SharePoint while keeping candidate data secure.

## The Problem
- The dashboard works offline (file:// protocol)
- If you share the entire folder, everyone sees `data-loader.js` which contains all candidate data
- You want some people to see the dashboard but restrict who can see candidate details

## The Solution
Split the files into two SharePoint folders with different permissions:

### Folder 1: Public Dashboard Files
**Location**: `SharePoint/Talent-Dashboard-Public`
**Who can access**: Anyone on your team who needs to see the dashboard
**Contains**: 
- `index.html`
- `style.css`
- `app.js`
- `demo-data/` (for reference only)

**Permissions**: Read-only for your team

### Folder 2: Candidate Data (Restricted)
**Location**: `SharePoint/Talent-Dashboard-Data` (or keep on your machine)
**Who can access**: Only you, hiring manager, or leadership who approved
**Contains**:
- `data-loader.js` (with real candidate data)
- `roles.json`
- `candidates.json`
- `funnel.json`

**Permissions**: Restricted — only specific people can view

## How to Set It Up

### Step 1: Upload Public Files
1. In SharePoint, create folder: `Talent-Dashboard-Public`
2. Upload: `index.html`, `style.css`, `app.js`, `demo-data/`
3. Share the folder (read-only) with your team
4. Note the full URL: `https://[org].sharepoint.com/sites/[site]/Shared%20Documents/Talent-Dashboard-Public/index.html`

### Step 2: Keep Data Restricted
**Option A: Keep on your machine only**
- Store `data-loader.js` locally (never upload)
- Team opens the SharePoint HTML, but data doesn't load
- **Drawback**: Data doesn't display for remote team

**Option B: Upload to restricted SharePoint folder**
1. Create folder: `Talent-Dashboard-Data`
2. Upload only: `data-loader.js`, `roles.json`, `candidates.json`, `funnel.json`, `scorecards.json`
3. Restrict permissions to only hiring managers/leadership (not the full team)
4. Modify `app.js` to load from the restricted data folder URL
   - Change data loading to point to: `https://[org].sharepoint.com/sites/[site]/Shared%20Documents/Talent-Dashboard-Data/data-loader.js`

### Step 3: Test
- From your team's browser, open the public SharePoint link
- Verify the dashboard loads correctly
- Check that only authorized people can access the data folder

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Team sees candidate names if they can access data | Restrict folder permissions; only hiring manager/leadership |
| Files get out of sync | Use a versioning system; keep one source of truth |
| Someone downloads the data folder | SharePoint audit logs show who accessed what; consider DLP policies |
| Password/token exposure in URL | This is why we restrict folder-level permissions, not URL-based |

## For Later: Better Security

If you use this dashboard long-term, consider:
1. **Move to a real HRIS/ATS**: Workday, Greenhouse, Lever (these have proper access controls)
2. **Build a simple backend**: Node/Python app that checks identity before serving candidate data
3. **Add authentication**: Even a simple login screen is better than folder permissions alone

## Questions?

- Is this the right approach for your team size and sharing needs?
- Do you need real-time updates or is this a snapshot dashboard?
- How many people need access vs. how many should see candidates?

Answer these and you can decide if SharePoint is the right home.
