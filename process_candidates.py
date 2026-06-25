import csv
import json
from collections import defaultdict
from datetime import datetime

# Load all CSV files
summary_file = '/sessions/gifted-upbeat-planck/mnt/talent-dashboard/all interview summary 1.csv'
feedback_file = '/sessions/gifted-upbeat-planck/mnt/talent-dashboard/export_feedback (2).csv'
calibration_file = '/sessions/gifted-upbeat-planck/mnt/talent-dashboard/export_interview_calibration (2).csv'

# Parse files
summary_rows = []
with open(summary_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        summary_rows.append(row)

feedback_rows = []
with open(feedback_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        feedback_rows.append(row)

calibration_rows = []
with open(calibration_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        calibration_rows.append(row)

print(f"Summary rows: {len(summary_rows)}")
print(f"Feedback rows: {len(feedback_rows)}")
print(f"Calibration rows: {len(calibration_rows)}")

# Sample data
print("\n=== SUMMARY HEADERS ===")
if summary_rows:
    print(list(summary_rows[0].keys()))

print("\n=== FIRST SUMMARY ROW ===")
if summary_rows:
    for k, v in list(summary_rows[0].items())[:10]:
        print(f"{k}: {v}")

print("\n=== FIRST FEEDBACK ROW ===")
if feedback_rows:
    for k, v in list(feedback_rows[0].items())[:15]:
        print(f"{k}: {v}")

print("\n=== FIRST CALIBRATION ROW ===")
if calibration_rows:
    for k, v in list(calibration_rows[0].items())[:15]:
        print(f"{k}: {v}")
