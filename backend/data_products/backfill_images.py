"""
Backfill image_url for persons where it is NULL or empty.

Sources tried in order:
  1. Wikipedia REST API  — works for all categories, no key needed
  2. TheSportsDB API     — footballer fallback, no key needed (free tier)

Usage:
    python backfill_images.py
    python backfill_images.py --dry-run
    python backfill_images.py --category Footballer
    python backfill_images.py --limit 100        # process at most N persons
"""

import argparse
import os
import sys
import time
from urllib.parse import quote

try:
    import requests
except ImportError:
    sys.exit("Missing: pip install requests")

try:
    import psycopg2
    import psycopg2.extras
except ImportError:
    sys.exit("Missing: pip install psycopg2-binary")

DB = {
    "host":     os.getenv("OFTA_DB_HOST", "34.71.254.207"),
    "port":     int(os.getenv("OFTA_DB_PORT", 5432)),
    "dbname":   os.getenv("OFTA_DB_NAME", "tasc_db"),
    "user":     os.getenv("OFTA_DB_USERNAME", "postgres"),
    "password": os.getenv("OFTA_DB_PASSWORD", "tascoask"),
}

HEADERS = {"User-Agent": "OftaApp/1.0 (dev@ofta.com)"}


# ─────────────────────────────────────────────
# Image sources
# ─────────────────────────────────────────────

def wiki_image(name: str) -> str | None:
    slug = name.replace(" ", "_")
    try:
        r = requests.get(
            f"https://en.wikipedia.org/api/rest_v1/page/summary/{quote(slug)}",
            headers=HEADERS,
            timeout=8,
        )
        if r.status_code == 200:
            data = r.json()
            thumb = data.get("thumbnail", {}).get("source")
            original = data.get("originalimage", {}).get("source")
            return thumb or original
    except Exception:
        pass
    return None


def sportsdb_image(name: str) -> str | None:
    """TheSportsDB free-tier player search. Returns cutout or thumb."""
    try:
        r = requests.get(
            f"https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p={quote(name)}",
            headers=HEADERS,
            timeout=8,
        )
        if r.status_code == 200:
            players = r.json().get("player") or []
            if players:
                p = players[0]
                return p.get("strCutout") or p.get("strThumb") or p.get("strRender")
    except Exception:
        pass
    return None


def get_image(name: str, category: str) -> tuple[str | None, str | None]:
    """Returns (url, source_label)."""
    url = wiki_image(name)
    if url:
        return url, "Wikipedia/CC"

    if category == "Footballer":
        url = sportsdb_image(name)
        if url:
            return url, "TheSportsDB"

    return None, None


# ─────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--category", help="Only process this category")
    parser.add_argument("--limit", type=int, default=0, help="Stop after N persons (0 = all)")
    args = parser.parse_args()

    conn = psycopg2.connect(**DB)
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor)

    where_cat = "AND primary_category = %s" if args.category else ""
    params = [args.category] if args.category else []

    cur.execute(
        f"""
        SELECT id, full_name, primary_category
        FROM ofta_prod.ofta_person
        WHERE (image_url IS NULL OR image_url = '')
          AND is_active = TRUE
          {where_cat}
        ORDER BY primary_category, full_name
        """,
        params,
    )
    rows = cur.fetchall()

    if args.limit:
        rows = rows[: args.limit]

    total = len(rows)
    found = 0
    not_found = 0

    print(f"Persons to process: {total}{' (dry run)' if args.dry_run else ''}")
    print()

    for i, row in enumerate(rows, 1):
        pid, name, category = row["id"], row["full_name"], row["primary_category"]
        url, source = get_image(name, category)

        status = "✓" if url else "✗"
        print(f"[{i}/{total}] {status} {name} ({category}){f'  → {source}' if url else ''}")

        if url and not args.dry_run:
            cur.execute(
                """
                UPDATE ofta_prod.ofta_person
                SET image_url = %s,
                    image_license = %s,
                    updated_at_tms = NOW()
                WHERE id = %s
                """,
                (url, source, pid),
            )
            conn.commit()

        if url:
            found += 1
        else:
            not_found += 1

        # Polite rate limit — Wikipedia is fine at 2 req/s
        time.sleep(0.5)

    print()
    print(f"Done. Found: {found}/{total}  |  Not found: {not_found}/{total}")

    cur.close()
    conn.close()


if __name__ == "__main__":
    main()
