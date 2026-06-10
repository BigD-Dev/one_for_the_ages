"""
Seed ofta_prod.ofta_person with musicians from MusicBrainz + Wikipedia images.

Sources:
  - MusicBrainz API (https://musicbrainz.org/ws/2/) — name, DOB, nationality, gender
  - Wikipedia REST API — profile image

Usage:
    python seed_musicians_mb.py
    python seed_musicians_mb.py --dry-run
    python seed_musicians_mb.py --pages 20   # default 15 (~1500 candidates)

No API key required.
"""

import argparse
import json
import os
import sys
import time
import psycopg2
from datetime import date
from urllib.parse import quote

try:
    import requests
except ImportError:
    sys.exit("Missing: pip install requests")

DB = {
    "host":     os.getenv("OFTA_DB_HOST", "34.71.254.207"),
    "port":     int(os.getenv("OFTA_DB_PORT", 5432)),
    "dbname":   os.getenv("OFTA_DB_NAME", "tasc_db"),
    "user":     os.getenv("OFTA_DB_USERNAME", "postgres"),
    "password": os.getenv("OFTA_DB_PASSWORD", "tascoask"),
}

MB_HEADERS = {"User-Agent": "OftaApp/1.0 (dev@ofta.com)"}
WIKI_HEADERS = {"User-Agent": "OftaApp/1.0 (dev@ofta.com)"}
LIMIT = 100

# MusicBrainz occupation tags that indicate musicians
MUSICIAN_TAGS = [
    "singer",
    "rapper",
    "pop music",
    "rock music",
    "hip hop music",
    "rhythm and blues",
    "country music",
    "jazz",
    "soul music",
]

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


def mb_search(query: str, offset: int = 0) -> list[dict]:
    """Search MusicBrainz artists."""
    try:
        r = requests.get(
            "https://musicbrainz.org/ws/2/artist",
            params={"query": query, "limit": LIMIT, "offset": offset, "fmt": "json"},
            headers=MB_HEADERS,
            timeout=15,
        )
        r.raise_for_status()
        time.sleep(1.1)  # MusicBrainz rate limit: 1 req/sec
        return r.json().get("artists", [])
    except Exception as e:
        print(f"  MB search error: {e}")
        return []


def wiki_image(name: str) -> str | None:
    """Get Wikipedia profile image URL for a person."""
    slug = name.replace(" ", "_")
    try:
        r = requests.get(
            f"https://en.wikipedia.org/api/rest_v1/page/summary/{quote(slug)}",
            headers=WIKI_HEADERS,
            timeout=8,
        )
        if r.status_code == 200:
            data = r.json()
            # Prefer thumbnail (500px) for consistent size
            thumb = data.get("thumbnail", {}).get("source")
            original = data.get("originalimage", {}).get("source")
            return thumb or original
    except Exception:
        pass
    return None


def parse_dob(life_span: dict) -> date | None:
    begin = life_span.get("begin", "")
    if not begin:
        return None
    try:
        # MusicBrainz dates: YYYY, YYYY-MM, or YYYY-MM-DD
        parts = begin.split("-")
        if len(parts) == 3:
            return date(int(parts[0]), int(parts[1]), int(parts[2]))
        if len(parts) == 2:
            return date(int(parts[0]), int(parts[1]), 1)
        if len(parts) == 1 and len(parts[0]) == 4:
            return date(int(parts[0]), 7, 1)  # Use mid-year if only year known
    except (ValueError, TypeError):
        pass
    return None


def build_hints(artist: dict) -> tuple[list, list, list]:
    tags = [t["name"] for t in (artist.get("tags") or [])[:3]]
    country = artist.get("country") or ""
    area = (artist.get("begin-area") or {}).get("name") or ""

    easy, medium, hard = [], [], []
    if tags:
        easy.append(f"Known for: {', '.join(tags)}")
    if area:
        medium.append(f"From {area}")
    elif country:
        medium.append(f"From {country}")
    return easy, medium, hard


def fetch_candidates(pages: int) -> list[dict]:
    """Fetch musician candidates from MusicBrainz across multiple genre queries."""
    queries = [
        "type:person AND (tag:singer OR tag:pop music)",
        "type:person AND (tag:rapper OR tag:hip hop music)",
        "type:person AND (tag:rock OR tag:rock music)",
        "type:person AND (tag:r&b OR tag:soul OR tag:rhythm and blues)",
        "type:person AND (tag:country OR tag:country music)",
        "type:person AND (tag:jazz OR tag:blues)",
        "type:person AND (tag:reggae OR tag:dancehall OR tag:afrobeats)",
        "type:person AND (tag:electronic OR tag:dance music)",
    ]

    seen_ids = set()
    all_artists = []
    pages_per_query = max(1, pages // len(queries))

    for q in queries:
        for page in range(pages_per_query):
            batch = mb_search(q, offset=page * LIMIT)
            for a in batch:
                if a.get("id") not in seen_ids:
                    seen_ids.add(a["id"])
                    all_artists.append(a)
        print(f"  '{q[:40]}...' → {len(all_artists)} total so far")

    return all_artists


def ingest(dry_run: bool = False, pages: int = 15):
    conn = psycopg2.connect(**DB)
    cur = conn.cursor()

    cur.execute("SELECT LOWER(full_name) FROM ofta_prod.ofta_person")
    existing = {row[0] for row in cur.fetchall()}
    print(f"Existing persons in DB: {len(existing)}")

    print(f"\nFetching musicians from MusicBrainz ({pages} pages across genres)...")
    candidates = fetch_candidates(pages)
    print(f"Total unique candidates: {len(candidates)}")

    inserted_ids = []
    inserted = skipped = errors = 0

    for a in candidates:
        name = (a.get("name") or "").strip()
        if not name or name.lower() in existing:
            skipped += 1
            continue

        # Must be a person (not group/orchestra)
        if a.get("type") not in ("Person", None):
            skipped += 1
            continue

        dob = parse_dob(a.get("life-span") or {})
        if not dob:
            skipped += 1
            continue

        # Skip if dead (deceased) and born before 1920 — less recognisable
        if a.get("life-span", {}).get("ended") and dob.year < 1920:
            skipped += 1
            continue

        gender_raw = (a.get("gender") or "").capitalize()
        gender = gender_raw if gender_raw in ("Male", "Female") else "Other"
        category = "Musician" if gender == "Male" else "Musician"  # single category for both

        nationality = (a.get("country") or
                       (a.get("area") or {}).get("name") or
                       (a.get("begin-area") or {}).get("name") or None)

        # Fetch Wikipedia image (rate-limited naturally by MB sleep)
        image_url = wiki_image(name)

        sign = star_sign(dob)
        hints_easy, hints_medium, hints_hard = build_hints(a)
        # Popularity: use MB score (0–100) scaled to our 0–100 range
        popularity = float(a.get("score", 50))

        print(f"  {'[DRY] ' if dry_run else ''}INSERT {name} ({category}, {dob}, {sign}, img={'✓' if image_url else '✗'})")

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
                        %(popularity)s, %(image_url)s, 'Wikipedia/CC',
                        %(hints_easy)s::jsonb, %(hints_medium)s::jsonb, %(hints_hard)s::jsonb,
                        '{}', true
                    )
                    RETURNING id
                """, {
                    "full_name":    name,
                    "dob":          dob,
                    "star_sign":    sign,
                    "category":     category,
                    "nationality":  nationality,
                    "gender":       gender,
                    "popularity":   min(popularity, 999.99),
                    "image_url":    image_url,
                    "hints_easy":   json.dumps(hints_easy),
                    "hints_medium": json.dumps(hints_medium),
                    "hints_hard":   json.dumps(hints_hard),
                })
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

    print(f"\nMusicians: {inserted} inserted, {skipped} skipped, {errors} errors")
    with_img = sum(1 for _, img in inserted_ids if img)
    print(f"With Wikipedia image: {with_img}/{inserted}")

    if not dry_run and inserted_ids:
        print(f"\nGenerating question templates...")
        generate_templates(cur, conn, [pid for pid, _ in inserted_ids])

    cur.close()
    conn.close()


def generate_templates(cur, conn, person_ids: list):
    single_modes = ["AGE_GUESS", "REVERSE_SIGN", "REVERSE_DOB"]
    qt = 0

    for pid in person_ids:
        for mode in single_modes:
            cur.execute("""
                INSERT INTO ofta_prod.ofta_question_template (mode, person_id, difficulty)
                VALUES (%s, %s, 3)
                ON CONFLICT DO NOTHING
            """, (mode, pid))
            qt += 1

    conn.commit()

    # WHO_OLDER pairs with other musicians/actors of similar popularity
    cur.execute("""
        SELECT id, popularity_score FROM ofta_prod.ofta_person
        WHERE is_active = true AND image_url IS NOT NULL AND image_url != ''
          AND primary_category IN ('Musician', 'Actor', 'Actress')
        ORDER BY popularity_score DESC
    """)
    all_people = cur.fetchall()

    pairs = 0
    for pid in person_ids:
        cur.execute("SELECT popularity_score FROM ofta_prod.ofta_person WHERE id = %s", (pid,))
        row = cur.fetchone()
        if not row:
            continue
        pop = float(row[0])

        partners = [r[0] for r in all_people if r[0] != pid and abs(float(r[1]) - pop) < 30][:10]
        for partner_id in partners:
            a, b = sorted([str(pid), str(partner_id)])
            cur.execute("""
                INSERT INTO ofta_prod.ofta_question_template (mode, person_id_a, person_id_b, difficulty)
                SELECT 'WHO_OLDER', %s::uuid, %s::uuid, 3
                WHERE NOT EXISTS (
                    SELECT 1 FROM ofta_prod.ofta_question_template
                    WHERE mode = 'WHO_OLDER' AND person_id_a = %s::uuid AND person_id_b = %s::uuid
                )
            """, (a, b, a, b))
            pairs += 1

    conn.commit()
    print(f"  Templates: {qt} single-person, {pairs} WHO_OLDER pairs")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--pages", type=int, default=15,
                        help="Pages per genre query (default 15, ~100 results each)")
    args = parser.parse_args()
    ingest(dry_run=args.dry_run, pages=args.pages)
