# Data Field Mapping Guide

This document shows where each field in your Talent Dashboard comes from in your uploaded ATS/interview data files.

## Your Uploaded Files
- `export_feedback.csv` — Interview feedback, ratings, and assessor comments
- `export_forms.csv` — Candidate forms (visa, salary, experience, work auth)
- `export_interview_calibration.csv` — Calibration data and additional form fields

## Field Mapping

| Dashboard Field | Source File | Source Column | Notes |
|---|---|---|---|
| `candidate_name` | export_feedback.csv | `Opportunity name` (Contact Name) | Real name of candidate |
| `role` | export_feedback.csv | `Posting` or `Opportunity name` | Role title (e.g., "AI Consultant \| Toronto") |
| `office_location` | Derived from role | Extract location from role title | Parse from role: Toronto, Warsaw, UK, Texas, London, etc. |
| `linkedin_url` | Not in uploaded files | — | MANUALLY ADD from your recruiting notes |
| `stage` | export_feedback.csv | `Current stage` | Values: HR Interview, 1st Interview - Take Home Case, 1st Interview - Non Take Home Case, 2nd Interview - Case Interview, 3rd Round Interview |
| `status` | export_feedback.csv | `Archive reason` (if any) | If blank = Active; "Unresponsive", "Location", "Failed case interview" = Rejected |
| `source` | Not explicitly in files | — | Likely all are: Referral, Direct Apply, or Recruiter (MANUALLY ADD) |
| `interview_score` | export_feedback.csv | `Feedback score` or `Avg. panel score` | Score 0-3 from interviewer |
| `risk_level` | export_feedback.csv | `Red Flag Assessment` + feedback | Infer from red flags, archive reason, comments |
| `next_step` | export_feedback.csv | Implicit in `Do you recommend this applicant for next steps?` | Move forward, Hold, Need follow-up, Need leadership input |
| `last_updated` | export_feedback.csv | `Created Date` or `Panel start time` | Date candidate last interviewed |

## How Locations Are Identified

From `Posting`/`Opportunity name` column, extract location:
- **Toronto** → "Canada"
- **Warsaw** → "Poland"
- **UK, London** → "UK"
- **Texas, Dallas** → "US"
- **Singapore, Manila, Sydney, Melbourne** → "APAC" (if needed)

## Status Values (Standardized)

From `Archive reason` and feedback:
- `Active` — No archive reason, feedback score > 0 or still in process
- `Rejected` — Archive reason filled, or feedback says "not recommended"
- `On Hold` — Feedback says "Hold" or "Need follow-up"
- `Hired` — Archive reason = "Hired" (if any)
- `Withdrawn` — Archive reason = "Unresponsive" or candidate withdrew

## Risk Level (Inferred)

From `Red Flag Assessment` column:
- `Low` — No red flags, score 3, positive feedback
- `Medium` — Score 2, minor concerns mentioned, OR red flag marked but manageable
- `High` — Score 0-1, red flag marked, OR archive reason like "Failed case interview"
- `Unknown` — First round, not yet assessed

## Interview Score Mapping

- `Feedback score` in export_feedback.csv is 0-3
- Convert to 1-5 scale for dashboard:
  - 0 → 1 (did not pass)
  - 1-2 → 2-3 (needs improvement)
  - 3 → 4-5 (strong)

## Missing Fields

**These fields are NOT in your uploaded files — add manually:**
- `linkedin_url` — Copy from your recruiting system or notes
- `source` — How candidate found the role (Referral, Job board, Recruiter, etc.)

**These fields CAN be derived:**
- `office_location` — Parse from role title
- `status` — From archive reason or feedback
- `risk_level` — From red flags + feedback score
- `next_step` — From "recommend for next steps" field

## Data Quality Notes

1. **Salary data** is in export_forms.csv but excluded from dashboard per your data rules
2. **Work authorization** data is in export_forms.csv but excluded from dashboard
3. **Interview comments** are detailed and should be used for risk_level and next_step inference
4. Some candidates appear in multiple files (different interview rounds) — merge into one record per candidate
5. Cancel interview flag exists — use this for status (archived/withdrawn)

## Example: Merging a Multi-Round Candidate

**Candidate: Bartosz Szpak**
- File: export_feedback.csv
- Row 13: Consultant HR Interview, Created 11/6/2026, score 3
- Row 23: Take Home Case PPT Interview, Created 16/6/2026, score 2
- Row 77: Consultant HR Interview, Created 16/6/2026, score 3

**Merged record:**
```json
{
  "candidate_name": "Bartosz Szpak",
  "role": "Consultant | Warsaw",
  "office_location": "Warsaw",
  "stage": "1st Interview - Take Home Case",  // Last stage
  "status": "Active",
  "interview_score": 2,  // Score from most recent interview
  "risk_level": "High",  // "N/A (Not recommended for hire)" in feedback
  "next_step": "Reject",
  "last_updated": "2026-06-16",  // Date of most recent interview
}
```

---

## Next Steps

1. **Load real data**: Copy-paste your exported CSVs into the data folder as `candidates.csv`, `interview_feedback.csv`, etc.
2. **Add missing fields**: Manually add `linkedin_url` and `source` for each candidate
3. **Standardize**: Map all stage values to the 4 standard stages (HR Interview, 1st, 2nd, 3rd)
4. **Test**: Verify the dashboard loads and funnel counts match your ATS

See `UPLOAD.md` for instructions on populating the dashboard with your real data.
