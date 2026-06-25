import csv
import json
from collections import defaultdict
from datetime import datetime
import re

# Load all CSV files
summary_file = '/sessions/gifted-upbeat-planck/mnt/talent-dashboard/all interview summary 1.csv'
calibration_file = '/sessions/gifted-upbeat-planck/mnt/talent-dashboard/export_interview_calibration (2).csv'

summary_rows = []
with open(summary_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        summary_rows.append(row)

calibration_rows = []
with open(calibration_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        calibration_rows.append(row)

# Function to extract location from role/posting
def extract_location(posting_str):
    if not posting_str:
        return "Unknown"
    posting_str = posting_str.lower()
    if 'toronto' in posting_str or 'texas' in posting_str or 'dallas' in posting_str or 'houston' in posting_str:
        return "Canada" if 'toronto' in posting_str else "US"
    elif 'warsaw' in posting_str or 'poland' in posting_str:
        return "Poland"
    elif 'uk' in posting_str or 'london' in posting_str:
        return "UK"
    return "Unknown"

# Function to standardize stage
def standardize_stage(stage_str):
    if not stage_str:
        return "Unknown"
    stage_str = stage_str.lower()
    if 'hr interview' in stage_str:
        return "HR Interview"
    elif '1st interview' in stage_str or 'take home case' in stage_str or 'non take home case' in stage_str:
        return "1st Interview"
    elif '2nd interview' in stage_str or 'case interview' in stage_str:
        return "2nd Interview"
    elif 'final' in stage_str:
        return "2nd Interview"
    elif '3rd' in stage_str or 'round' in stage_str:
        return "3rd Interview"
    return stage_str

# Function to derive status from archive reason
def derive_status(archive_reason, cancelled):
    if cancelled == "Yes":
        return "Withdrawn"
    if not archive_reason or archive_reason.strip() == "":
        return "Active"
    archive_reason_lower = archive_reason.lower()
    if 'location' in archive_reason_lower or 'unresponsive' in archive_reason_lower or 'failed' in archive_reason_lower:
        return "Rejected"
    return "Active"

# Function to convert feedback score to 1-4
def convert_score(score_str):
    if not score_str or score_str.strip() == "":
        return "Unknown"
    try:
        score = int(score_str)
        if score == 0:
            return "1"
        elif score == 1:
            return "2"
        elif score == 2:
            return "3"
        elif score == 3:
            return "4"
        return "Unknown"
    except:
        return "Unknown"

# Function to infer risk level
def infer_risk_level(score_str, red_flags):
    try:
        score = convert_score(score_str)
        if score in ["1", "2"]:
            if red_flags:
                return "High"
            return "Medium"
        elif score in ["3", "4"]:
            if red_flags:
                return "Medium"
            return "Low"
        return "Unknown"
    except:
        return "Unknown"

# Build candidates dictionary (merge by name)
candidates = {}
candidate_interviews = defaultdict(list)

# Process summary data first
for row in summary_rows:
    name = row.get('Opportunity name', '').strip()
    posting = row.get('Posting', '').strip()
    stage = row.get('Current stage', '').strip()
    archive_reason = row.get('Archive reason', '').strip()
    cancelled = row.get('Interview cancelled?', '').strip()
    score = row.get('Feedback score', '').strip()
    created_date = row.get('Created Date', '').strip()
    
    if not name:
        continue
    
    # Extract role (remove location from posting)
    role = posting
    if ' | ' in posting:
        role = posting.split(' | ')[0].strip()
    
    location = extract_location(posting)
    std_stage = standardize_stage(stage)
    status = derive_status(archive_reason, cancelled)
    interview_score = convert_score(score)
    
    # Store interview record for this candidate
    interview_record = {
        'name': name,
        'role': role,
        'posting': posting,
        'location': location,
        'stage': std_stage,
        'status': status,
        'score': interview_score,
        'archive_reason': archive_reason,
        'created_date': created_date,
        'raw_score': score,
        'red_flags': None,  # Will fill from calibration
        'overall_comments': None
    }
    
    candidate_interviews[name].append(interview_record)

# Enrich with calibration feedback data
for cal_row in calibration_rows:
    cand_name = cal_row.get('Candidate Name', '').strip()
    red_flag = cal_row.get('Red Flag Assessment (select one)', '').strip()
    comments = cal_row.get('Overall Comments', '').strip()
    
    if cand_name and cand_name in candidate_interviews:
        # Add to most recent interview for this candidate
        if candidate_interviews[cand_name]:
            candidate_interviews[cand_name][-1]['red_flags'] = red_flag
            candidate_interviews[cand_name][-1]['overall_comments'] = comments

# Merge candidates - keep most advanced stage and most recent data
for name, interviews in candidate_interviews.items():
    # Sort by stage progression
    stage_order = {"HR Interview": 0, "1st Interview": 1, "2nd Interview": 2, "3rd Interview": 3}
    
    # Get the most advanced stage
    most_advanced = interviews[0]
    for interview in interviews[1:]:
        current_stage_order = stage_order.get(interview['stage'], -1)
        advanced_stage_order = stage_order.get(most_advanced['stage'], -1)
        
        # Prefer higher stage, then more recent date
        if current_stage_order > advanced_stage_order:
            most_advanced = interview
        elif current_stage_order == advanced_stage_order and interview['created_date'] > most_advanced['created_date']:
            most_advanced = interview
    
    # Get most recent by date
    most_recent = max(interviews, key=lambda x: x['created_date'])
    
    # Merge: use most advanced stage, but most recent date and other fields
    candidate = {
        'candidate_name': name,
        'role': most_advanced['role'],
        'office_location': most_advanced['location'],
        'stage': most_advanced['stage'],
        'status': most_recent['status'],
        'interview_score': most_recent['score'],
        'risk_level': infer_risk_level(most_recent['raw_score'], most_recent['red_flags']),
        'next_step': '',  # Will populate below
        'last_updated': most_recent['created_date'],
        'source': '',
        'linkedin_url': '',
        'red_flags': most_recent['red_flags'],
        'overall_comments': most_recent['overall_comments'],
        'num_interviews': len(interviews)
    }
    
    # Generate next_step from comments and recommendation
    if most_recent['overall_comments']:
        comments = most_recent['overall_comments']
        if 'proceed' in comments.lower() or 'next stage' in comments.lower():
            candidate['next_step'] = "Proceed to next stage"
        elif 'not recommended' in comments.lower():
            candidate['next_step'] = "Do not recommend for hire"
        elif 'test' in comments.lower():
            # Extract what to test
            if 'test' in comments.lower():
                candidate['next_step'] = "Further testing required - review comments"
        else:
            candidate['next_step'] = "Pending review"
    
    candidates[name] = candidate

print(f"Total unique candidates: {len(candidates)}")
print()

# Create output structures
candidates_list = list(candidates.values())

# Sort by office, then role, then name
candidates_list.sort(key=lambda x: (x['office_location'], x['role'], x['candidate_name']))

# Sample 10 candidates
sample_size = min(10, len(candidates_list))
sample_candidates = candidates_list[:sample_size]

print("=== SAMPLE CANDIDATES (First 10) ===\n")
print("candidate_name | role | office | stage | status | score | risk | last_updated")
print("-" * 120)
for cand in sample_candidates:
    print(f"{cand['candidate_name']:25} | {cand['role']:30} | {cand['office_location']:8} | {cand['stage']:15} | {cand['status']:10} | {cand['interview_score']:5} | {cand['risk_level']:6} | {cand['last_updated']}")

# Funnel counts
print("\n=== FUNNEL COUNTS ===\n")

# By role
roles_count = defaultdict(int)
for cand in candidates_list:
    roles_count[cand['role']] += 1

print("By Role:")
for role in sorted(roles_count.keys()):
    print(f"  {role}: {roles_count[role]}")

# By office
office_count = defaultdict(int)
for cand in candidates_list:
    office_count[cand['office_location']] += 1

print("\nBy Office Location:")
for office in sorted(office_count.keys()):
    print(f"  {office}: {office_count[office]}")

# By stage
stage_count = defaultdict(int)
for cand in candidates_list:
    stage_count[cand['stage']] += 1

print("\nBy Stage:")
stage_order = ["HR Interview", "1st Interview", "2nd Interview", "3rd Interview"]
for stage in stage_order:
    count = stage_count.get(stage, 0)
    print(f"  {stage}: {count}")

# By status
status_count = defaultdict(int)
for cand in candidates_list:
    status_count[cand['status']] += 1

print("\nBy Status:")
for status in sorted(status_count.keys()):
    print(f"  {status}: {status_count[status]}")

# By risk level
risk_count = defaultdict(int)
for cand in candidates_list:
    risk_count[cand['risk_level']] += 1

print("\nBy Risk Level:")
risk_order = ["Low", "Medium", "High", "Unknown"]
for risk in risk_order:
    count = risk_count.get(risk, 0)
    print(f"  {risk}: {count}")

# Data quality issues
print("\n=== DATA QUALITY ISSUES ===\n")

# Check for missing critical fields
missing_scores = [c for c in candidates_list if c['interview_score'] == 'Unknown']
missing_location = [c for c in candidates_list if c['office_location'] == 'Unknown']
missing_comments = [c for c in candidates_list if not c['overall_comments']]

print(f"Candidates missing interview scores: {len(missing_scores)}")
if missing_scores:
    for c in missing_scores[:3]:
        print(f"  - {c['candidate_name']} ({c['stage']})")

print(f"\nCandidates missing office location: {len(missing_location)}")
if missing_location:
    for c in missing_location[:3]:
        print(f"  - {c['candidate_name']} ({c['role']})")

print(f"\nCandidates missing overall comments: {len(missing_comments)}")

# Candidates with multiple interviews
multi_interview = [c for c in candidates_list if c['num_interviews'] > 1]
print(f"\nCandidates with multiple interviews: {len(multi_interview)}")
if multi_interview:
    for c in multi_interview[:5]:
        print(f"  - {c['candidate_name']}: {c['num_interviews']} interviews, advanced to {c['stage']}")

# Save detailed JSON
output_json = {
    'metadata': {
        'generated_date': datetime.now().isoformat(),
        'total_candidates': len(candidates_list),
        'total_interviews': len(summary_rows)
    },
    'candidates': candidates_list,
    'funnel': {
        'by_role': dict(roles_count),
        'by_office': dict(office_count),
        'by_stage': dict(stage_count),
        'by_status': dict(status_count),
        'by_risk': dict(risk_count)
    }
}

with open('/sessions/gifted-upbeat-planck/mnt/talent-dashboard/candidates_merged.json', 'w') as f:
    json.dump(output_json, f, indent=2)

print("\n\nJSON output saved to: candidates_merged.json")

