# ADAPTOVATE Talent Dashboard

Static local dashboard for leadership review of ATS interview and feedback data.

## How To Open

1. Open `index.html` directly in a browser.
2. No server is required.
3. The page works from local files only.

## File Structure

- `index.html` - page structure and section order
- `style.css` - layout, colours, spacing, and responsive design
- `app.js` - dashboard rendering, filters, selection, and local sync
- `data-loader.js` - browser-ready data bundle loaded by `index.html`
- `data/candidates.json` - clean candidate records
- `data/roles.json` - role summaries for the role table
- `data/funnel.json` - funnel totals and stage counts
- `data/scorecards.json` - candidate detail and scorecard data
- `build_dashboard_data.py` - refresh script that rebuilds the data bundle from the clean workbook and ATS exports

## Safe To Edit

- `data/candidates.json`
- `data/roles.json`
- `data/funnel.json`
- `data/scorecards.json`
- `data-loader.js` if you want to replace the full data bundle manually

These files control the dashboard data.

## Change With Care

- `app.js` - changes filtering, selection, chat sync, and rendering
- `style.css` - changes the full visual design
- `index.html` - changes structure, section order, and labels

Only change these files if you are updating the layout or behavior.

## Where The Data Lives

- The clean dashboard data is stored in `data/`.
- `data-loader.js` mirrors that data into `window.TALENT_DATA` so the dashboard can open locally without a backend.
- The clean source workbook used for the latest refresh is `talent_dashboard_clean_output.xlsx` in Downloads.

## How To Update Data

### Open Roles

Edit `data/roles.json`.

Update:
- role title
- office
- pipeline count
- current stage
- average score
- status

### Candidates

Edit `data/candidates.json`.

Update:
- candidate name
- role
- office location
- stage
- status
- source
- interview score
- risk level
- next step
- last updated

### Hiring Funnel

Edit `data/funnel.json`.

Update:
- stage counts
- office counts
- status counts
- risk counts

### Scorecards

Edit `data/scorecards.json`.

Update:
- candidate detail summary
- strengths
- concerns
- what to test next
- scorecard criteria
- assessment notes

## Follow-Up Chat

The `Follow-up Chat` box in `Role Assessment` saves notes locally in the browser.

- It is not connected to a backend.
- It is safe for demo use.
- Notes stay in the browser unless you clear them.

## Claude Cowork Handover Notes

- This is a demo internal dashboard.
- Use ATS data only.
- Do not use real candidate names outside the pipeline and role assessment views.
- Keep headings under 5 words.
- Keep the dashboard simple for leadership.
- Make small targeted updates only.
- Do not redesign the whole dashboard unless asked.
- Data should be updated mainly through the JSON files.
- The follow-up chatbox is for short interview notes, not long chat threads.

## Refreshing From Source

If the clean workbook or ATS exports change, run `build_dashboard_data.py` again to regenerate the JSON files and `data-loader.js`.

## Notes

- Emails, CVs, salary details, contracts, and unnecessary personal data are excluded.
- Candidate names only appear in:
  - Live Candidate Pipeline
  - Role Assessment
  - Candidate Detail / Scorecard
- The dashboard is designed for quick leadership scanning and decision support.
