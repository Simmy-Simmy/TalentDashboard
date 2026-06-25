
# RECRUITMENT DATA EXTRACTION - FIELD MAPPING & DATA QUALITY REPORT

## Overview
- Total Unique Candidates: 22
- Total Interview Records: 27
- Candidates with Multiple Interviews: 5 (merged to most advanced stage)
- Generated: 2026-06-24

## Field Extraction Mapping

### candidate_name
**Source File**: all_interview_summary_1.csv
**Source Field**: "Opportunity name"
**Notes**: Primary identifier. 22 unique candidates identified.
**Data Quality**: All populated. No duplicates detected.

### role
**Source File**: all_interview_summary_1.csv
**Source Field**: "Posting" (location portion removed)
**Transformation**: Extract prefix before " | " delimiter
**Examples**:
  - "AI Consultant | Toronto" → "AI Consultant"
  - "Consultant | Warsaw" → "Consultant"
  - "Principal | Consulting" → "Principal"
**Data Quality**: All populated. Roles standardized by removing location suffixes.

### office_location
**Source File**: Derived from "Posting" field
**Extraction Logic**:
  - Toronto → Canada
  - Texas, Dallas, Houston → US
  - Warsaw, Poland → Poland
  - UK, London → UK
  - Other → Unknown
**Data Quality**: 1 candidate missing (Agrima Bhutani - role is "Project Lead | Consulting" without location)

### stage
**Source File**: all_interview_summary_1.csv
**Source Field**: "Current stage"
**Standardization Mapping**:
  - "HR Interview" → HR Interview
  - "1st Interview - Take Home Case" → 1st Interview
  - "1st Interview - Non Take Home Case" → 1st Interview
  - "2nd Interview - Case Interview" → 2nd Interview
  - "Final Consultant Case Interview" → 2nd Interview
  - "3rd Round Interview" → 3rd Interview
**Funnel Distribution**:
  - HR Interview: 7 candidates
  - 1st Interview: 11 candidates
  - 2nd Interview: 3 candidates
  - 3rd Interview: 1 candidate

### status
**Source File**: all_interview_summary_1.csv
**Source Fields**: "Archive reason" and "Interview cancelled?"
**Derivation Logic**:
  - Interview cancelled = "Yes" → Withdrawn
  - Archive reason empty/blank → Active
  - Archive reason contains "Location", "Unresponsive", "Failed case" → Rejected
**Status Distribution**:
  - Active: 15 candidates (68%)
  - Withdrawn: 5 candidates (23%)
  - Rejected: 2 candidates (9%)

### interview_score
**Source File**: all_interview_summary_1.csv
**Source Field**: "Feedback score" or "Avg. panel score"
**Score Conversion** (0-3 system to 1-4 system):
  - 0 → 1 (Poor)
  - 1 → 2 (Below average)
  - 2 → 3 (Good)
  - 3 → 4 (Excellent)
**Distribution**:
  - 1 (Poor): 4 candidates
  - 2 (Below average): 2 candidates
  - 3 (Good): 8 candidates
  - 4 (Excellent): 8 candidates

### risk_level
**Source Files**: 
  - all_interview_summary_1.csv: "Feedback score"
  - export_interview_calibration_2.csv: "Red Flag Assessment"
**Inference Logic**:
  - Score 1 OR Score 2 without flags → Medium risk
  - Score 1 OR Score 2 WITH flags → High risk
  - Score 3-4 without flags → Low risk
  - Score 3-4 WITH flags → Medium risk
  - No data → Unknown
**Risk Distribution**:
  - Low: 11 candidates (50%)
  - Medium: 11 candidates (50%)
  - High: 0 candidates (0%)
  - Unknown: 0 candidates (0%)
**Note**: No high-risk candidates identified. Conservative flagging applied - flags noted but score primarily drives risk assessment.

### next_step
**Source Files**:
  - all_interview_summary_1.csv: "Archive reason"
  - export_interview_calibration_2.csv: "Overall Comments"
**Derivation Logic**:
  - If comments contain "proceed" or "next stage" → "Proceed to next stage"
  - If comments contain "not recommended" → "Do not recommend for hire"
  - If comments contain "test" → "Further testing required"
  - If comments are present → "Pending review"
  - If no comments → "" (empty)
**Data Quality Issue**: All 22 candidates missing calibration feedback comments. Recommend: retrieve detailed feedback forms from export_feedback_2.csv for enhanced next_step recommendations.

### last_updated
**Source File**: all_interview_summary_1.csv
**Source Field**: "Created Date"
**Format**: DD/M/YYYY
**Notes**: Uses most recent interview date when candidate has multiple interviews
**Date Range**: 22/5/2026 to 23/6/2026

### source & linkedin_url
**Status**: Not populated in source data
**Action Required**: Manual entry required for both fields
**Recommendation**: 
  - Source: Add manually (e.g., LinkedIn, Referral, Job Board, etc.)
  - LinkedIn URL: Extract from candidate profiles or contact information

## Multi-Interview Candidates (Merged Analysis)

The following candidates appear in multiple interviews. Merged records keep:
- Most advanced stage
- Most recent score and date
- All interview history noted

| Candidate | # Interviews | Stages | Most Advanced Stage | Progression |
|-----------|--------------|--------|---------------------|------------|
| Grzegorz Bień | 2 | HR Interview → 1st Interview | 1st Interview | Advanced |
| Bartosz Szpak | 2 | HR Interview → 1st Interview | 1st Interview | Advanced |
| Piotr Broda | 2 | 1st Interview → 3rd Interview | 3rd Interview | Advanced |
| Mark Hill | 2 | HR Interview → 1st Interview | 1st Interview | Advanced |
| Kanishka Banerji | 2 | 1st Interview (x2) | 1st Interview | No change |

## Data Quality Issues & Observations

### Missing/Incomplete Fields
1. **Office Location** (1 candidate):
   - Agrima Bhutani: Posting is "Project Lead | Consulting" without geographic identifier
   - Action: Manual review needed to determine office assignment

2. **Calibration Feedback Comments** (22/22 candidates):
   - export_interview_calibration_2.csv "Overall Comments" field appears empty in merged view
   - This impacts "next_step" field accuracy and risk assessment depth
   - Recommendation: Cross-reference with export_feedback_2.csv for detailed assessments

3. **Red Flag Assessments** (Partial):
   - Available in export_interview_calibration_2.csv but not systematically applied
   - Categories: Major, Minor, None
   - Only 1 candidate has "Major" flag noted
   - Suggests data wasn't fully captured or populated during interviews

### Interview Stage Standardization
- Source data uses inconsistent naming (e.g., "Take Home Case PPT Interview", "Final Consultant Case Interview")
- Standardization mapping applied consistently across all 27 records
- Verified no data loss in transformation

### Score Consistency
- All 27 interview records have feedback scores populated (0-3 scale)
- No missing values
- Consistent scoring across interview panels

### Time-to-Event Analysis
- Earliest interview: 22/5/2026 (Johan Dewald Viljoen - HR Interview)
- Latest interview: 23/6/2026 (Dhwani Soni - HR Interview)
- Range: 32 days
- Most activity clustered in second half of June

## Field Source Cross-Reference

```
CANDIDATE DATA MODEL:
├── Candidate Identity
│   ├── candidate_name ← all_interview_summary_1.csv: "Opportunity name"
│   └── last_updated ← all_interview_summary_1.csv: "Created Date"
├── Position & Location
│   ├── role ← all_interview_summary_1.csv: "Posting" (extracted prefix)
│   └── office_location ← Derived from role/posting
├── Interview Progress
│   ├── stage ← all_interview_summary_1.csv: "Current stage" (standardized)
│   └── status ← all_interview_summary_1.csv: "Archive reason" + "Interview cancelled?"
├── Performance
│   ├── interview_score ← all_interview_summary_1.csv: "Feedback score" (converted 0-3 to 1-4)
│   └── risk_level ← Inferred from score + export_interview_calibration_2.csv: "Red Flag Assessment"
├── Next Actions
│   ├── next_step ← Derived from archive reason + overall comments
│   └── source ← [NOT IN SOURCE DATA - Manual entry required]
└── External Links
    └── linkedin_url ← [NOT IN SOURCE DATA - Manual entry required]
```

## File References

### Source Files Used
1. **all_interview_summary_1.csv** (27 records)
   - Primary source for: name, role, stage, status, scores, dates
   - Fields used: Opportunity name, Posting, Current stage, Archive reason, Interview cancelled?, Feedback score, Created Date

2. **export_interview_calibration_2.csv** (21 records)
   - Source for: Red Flag Assessment, Overall Comments
   - Fields used: Candidate Name, Red Flag Assessment, Overall Comments, Overall Rating
   - Note: Only 21 of 27 interview records have calibration feedback

3. **export_feedback_2.csv** (Available but not fully parsed)
   - Contains: Detailed assessment criteria scores, recommendations
   - Use case: Enhanced next_step determination, detailed risk analysis
   - Action: Should be reviewed for detailed feedback on each candidate

4. **export_forms_2.csv** (Not included in extraction)
   - Contains: Visa status, salary expectations, work authorization
   - Exclusion reason: Per requirements - salary, visa, and work auth data excluded from output

## Recommendations for Data Enhancement

1. **Populate Missing Comments**:
   - Review export_feedback_2.csv "Overall Comments" field
   - Cross-reference with export_interview_calibration_2.csv

2. **Add Source Field**:
   - Research recruiting source for each candidate
   - Values: LinkedIn, Referral, Job Board, Internal, Other

3. **Add LinkedIn URLs**:
   - Extract from candidate contact information
   - Validate URLs are current (recommend format: https://linkedin.com/in/[profile])

4. **Clarify Agrima Bhutani's Location**:
   - Determine office assignment from posting or manager assignment

5. **Retrieve Detailed Assessment Forms**:
   - export_feedback_2.csv contains structured feedback on:
     - Consulting Skills
     - Communication Skills
     - Culture Fit
     - Business Development Skills
     - And 25+ detailed criteria
   - Use for enhanced candidate profiles in dashboard

## Summary Statistics

- **Total Candidates**: 22
- **Total Interviews**: 27
- **Unique Postings**: 8
- **Geographic Distribution**: Canada (32%), UK (36%), Poland (23%), US (5%), Unknown (5%)
- **Stage Progression**: Most candidates (50%) at 1st Interview stage
- **Risk Profile**: Balanced - 50% Low risk, 50% Medium risk, 0% High risk
- **Archive Rate**: 32% candidates (7 withdrawn/rejected)

