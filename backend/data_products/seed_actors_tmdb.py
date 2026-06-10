"""
Seed ofta_prod.ofta_person with actors/actresses from TMDb API.

Usage:
    TMDB_API_KEY=your_key python seed_actors_tmdb.py
    TMDB_API_KEY=your_key python seed_actors_tmdb.py --dry-run
    TMDB_API_KEY=your_key python seed_actors_tmdb.py --pages 20

Requires a free TMDb API key: https://www.themoviedb.org/settings/api

After running, also generates question templates for each inserted person.
"""

import argparse
import os
import sys
import time
import psycopg2
from datetime import date, datetime
from itertools import combinations

try:
    import requests
except ImportError:
    sys.exit("Missing: pip install requests")

TMDB_API_KEY = os.getenv("TMDB_API_KEY", "")
TMDB_BASE = "https://api.themoviedb.org/3"
TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500"

DB = {
    "host":     os.getenv("OFTA_DB_HOST", "34.71.254.207"),
    "port":     int(os.getenv("OFTA_DB_PORT", 5432)),
    "dbname":   os.getenv("OFTA_DB_NAME", "tasc_db"),
    "user":     os.getenv("OFTA_DB_USERNAME", "postgres"),
    "password": os.getenv("OFTA_DB_PASSWORD", "tascoask"),
}

STAR_SIGN_RANGES = [
    ((3, 21), (4, 19),  "Aries"),
    ((4, 20), (5, 20),  "Taurus"),
    ((5, 21), (6, 20),  "Gemini"),
    ((6, 21), (7, 22),  "Cancer"),
    ((7, 23), (8, 22),  "Leo"),
    ((8, 23), (9, 22),  "Virgo"),
    ((9, 23), (10, 22), "Libra"),
    ((10, 23),(11, 21), "Scorpio"),
    ((11, 22),(12, 21), "Sagittarius"),
    ((12, 22),(12, 31), "Capricorn"),
    ((1, 1),  (1, 19),  "Capricorn"),
    ((1, 20), (2, 18),  "Aquarius"),
    ((2, 19), (3, 20),  "Pisces"),
]


def star_sign(dob: date) -> str:
    m, d = dob.month, dob.day
    for (sm, sd), (em, ed), sign in STAR_SIGN_RANGES:
        if (m == sm and d >= sd) or (m == em and d <= ed):
            return sign
        if sm < em and sm < m < em:
            return sign
    return "Capricorn"


def tmdb_get(path: str, params: dict = {}) -> dict:
    params["api_key"] = TMDB_API_KEY
    r = requests.get(f"{TMDB_BASE}{path}", params=params, timeout=10)
    r.raise_for_status()
    return r.json()


def fetch_popular_actors(pages: int = 10) -> list[dict]:
    """Fetch popular people from TMDb, filtered to actors/actresses."""
    results = []
    for page in range(1, pages + 1):
        data = tmdb_get("/person/popular", {"page": page, "language": "en-US"})
        for p in data.get("results", []):
            if p.get("known_for_department") == "Acting" and p.get("profile_path"):
                results.append(p)
        time.sleep(0.25)  # Respect rate limit
    print(f"  Fetched {len(results)} actors from {pages} pages")
    return results


def fetch_person_details(tmdb_id: int) -> dict | None:
    """Get full person details including birthday and place of birth."""
    try:
        data = tmdb_get(f"/person/{tmdb_id}", {"language": "en-US"})
        time.sleep(0.1)
        return data
    except Exception as e:
        print(f"    WARNING: Failed to fetch details for {tmdb_id}: {e}")
        return None


def nationality_from_place(place_of_birth: str | None) -> str | None:
    if not place_of_birth:
        return None
    # Extract country from "City, State, Country" format
    parts = [p.strip() for p in place_of_birth.split(",")]
    return parts[-1] if parts else None


def build_hints(person: dict) -> tuple[list, list, list]:
    """Build easy/medium/hard hint lists from TMDb data."""
    easy, medium, hard = [], [], []

    known_for = person.get("known_for", [])
    titles = [kf.get("title") or kf.get("name") for kf in known_for if kf.get("title") or kf.get("name")]

    place = person.get("place_of_birth") or ""
    bio = (person.get("biography") or "").strip()

    if titles:
        easy.append(f"Known for: {', '.join(titles[:2])}")
    if place:
        medium.append(f"Born in {place}")
    if bio:
        # First sentence of bio as a hard hint
        first_sentence = bio.split(".")[0].strip()
        if len(first_sentence) > 20:
            hard.append(first_sentence[:120])

    return easy, medium, hard


def ingest(dry_run: bool = False, pages: int = 10):
    if not TMDB_API_KEY:
        sys.exit("ERROR: Set TMDB_API_KEY environment variable.\n"
                 "Get a free key at https://www.themoviedb.org/settings/api")

    conn = psycopg2.connect(**DB)
    cur = conn.cursor()

    # Load existing names to avoid duplicates
    cur.execute("SELECT LOWER(full_name) FROM ofta_prod.ofta_person")
    existing = {row[0] for row in cur.fetchall()}
    print(f"Existing persons in DB: {len(existing)}")

    print(f"\nFetching popular actors from TMDb ({pages} pages)...")
    candidates = fetch_popular_actors(pages)

    inserted_ids = []
    inserted = skipped = errors = 0

    for c in candidates:
        name = c.get("name", "").strip()
        if not name or name.lower() in existing:
            skipped += 1
            continue

        # Fetch full details for DOB and nationality
        details = fetch_person_details(c["tmdb_id"] if "tmdb_id" in c else c["id"])
        if not details:
            errors += 1
            continue

        birthday_str = details.get("birthday")
        if not birthday_str:
            skipped += 1
            continue  # DOB required for the game

        try:
            dob = date.fromisoformat(birthday_str)
        except ValueError:
            skipped += 1
            continue

        # Gender: TMDb 1=female, 2=male, 0/3=other
        gender_map = {1: "Female", 2: "Male"}
        gender = gender_map.get(details.get("gender"), "Other")

        category = "Actress" if gender == "Female" else "Actor"

        nationality = nationality_from_place(details.get("place_of_birth"))
        image_url = f"{TMDB_IMAGE_BASE}{c['profile_path']}" if c.get("profile_path") else None
        popularity = min(round(float(c.get("popularity", 50)), 2), 999.99)
        sign = star_sign(dob)

        # Merge known_for from popular listing into details for hints
        details["known_for"] = c.get("known_for", [])
        hints_easy, hints_medium, hints_hard = build_hints(details)

        params = {
            "full_name":    name,
            "dob":          dob,
            "star_sign":    sign,
            "category":     category,
            "nationality":  nationality,
            "gender":       gender,
            "popularity":   popularity,
            "image_url":    image_url,
            "hints_easy":   __import__("json").dumps(hints_easy),
            "hints_medium": __import__("json").dumps(hints_medium),
            "hints_hard":   __import__("json").dumps(hints_hard),
        }

        print(f"  {'[DRY] ' if dry_run else ''}INSERT {name} ({category}, {dob}, {sign})")

        if not dry_run:
            try:
                cur.execute("""
                    INSERT INTO ofta_prod.ofta_person (
                        full_name, date_of_birth, star_sign,
                        primary_category, nationality, gender,
                        popularity_score, image_url, image_license,
                        hints_easy, hints_medium, hints_hard,
                        aliases, is_active
                    ) VALUES (
                        %(full_name)s, %(dob)s, %(star_sign)s,
                        %(category)s, %(nationality)s, %(gender)s,
                        %(popularity)s, %(image_url)s, 'TMDb',
                        %(hints_easy)s::jsonb, %(hints_medium)s::jsonb, %(hints_hard)s::jsonb,
                        '{}', true
                    )
                    RETURNING id
                """, params)
                person_id = cur.fetchone()[0]
                inserted_ids.append((person_id, image_url))
                existing.add(name.lower())
                inserted += 1
            except Exception as e:
                print(f"    ERROR inserting {name}: {e}")
                conn.rollback()
                errors += 1
                continue

    if not dry_run:
        conn.commit()

    print(f"\nPersons: {inserted} inserted, {skipped} skipped, {errors} errors")

    # Generate question templates for newly inserted persons
    if not dry_run and inserted_ids:
        print(f"\nGenerating question templates for {len(inserted_ids)} persons...")
        generate_templates(cur, conn, [pid for pid, _ in inserted_ids])
        print("Done.")

    cur.close()
    conn.close()


def generate_templates(cur, conn, person_ids: list):
    """
    For each new person: insert AGE_GUESS, REVERSE_SIGN, REVERSE_DOB templates.
    For WHO_OLDER: pair each new person with up to 5 others of similar popularity.
    """
    if not person_ids:
        return

    # Single-person modes
    single_modes = ["AGE_GUESS", "REVERSE_SIGN", "REVERSE_DOB"]
    qt_inserted = 0

    for pid in person_ids:
        for mode in single_modes:
            cur.execute("""
                INSERT INTO ofta_prod.ofta_question_template (mode, person_id, difficulty)
                VALUES (%s, %s, 3)
                ON CONFLICT DO NOTHING
            """, (mode, pid))
            qt_inserted += 1

    conn.commit()

    # WHO_OLDER: pair each new person with up to 10 existing persons
    cur.execute("""
        SELECT id, popularity_score FROM ofta_prod.ofta_person
        WHERE is_active = true AND image_url IS NOT NULL AND image_url != ''
          AND primary_category IN ('Actor', 'Actress')
        ORDER BY popularity_score DESC
    """)
    all_actors = cur.fetchall()

    pairs_inserted = 0
    for pid in person_ids:
        cur.execute("SELECT popularity_score FROM ofta_prod.ofta_person WHERE id = %s", (pid,))
        row = cur.fetchone()
        if not row:
            continue
        pop = float(row[0])

        # Find 10 actors within ±30 popularity points
        partners = [
            r[0] for r in all_actors
            if r[0] != pid and abs(float(r[1]) - pop) < 30
        ][:10]

        for partner_id in partners:
            a, b = sorted([str(pid), str(partner_id)])
            cur.execute("""
                INSERT INTO ofta_prod.ofta_question_template (mode, person_id_a, person_id_b, difficulty)
                SELECT 'WHO_OLDER', %s::uuid, %s::uuid, 3
                WHERE NOT EXISTS (
                    SELECT 1 FROM ofta_prod.ofta_question_template
                    WHERE mode = 'WHO_OLDER'
                      AND person_id_a = %s::uuid AND person_id_b = %s::uuid
                )
            """, (a, b, a, b))
            pairs_inserted += 1

    conn.commit()
    print(f"  Templates: {qt_inserted} single-person, {pairs_inserted} WHO_OLDER pairs")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--pages", type=int, default=10,
                        help="TMDb pages to fetch (20 results/page, default 10 = 200 actors)")
    args = parser.parse_args()
    ingest(dry_run=args.dry_run, pages=args.pages)
