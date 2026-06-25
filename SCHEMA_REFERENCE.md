# Candidate Data Schema Reference

Your Talent Dashboard now uses an enhanced candidate data schema optimized for recruitment pipeline tracking. This document explains each field.

## Candidate Record Structure

```json
{
  "candidate_name": "String",
  "role": "String",
  "office_location": "String (Canada|Poland|UK|US)",
  "linkedin_url": "String (URL)",
  "stage": "String (HR Interview|1st Interview|2nd Interview|3rd Interview)",
  "status": "String (Active|Rejected|On Hold|Hired|Withdrawn)",
  "source": "String (Referral|Job board|Recruiter|Other)",
  "interview_score": "Number (1-5)",
  "risk_level": "String (Low|Medium|High|Unknown)",
  "next_step": "String",
  "last_updated": "String (YYYY-MM-DD)"
}
```

---

## Field Definitions

### `candidate_name` (Required)
- **Type:** String (plain text)
- **Example:** "Alex Rodriguez", "Sample Candidate A"
- **Purpose:** Unique identifier for candidate
- **Notes:** Use real names for real data; privacy is OK because this is internal recruitment pipeline
- **Source:** From your ATS/interview system

### `role` (Required)
- **Type:** String
- **Example:** "AI Consultant | Toronto", "Consultant | Warsaw", "Principal | Consulting UK"
- **Purpose:** Which position they're interviewing for
- **Notes:** Include location in role name to make filtering easier
- **Source:** From your ATS posting or opportunity field

### `office_location` (Required)
- **Type:** String — one of: `Canada`, `Poland`, `UK`, `US`
- **Example:** "Canada", "UK"
- **Purpose:** Enables filtering and funnel analysis by geography
- **Notes:** Standardized values only — this ensures funnel charts work correctly
- **Source:** Derived from `role` field or timezone

### `linkedin_url` (Optional but recommended)
- **Type:** URL string
- **Example:** "https://linkedin.com/in/alex-rodriguez-12345"
- **Purpose:** Quick link to candidate's public profile
- **Notes:** Link directly to their LinkedIn profile (not a recruiting portal)
- **Source:** Manually added from candidate's application or your recruiting system

### `stage` (Required)
- **Type:** String — one of 4 values ONLY:
  - `HR Interview` — Initial screening or HR round
  - `1st Interview` — First substantial interview round
  - `2nd Interview` — Second interview round
  - `3rd Interview` — Final round or senior partner interview
- **Example:** "1st Interview"
- **Purpose:** Tracks progression through interview funnel
- **Notes:** MUST be one of these 4 exact values for funnel counts to work correctly
- **Mapping from ATS:**
  - "Consultant HR Interview" → `HR Interview`
  - "Take Home Case PPT Interview" → `1st Interview`
  - "Consultant Case Interview" → `2nd Interview`
  - "Final Consultant Case Interview" → `3rd Interview`
- **Source:** From your ATS interview stage field

### `status` (Required)
- **Type:** String — one of 5 values:
  - `Active` — Still in process, progressing normally
  - `Rejected` — Did not move forward (interview feedback indicated not a fit)
  - `On Hold` — Paused but not rejected (waiting for decision, candidate feedback, etc.)
  - `Hired` — Offer accepted and candidate hired
  - `Withdrawn` — Candidate withdrew or became unresponsive
- **Example:** "Active", "Rejected"
- **Purpose:** Tracks outcome/disposition of each candidate
- **Notes:** Use standardized values ONLY for accurate reporting
- **Source:** Inferred from ATS archive reason or interview decision

### `source` (Recommended)
- **Type:** String — examples:
  - `Referral` — From employee referral
  - `Job board` — Applied directly (LinkedIn, Indeed, etc.)
  - `Recruiter` — Sourced by external recruiter
  - `Direct` — Approached directly by your team
  - `Other` — Other source
- **Example:** "Referral", "Recruiter"
- **Purpose:** Track which sourcing channels are effective
- **Notes:** Helps you understand which recruitment methods yield quality candidates
- **Source:** Not in your ATS export — add manually during import

### `interview_score` (Required)
- **Type:** Number (integer 1-5)
- **Example:** 4, 2, 1
- **Purpose:** Quantify interviewer assessment of candidate
- **Scale:**
  - **1** = Does not meet bar (reject)
  - **2** = Below expectations (needs development/hold)
  - **3** = Meets expectations (proceed)
  - **4** = Exceeds expectations (strong)
  - **5** = Exceptional (standout)
- **Notes:** Aggregate score across all interviewers for this round
- **Mapping from your data:**
  - Your ATS: 0 → Dashboard: 1
  - Your ATS: 1 → Dashboard: 2
  - Your ATS: 2 → Dashboard: 3
  - Your ATS: 3 → Dashboard: 4
- **Source:** From interviewer feedback score in your ATS

### `risk_level` (Required)
- **Type:** String — one of 4 values:
  - `Low` — No red flags, progressing well, ready to advance
  - `Medium` — Minor concerns, needs validation/development, but not blocking
  - `High` — Significant concerns, red flag raised, or failed key assessment
  - `Unknown` — Not yet fully assessed (e.g., first round, waiting on feedback)
- **Example:** "Low", "Medium", "High"
- **Purpose:** Quick visual indicator of hiring risk
- **Notes:** Use interview feedback and red flags to infer this
- **Inference rules:**
  - Interview score 4-5 + no red flags = `Low`
  - Interview score 3 + minor concerns = `Low`
  - Interview score 2 + concerns noted = `Medium`
  - Interview score 1-2 + red flag = `High`
  - No feedback yet = `Unknown`
- **Source:** Inferred from interview feedback, red flag assessment, archive reason

### `next_step` (Required)
- **Type:** String (plain text, 1-2 sentences)
- **Example:** 
  - "Move forward to 2nd interview"
  - "On hold, needs stronger communication skills"
  - "Rejected – not consulting-ready"
  - "Pending partner feedback"
- **Purpose:** Clear action for the recruiting team
- **Notes:** Should be immediately actionable
- **Source:** From interview decision in your ATS

### `last_updated` (Required)
- **Type:** String in `YYYY-MM-DD` format
- **Example:** "2026-06-24", "2026-06-15"
- **Purpose:** When was this candidate last interviewed/assessed
- **Notes:** Helps you identify stale candidates and follow up
- **Source:** Date of most recent interview in your ATS

---

## Common Field Combinations

### Actively Interviewing
```json
{
  "stage": "1st Interview",
  "status": "Active",
  "risk_level": "Low",
  "next_step": "Schedule 2nd interview",
  "last_updated": "2026-06-20"
}
```

### Rejected During Process
```json
{
  "stage": "2nd Interview",
  "status": "Rejected",
  "risk_level": "High",
  "next_step": "Not recommended for hire – communication gaps",
  "last_updated": "2026-06-15"
}
```

### On Hold Pending Feedback
```json
{
  "stage": "1st Interview",
  "status": "On Hold",
  "risk_level": "Medium",
  "next_step": "Waiting on team feedback before 2nd interview",
  "last_updated": "2026-06-12"
}
```

### Withdrawn
```json
{
  "stage": "HR Interview",
  "status": "Withdrawn",
  "risk_level": "Unknown",
  "next_step": "Candidate withdrew – no longer in process",
  "last_updated": "2026-06-10"
}
```

---

## Data Validation Rules

Before uploading real data, validate:

✅ **Must have:**
- `candidate_name` — not blank
- `role` — not blank
- `office_location` — ONLY: Canada, Poland, UK, or US
- `stage` — ONLY: HR Interview, 1st Interview, 2nd Interview, 3rd Interview
- `status` — ONLY: Active, Rejected, On Hold, Hired, Withdrawn
- `interview_score` — number between 1-5
- `risk_level` — ONLY: Low, Medium, High, Unknown
- `next_step` — not blank
- `last_updated` — valid date (YYYY-MM-DD)

❌ **Must NOT include:**
- Phone numbers
- Personal emails (only LinkedIn URL is OK)
- Salary or compensation
- Social security numbers or government IDs
- Personal addresses
- Medical/health information
- Family information

---

## Migration from Old Schema

**Old field** → **New field**
- `name` → `candidate_name`
- `stage` → `stage` (remap values to 4-stage model)
- `fitScore` → `interview_score`
- `keyStrength` → (include in comments or next_step if relevant)
- `mainConcern` → (use for risk_level assessment)
- `decision` → `status` + `next_step`

---

## Questions?

See:
- **DATA_FIELD_MAPPING.md** — How to map your ATS data to this schema
- **UPLOAD.md** — Step-by-step instructions for loading real data
- **FUNNEL_SUMMARY.md** — How funnel counts work with this data
