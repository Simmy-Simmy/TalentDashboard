# How to Upload Your Real Candidate Data

This guide walks you through taking the Talent Dashboard from demo to live with your real hiring data.

## What You'll Do
1. Create your real candidate, role, and funnel data
2. Update `data-loader.js` with your data
3. Test in your browser
4. Keep everything in `.gitignore` so it won't accidentally commit

---

## Step 1: Prepare Your Data

### Copy the templates
```
candidates.json.template  →  candidates.json (your real data)
roles.json.template       →  roles.json (your real data)
funnel.json.template      →  funnel.json (your real data)
```

### Open `candidates.json` and fill in your data

**Structure:**
```json
{
  "role-id": [
    {
      "name": "Your Candidate Name",
      "stage": "Interview",
      "fitScore": 4,
      "keyStrength": "What they're good at",
      "mainConcern": "What needs work",
      "nextStep": "Move forward",
      "tags": ["Tag1", "Tag2"],
      "decision": "Move forward",
      "variant": "strong",
      "comment": "Your notes",
      "testNext": "What to test next",
      "reference": "Where this came from (e.g., 'Interview 6/20')"
    }
  ]
}
```

**Tips:**
- Use exactly **2-3 key strengths** (not a list)
- Use exactly **1 main concern** (be specific)
- `fitScore`: 1-5 (1=poor fit, 5=strong fit)
- `stage`: Applied, Screened, Interview, Final, Offer, Hired
- `variant`: strong, balanced, commercial, leadership (affects scorecard shown)
- `decision`: Move forward, Hold, Reject, Need follow-up case, Need leadership input
- Group candidates by `role-id` (match the role ID from roles.json)

### Example (1 week active data with <10 candidates):

```json
{
  "principle-engineer": [
    {
      "name": "Sam Chen",
      "stage": "Interview",
      "fitScore": 4,
      "keyStrength": "Strong system design and communication",
      "mainConcern": "Limited experience with distributed systems at scale",
      "nextStep": "Move to final round",
      "tags": ["Architecture", "Mentor-ready"],
      "decision": "Move forward",
      "variant": "strong",
      "comment": "Solid fundamentals, clear thinking. Second round confirmed gaps in one area.",
      "testNext": "Deep dive on past distributed system projects",
      "reference": "Panel interview 6/20"
    },
    {
      "name": "Alex Rodriguez",
      "stage": "Final",
      "fitScore": 3,
      "keyStrength": "Great mentorship approach",
      "mainConcern": "Technical depth on newer frameworks",
      "nextStep": "Decision needed",
      "tags": ["Leadership", "People-first"],
      "decision": "Need leadership input",
      "variant": "balanced",
      "comment": "Great fit for team culture. Technical questions: is this a growth opportunity or a blocker?",
      "testNext": "Confirm framework learning speed",
      "reference": "Final panel 6/21"
    }
  ]
}
```

### Do the same for `roles.json`

```json
[
  {
    "id": "principle-engineer",
    "role": "Principle Engineer",
    "office": "US",
    "manager": "Your Name",
    "priority": "High",
    "pipelineCount": 2,
    "currentStage": "Final",
    "daysOpen": 14,
    "status": "Decision Needed",
    "blocker": "Comp alignment",
    "nextAction": "Close decision by EOW",
    "finalists": 2,
    "openOffers": 0,
    "decisionNeeded": "Yes"
  }
]
```

### Do the same for `funnel.json`

```json
{
  "stages": ["Applied", "Screened", "Interview", "Final", "Offer", "Hired"],
  "global": {
    "Applied": 8,
    "Screened": 6,
    "Interview": 4,
    "Final": 2,
    "Offer": 0,
    "Hired": 0
  },
  "offices": {
    "US": {
      "Applied": 8,
      "Screened": 6,
      "Interview": 4,
      "Final": 2,
      "Offer": 0,
      "Hired": 0
    },
    "Canada": { "Applied": 0, "Screened": 0, "Interview": 0, "Final": 0, "Offer": 0, "Hired": 0 },
    "UK": { "Applied": 0, "Screened": 0, "Interview": 0, "Final": 0, "Offer": 0, "Hired": 0 },
    "Poland": { "Applied": 0, "Screened": 0, "Interview": 0, "Final": 0, "Offer": 0, "Hired": 0 }
  }
}
```

---

## Step 2: Update `data-loader.js`

This is the file that feeds your data into the dashboard. It's .gitignored so your real data won't commit.

### Copy your `roles.json` data into `rolesData`
```javascript
window.TALENT_DATA = {
  rolesData: [
    // Paste your roles.json array here
    {
      "id": "principle-engineer",
      "role": "Principle Engineer",
      // ... rest of fields
    }
  ],
```

### Copy your `candidates.json` data into `candidatesByRole`
```javascript
  candidatesByRole: {
    // Paste your candidates.json here
    "principle-engineer": [
      {
        "name": "Sam Chen",
        // ... rest of fields
      }
    ]
  },
```

### Update `funnelSummaryData`
Paste your `funnel.json` content here:
```javascript
  funnelSummaryData: {
    "stages": ["Applied", "Screened", "Interview", "Final", "Offer", "Hired"],
    "global": {
      "Applied": 8,
      // ...
    },
    "offices": {
      // ...
    }
  },
```

### Keep `scorecardLibrary` as-is
(These are the assessment criteria templates — you can customize these later if needed.)

---

## Step 3: Test in Your Browser

1. Open the folder with `index.html` on your machine
2. Double-click `index.html` to open in your browser
3. You should see your real roles and candidates
4. Test:
   - Click on different roles → candidates should appear
   - Click on candidates → detail panel should show
   - Filter by office → should work correctly
   - View "Candidate Detail" tab → your assessment data should show

**If nothing shows up:**
- Check browser console (F12) for errors
- Make sure your JSON is valid (use [jsonlint.com](https://jsonlint.com) to check)
- Make sure all field names match exactly (spelling matters)

---

## Step 4: Keep It Safe

✅ **What's protected:**
- `data-loader.js` is in `.gitignore` — won't be committed
- Your real candidate data stays on your machine
- If you push to git, your data won't leak

⚠️ **What's still open:**
- Anyone with folder access can see your data
- The dashboard doesn't have login/access control
- Keep the folder path private

---

## Step 5: When You're Ready to Share

See `SHAREPOINT.md` for how to share the dashboard with your team via SharePoint (optional).

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Editing is on" but nothing displays | Check browser console (F12) for JSON errors. Validate with jsonlint. |
| Candidates don't appear | Make sure `candidatesByRole` keys match your `rolesData` IDs exactly. |
| Funnel looks wrong | Check that your office names (US, Canada, UK, Poland) match exactly. |
| Can't copy file path | Use "Copy file path" button or manually copy from your browser address bar. |

---

## Next Steps

1. **Get feedback** — Have your hiring team look at the dashboard and tell you what's missing
2. **Iterate** — Update your data-loader.js with new candidates as decisions change
3. **Plan for scale** — If this works well, consider moving to a proper HRIS (Workday, Greenhouse, Lever) for more robust features

---

## Questions?

- Stuck on JSON? Ask ChatGPT to validate your JSON or show you the right format
- Dashboard not loading? Check the browser console (F12 → Console tab) for error messages
- Need to add more roles/candidates? Follow the same structure as your first entry
