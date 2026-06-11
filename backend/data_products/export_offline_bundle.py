"""
Export quiz-eligible persons and question templates to a JSON bundle
for offline play in the mobile app.

Output: mobile/public/offline-bundle.json

Usage:
    python export_offline_bundle.py
    python export_offline_bundle.py --output /path/to/offline-bundle.json
"""

import argparse
import json
import os
import sys
from datetime import date, datetime

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from ofta_core.utils.util_db import OftaDBConnector

DEFAULT_OUTPUT = os.path.join(
    os.path.dirname(__file__), "..", "..", "mobile", "public", "offline-bundle.json"
)


def main(output_path: str):
    db = OftaDBConnector()

    print("Fetching quizzable persons...")
    persons_df = db.select_df("""
        SELECT DISTINCT c.id, c.full_name, c.date_of_birth, c.star_sign,
               c.primary_category, c.image_url, c.hints_easy,
               PERCENT_RANK() OVER (
                   PARTITION BY c.primary_category ORDER BY c.popularity_score
               ) AS pop_pct
        FROM ofta_prod.ofta_question_template qt
        JOIN ofta_prod.ofta_person c
          ON qt.person_id = c.id OR qt.person_id_a = c.id OR qt.person_id_b = c.id
        WHERE qt.is_active = TRUE
          AND c.image_url IS NOT NULL AND c.image_url != ''
    """)
    print(f"  {len(persons_df)} persons")

    print("Fetching single-person question templates...")
    single_df = db.select_df("""
        SELECT qt.id, qt.mode, qt.person_id
        FROM ofta_prod.ofta_question_template qt
        JOIN ofta_prod.ofta_person c ON qt.person_id = c.id
        WHERE qt.is_active = TRUE
          AND c.image_url IS NOT NULL AND c.image_url != ''
          AND qt.mode IN ('AGE_GUESS', 'REVERSE_SIGN', 'REVERSE_DOB')
    """)
    print(f"  {len(single_df)} single-person templates")

    print("Fetching WHO_OLDER pair templates...")
    pairs_df = db.select_df("""
        SELECT qt.id, qt.mode, qt.person_id_a, qt.person_id_b
        FROM ofta_prod.ofta_question_template qt
        JOIN ofta_prod.ofta_person ca ON qt.person_id_a = ca.id
        JOIN ofta_prod.ofta_person cb ON qt.person_id_b = cb.id
        WHERE qt.mode = 'WHO_OLDER' AND qt.is_active = TRUE
          AND ca.image_url IS NOT NULL AND ca.image_url != ''
          AND cb.image_url IS NOT NULL AND cb.image_url != ''
    """)
    print(f"  {len(pairs_df)} WHO_OLDER pair templates")

    def serialize_date(v):
        if hasattr(v, 'isoformat'):
            return v.isoformat()
        return str(v) if v is not None else None

    persons = []
    for _, row in persons_df.iterrows():
        hints = row['hints_easy']
        if isinstance(hints, str):
            import ast
            try:
                hints = json.loads(hints)
            except Exception:
                hints = []
        persons.append({
            "id":               str(row['id']),
            "full_name":        row['full_name'],
            "date_of_birth":    serialize_date(row['date_of_birth']),
            "star_sign":        row['star_sign'],
            "primary_category": row['primary_category'],
            "image_url":        row['image_url'],
            "hints_easy":       hints or [],
            "pop_pct":          round(float(row['pop_pct']), 4),
        })

    single_templates = [
        {
            "id":        str(row['id']),
            "mode":      row['mode'],
            "person_id": str(row['person_id']),
        }
        for _, row in single_df.iterrows()
    ]

    pair_templates = [
        {
            "id":          str(row['id']),
            "mode":        "WHO_OLDER",
            "person_id_a": str(row['person_id_a']),
            "person_id_b": str(row['person_id_b']),
        }
        for _, row in pairs_df.iterrows()
    ]

    bundle = {
        "version":    date.today().isoformat(),
        "exported_at": datetime.utcnow().isoformat() + "Z",
        "persons":    persons,
        "single_templates": single_templates,
        "pair_templates":   pair_templates,
    }

    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(bundle, f, separators=(",", ":"))

    size_kb = os.path.getsize(output_path) / 1024
    print(f"\nWritten to: {output_path}")
    print(f"Size: {size_kb:.0f} KB")
    print(f"Persons: {len(persons)}  |  Single templates: {len(single_templates)}  |  Pairs: {len(pair_templates)}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default=DEFAULT_OUTPUT)
    args = parser.parse_args()
    main(args.output)
