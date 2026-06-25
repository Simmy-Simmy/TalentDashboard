# Manual Data Entry Guide

Your dashboard is now a **clean template**. You control all data entry.

## How to Add Your Data

### Start the Dashboard
```bash
npm start
```
Then open: **http://localhost:3000**

You'll see an empty dashboard with one sample role.

### Add Roles Manually

Edit `data-loader.js` and add your roles to the `rolesData` array:

```javascript
rolesData: [
  {
    "id": "mdp-toronto",
    "role": "Managing Director Partner (MDP)",
    "office": "Canada",
    "manager": "Your Name",
    "priority": "High",
    "pipelineCount": 2,
    "currentStage": "1st Interview",
    "status": "Decision Needed",
    "blocker": "Partner approval",
    "nextAction": "Complete final round",
    "finalists": 1,
    "openOffers": 0,
    "decisionNeeded": "Yes"
  }
]
```

### Add Candidates Manually

Add candidates to the `candidatesByRole` section:

```javascript
candidatesByRole: {
  "mdp-toronto": [
    {
      "name": "Kanishka Banerji",
      "linkedin_url": "https://linkedin.com/in/kanishka-banerji",
      "stage": "1st Interview",
      "fitScore": 3,
      "keyStrength": "Strong consulting background",
      "mainConcern": "Partner fit needs validation",
      "nextStep": "Move to 2nd round",
      "tags": ["Consultant", "Commercial"],
      "decision": "Move forward",
      "variant": "balanced",
      "comment": "Solid candidate, ready for next round.",
      "testNext": "Deep case study",
      "reference": "HR Interview 2026-06-12"
    }
  ]
}
```

### Update Funnel Counts

Update the funnel numbers in `funnelSummaryData`:

```javascript
funnelSummaryData: {
  "stages": ["HR Interview", "1st Interview", "2nd Interview", "3rd Interview"],
  "global": {
    "HR Interview": 2,
    "1st Interview": 5,
    "2nd Interview": 1,
    "3rd Interview": 1
  },
  "offices": {
    "Canada": {
      "HR Interview": 1,
      "1st Interview": 1,
      "2nd Interview": 0,
      "3rd Interview": 0
    }
    // ... add other offices
  }
}
```

## Editing in Dashboard

Once you've added roles and candidates:

1. **Edit candidate details** directly in the dashboard
2. **Click any field** to edit
3. **Auto-saves** when you click away
4. **Status shows**: "✓ Synced to file"

## Workflow

1. **Add structure** (roles, candidates) to `data-loader.js`
2. **Restart dashboard** (stop server, run `npm start`)
3. **Refresh browser** (F5)
4. **See your data** load in the dashboard
5. **Edit in dashboard** - all changes auto-save

## Field Reference

**Roles require:**
- `id` — unique identifier (e.g., "mdp-toronto")
- `role` — role title
- `office` — Canada, US, UK, or Poland
- `manager` — hiring manager name
- `priority` — High, Medium, or Low
- `pipelineCount` — number of candidates
- `currentStage` — HR Interview, 1st Interview, 2nd Interview, 3rd Interview
- `status` — On Track, Need Attention, Decision Needed
- `blocker` — what's holding it up
- `nextAction` — what to do next
- `finalists` — number of final candidates
- `openOffers` — number of open offers
- `decisionNeeded` — Yes or No

**Candidates require:**
- `name` — candidate name
- `stage` — interview stage
- `fitScore` — 1-5 scale
- `keyStrength` — what they do well
- `mainConcern` — what needs attention
- `nextStep` — next action
- `tags` — array of tags
- `decision` — recommendation
- `variant` — scorecard type (strong, balanced, commercial, leadership)
- `comment` — overall assessment
- `testNext` — what to test next
- `reference` — source of info

## Tips

- **Save often** — Click "Save locally" button after each edit
- **Backup** — Keep a copy of your `data-loader.js`
- **JSON valid** — Use [jsonlint.com](https://jsonlint.com) to check
- **Restart** — Always restart server after editing `data-loader.js`
- **Check status** — Watch the status bar for "✓ Synced" confirmation

## Data from Excel/CSV

If you have data in Excel:
1. Export as CSV
2. Copy the data structure above
3. Paste into `data-loader.js`
4. Restart server
5. Verify in dashboard

## Need Help?

- See `SCHEMA_REFERENCE.md` for field definitions
- See `DATA_FIELD_MAPPING.md` for mapping from your ATS
- See `SETUP.md` for troubleshooting
