# One for the Ages — Comprehensive Design & Architecture Specification

> **Version:** 1.0 (MVP)
> **Date:** 2026-02-11
> **Author:** Engineering Team
> **Status:** Draft — Ready for Review

---

## Table of Contents

1. [Product Definition](#1-product-definition)
2. [Technology Stack (Aligned to TASC Ecosystem)](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Gameplay Design Spec](#4-gameplay-design-spec)
5. [Scoring System](#5-scoring-system)
6. [Difficulty Calibration](#6-difficulty-calibration)
7. [Content & Data Strategy](#7-content--data-strategy)
8. [Data Model (PostgreSQL)](#8-data-model-postgresql)
9. [API Spec (FastAPI)](#9-api-spec-fastapi)
10. [Mobile App Architecture (Nuxt 2 + Capacitor)](#10-mobile-app-architecture)
11. [Landing Page / Marketing Site](#11-landing-page--marketing-site)
12. [Admin Panel (Next.js)](#12-admin-panel-nextjs)
13. [Question & Pack Generation](#13-question--pack-generation)
14. [Anti-Cheat & Integrity](#14-anti-cheat--integrity)
15. [Observability & Operations](#15-observability--operations)
16. [Deployment on GCP](#16-deployment-on-gcp)
17. [CI/CD Pipeline](#17-cicd-pipeline)
18. [Monetisation Architecture](#18-monetisation-architecture)
19. [MVP Scope & Checklist](#19-mvp-scope--checklist)
20. [Build Plan (Phased)](#20-build-plan-phased)
21. [Repository Structure](#21-repository-structure)
22. [Key Technical Decisions](#22-key-technical-decisions)

---

## 1. Product Definition

### 1.1 Concept

**One for the Ages** is a **celebrity age trivia game** mobile app with:

- Broad celebrity coverage across categories (Film, Music, Sports, etc.)
- Addictive short-session gameplay loops (streaks, daily challenge, leaderboards)
- A "Reverse / Hard" mode where players guess **DOB** or **star sign** from hints
- A beautiful **landing page** for marketing, download links, and social proof

### 1.2 Core Value Proposition

| Pillar | Description |
|--------|-------------|
| **Simple input → high dopamine** | Quick guessing + streaks = addictive loops |
| **Infinite content runway** | Huge celebrity universe, always fresh |
| **Skill curve** | Difficulty ramps; mastery feels real |
| **Social competitiveness** | Leaderboards, challenges, shareable results |

### 1.3 Target Platforms

- **Primary:** iOS + Android (via Capacitor hybrid app)
- **Secondary:** Web (landing page + potential PWA)

---

## 2. Technology Stack

> **Principle:** Mirror the TASC ecosystem exactly — proven patterns, shared knowledge, common deployment pipeline.

### 2.1 Stack Overview

| Layer | Technology | Justification (TASC Precedent) |
|-------|-----------|-------------------------------|
| **Mobile App** | **Nuxt 2 + Vue 2 + Capacitor 7** | Exact same stack as `tasc_mobile_app` — SSG via `nuxt generate`, native wrapper via Capacitor |
| **Styling** | **TailwindCSS 3** | Same as `tasc_mobile_app` and `tasc_studio` |
| **State Management** | **Vuex** (persisted) | Same as `tasc_mobile_app` (`store/` modules) |
| **Auth** | **Firebase Auth** | Same Firebase project pattern as TASC (`tasc-project-oask`), but separate Firebase project for OFTA |
| **Backend API** | **FastAPI + Uvicorn** | Exact same as `tasc_core` — Python 3.10, Pydantic v2, structured routers |
| **Database** | **PostgreSQL 14** (Cloud SQL) | Same as TASC — using `TascDBConnector` pattern (SQLAlchemy + psycopg2) |
| **ORM / DB Utility** | **SQLAlchemy 2.0 + raw SQL** | Same connector pattern: `select_df()`, `execute_query()`, `insert_df()`, `bulk_upsert_df()` |
| **Cloud** | **GCP** (Cloud Run, Cloud SQL, Cloud Storage, Cloud Scheduler) | Identical to TASC production |
| **CI/CD** | **GitHub Actions** (tag-based deploy) | Same `deploy.yml` pattern as `tasc_core` |
| **Admin Panel** | **Next.js 14 + React 18 + TailwindCSS** | Same as `tasc_studio` — internal tool for managing celebrities, packs, moderation |
| **Landing Page** | **Nuxt 2 (SSG)** or **standalone HTML/CSS/JS** | Hosted on Vercel or GCS static bucket |
| **Container** | **Docker** (python:3.10-slim) | Same Dockerfile pattern as `tasc_core` |
| **Monitoring** | **GCP Logging + structured JSON logs** | Same as TASC |

### 2.2 New GCP Project

Create a **separate GCP project** for One for the Ages:

```
Project ID:  ofta-project
Region:      us-central1 (same as TASC)
```

Separate project ensures:
- Independent billing
- Clean IAM boundaries
- No accidental cross-contamination with TASC data

### 2.3 New Firebase Project

```
Project:     ofta-firebase
Auth:        Email/Password + Anonymous + Google Sign-In
```

---

## 3. System Architecture

### 3.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                               │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  Mobile App   │  │ Landing Page │  │   Admin Panel     │  │
│  │  (Nuxt 2 +   │  │ (Static/SSG) │  │   (Next.js 14)    │  │
│  │  Capacitor 7) │  │              │  │                   │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬──────────┘  │
│         │                  │                    │             │
└─────────┼──────────────────┼────────────────────┼────────────┘
          │                  │                    │
          ▼                  ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    GCP CLOUD RUN                             │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              ofta-core (FastAPI)                        │  │
│  │                                                        │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │  │
│  │  │ Auth &   │ │ Game     │ │ Question │ │ Leader-  │  │  │
│  │  │ User     │ │ Session  │ │ & Pack   │ │ board    │  │  │
│  │  │ Service  │ │ Service  │ │ Service  │ │ Service  │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐               │  │
│  │  │ Scoring  │ │ Content  │ │ Telemetry│               │  │
│  │  │ Service  │ │ Service  │ │ Service  │               │  │
│  │  └──────────┘ └──────────┘ └──────────┘               │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────┐                                  │
│  │  Pack Generator Job    │  ← Cloud Scheduler (daily)       │
│  │  (Cloud Run Job)       │                                  │
│  └────────────────────────┘                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
   ┌────────────┐ ┌─────────┐ ┌─────────┐
   │ Cloud SQL  │ │  GCS    │ │ Firebase│
   │ (Postgres) │ │ (Packs/ │ │ (Auth)  │
   │            │ │ Assets) │ │         │
   └────────────┘ └─────────┘ └─────────┘
```

### 3.2 Request Flow (Typical Game Session)

```
1. User opens app → GET /v1/config (feature flags, daily pack hash)
2. If pack hash differs from local → GET /v1/packs/daily/{date}
3. User starts game → POST /v1/sessions/start → returns session_id
4. User answers questions → POST /v1/sessions/{id}/submit (batched)
5. Server scores → updates user_stats, daily_leaderboard, achievements
6. Client displays results + share card
```

### 3.3 Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| **ofta-core** | Single FastAPI service (all game logic, auth, scoring, leaderboards) |
| **ofta-mobile** | Nuxt 2 + Capacitor hybrid app (iOS + Android) |
| **ofta-admin** | Next.js 14 admin panel (celeb management, pack creation, moderation) |
| **ofta-landing** | Static marketing site (download links, social proof, newsletter) |
| **ofta-pack-job** | Cloud Run Job for daily pack generation (triggered by Cloud Scheduler) |

---

## 4. Gameplay Design Spec

### 4.1 Game Modes (MVP)

#### Mode 1: Age Guess (Numeric)
- **Prompt:** "How old is [Celebrity Name]?"
- **Input:** Number input or slider
- **Scoring:** Based on absolute error + time

#### Mode 2: Who's Older? (Binary Compare)
- **Prompt:** Two celebrities shown → select who is older
- **Input:** Tap left or right
- **Scoring:** Correct/incorrect + speed bonus

#### Mode 3: Daily Challenge
- Fixed set of 10–15 questions per day
- Everyone gets the same questions
- Daily leaderboard

#### Mode 4: Reverse Mode (Hard)
- **Variant A:** Guess Star Sign (12 options)
- **Variant B:** Guess DOB (year-only for MVP)
- **Hint ladder** with decaying score

### 4.2 Post-MVP Modes

| Mode | Description |
|------|-------------|
| **Category Packs** | Music 90s, Premier League Icons, Marvel Cast, etc. |
| **Timed Blitz** | 60 seconds, as many correct as possible |
| **Party Mode** | Local multiplayer pass-and-play |
| **Friend Battles** | Async challenge via share links |

### 4.3 Categories

```
- Film & TV
- Music
- Sports (Football, Basketball, etc.)
- Influencers / Creators
- Politics & Public Figures (optional, careful with sensitivity)
- Models / Fashion
- "Legends" (iconic historical celebrities)
```

---

## 5. Scoring System

### 5.1 Age Guess Scoring

```python
def score_age_guess(guess: int, true_age: int, time_seconds: float, difficulty: int) -> int:
    """
    Parameters:
        guess:        User's guess
        true_age:     Celebrity's actual current age
        time_seconds: Response time (capped at 30s)
        difficulty:   1-5 scale
    """
    E_MAX = 20  # max error before zero score
    
    error = abs(guess - true_age)
    
    p_base = 100 * difficulty
    p_err  = max(0, 1 - error / E_MAX)
    p_time = max(0.6, 1 - time_seconds / 30)
    
    return round(p_base * p_err * p_time)
```

### 5.2 Who's Older Scoring

```python
def score_whos_older(correct: bool, time_seconds: float, difficulty: int) -> int:
    if not correct:
        return 0
    base = 50 * difficulty
    time_bonus = max(0.5, 1 - time_seconds / 10)
    return round(base * time_bonus)
```

### 5.3 Reverse Mode Scoring (Hint Ladder)

```python
def score_reverse(correct: bool, hints_used: int, time_seconds: float, difficulty: int) -> int:
    if not correct:
        return 0
    base = 150 * difficulty
    decay = 0.85 ** hints_used
    time_factor = max(0.5, 1 - time_seconds / 45)
    return round(base * decay * time_factor)
```

### 5.4 Streak Multiplier

```python
def streak_multiplier(current_streak: int) -> float:
    """Applied on top of individual question scores."""
    if current_streak < 3:
        return 1.0
    elif current_streak < 5:
        return 1.1
    elif current_streak < 10:
        return 1.25
    elif current_streak < 20:
        return 1.5
    else:
        return 2.0
```

---

## 6. Difficulty Calibration

### 6.1 MVP: Heuristic Difficulty (1–5 scale)

Each question template gets a static difficulty based on:

| Factor | Low Difficulty (1-2) | High Difficulty (4-5) |
|--------|---------------------|----------------------|
| Celebrity popularity | Very famous (Beyoncé, Messi) | Niche (indie musicians, retired athletes) |
| Age range | Distinctive age (very young/old) | Mid-range (30-50, ambiguous) |
| Who's Older gap | 10+ year difference | 0-3 year difference |
| Reverse mode | Common star sign clues | Obscure DOB |

```python
def compute_difficulty(celebrity, mode: str) -> int:
    """Compute difficulty 1-5 for a question template."""
    score = 0
    
    # Popularity factor (inverse — less popular = harder)
    if celebrity.popularity_score < 30:
        score += 2
    elif celebrity.popularity_score < 60:
        score += 1
    
    # Age ambiguity factor
    age = celebrity.current_age
    if 30 <= age <= 50:
        score += 1  # Hardest age range to guess
    
    # Category factor
    if celebrity.primary_category in ['politics', 'legends']:
        score += 1  # Less mainstream
    
    return min(5, max(1, score + 1))
```

### 6.2 Post-MVP: Elo / IRT Difficulty

- Each question template gets a **difficulty rating** updated from outcomes
- Each user gets a **skill rating**
- Match user skill to question difficulty for flow-state retention

---

## 7. Content & Data Strategy

### 7.1 Data Sources (Legally Safe)

| Source | Use | License |
|--------|-----|---------|
| **Wikidata** (public structured data) | DOB, nationality, categories | CC0 |
| **Wikipedia** (public text) | Hints, descriptions | CC BY-SA |
| **Manual curation** | Quality control, hint writing | Internal |
| **AI-generated hints** (offline) | Hint ladder content | Internal |

### 7.2 MVP: Text-First

- No celebrity images in v1 (avoids licensing risk entirely)
- Names + text hints only
- Add images later with proper licensing approach

### 7.3 Celebrity Metadata Schema

```
- full_name         (text, required)
- date_of_birth     (date, required)
- star_sign         (text, computed)
- primary_category  (text, required)
- secondary_category (text, nullable)
- nationality       (text, nullable)
- gender            (text, nullable)
- popularity_score  (float, 0-100, computed)
- aliases           (text[], for search)
- image_url         (text, nullable — post-MVP)
- image_license     (text, nullable)
- hints_easy        (text[])
- hints_medium      (text[])
- hints_hard        (text[])
- is_active         (bool)
```

### 7.4 Star Sign Computation

```python
STAR_SIGNS = [
    ("Capricorn",   (12, 22), (1, 19)),
    ("Aquarius",    (1, 20),  (2, 18)),
    ("Pisces",      (2, 19),  (3, 20)),
    ("Aries",       (3, 21),  (4, 19)),
    ("Taurus",      (4, 20),  (5, 20)),
    ("Gemini",      (5, 21),  (6, 20)),
    ("Cancer",      (6, 21),  (7, 22)),
    ("Leo",         (7, 23),  (8, 22)),
    ("Virgo",       (8, 23),  (9, 22)),
    ("Libra",       (9, 23),  (10, 22)),
    ("Scorpio",     (10, 23), (11, 21)),
    ("Sagittarius", (11, 22), (12, 21)),
]

def get_star_sign(dob: date) -> str:
    month, day = dob.month, dob.day
    for sign, (start_m, start_d), (end_m, end_d) in STAR_SIGNS:
        if (month == start_m and day >= start_d) or (month == end_m and day <= end_d):
            return sign
    return "Capricorn"  # fallback for Dec 22-31
```

Store as a **computed column** for query speed.

### 7.5 Initial Celebrity Seed

Target: **500 celebrities** for MVP, across categories:

| Category | Target Count |
|----------|-------------|
| Film & TV | 120 |
| Music | 100 |
| Sports | 100 |
| Influencers/Creators | 80 |
| Legends | 50 |
| Models/Fashion | 30 |
| Politics | 20 |

---

## 8. Data Model (PostgreSQL)

### 8.1 Schema: `ofta_prod`

All tables live under the `ofta_prod` schema (mirroring `tasc_prod` pattern).

### 8.2 Core Tables (MVP)

```sql
-- ================================================
-- SCHEMA
-- ================================================
CREATE SCHEMA IF NOT EXISTS ofta_prod;

-- ================================================
-- USER ACCOUNT
-- ================================================
CREATE TABLE ofta_prod.user_account (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid    TEXT UNIQUE,
    display_name    TEXT,
    email           TEXT,
    country         TEXT,
    device_os       TEXT,
    auth_provider   TEXT DEFAULT 'anonymous',
    is_banned       BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    last_active_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_firebase_uid ON ofta_prod.user_account(firebase_uid);

-- ================================================
-- CELEBRITY
-- ================================================
CREATE TABLE ofta_prod.celebrity (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name           TEXT NOT NULL,
    date_of_birth       DATE NOT NULL,
    star_sign           TEXT NOT NULL,
    primary_category    TEXT NOT NULL,
    secondary_category  TEXT,
    nationality         TEXT,
    gender              TEXT,
    popularity_score    FLOAT DEFAULT 50.0,
    image_url           TEXT,
    image_license       TEXT,
    hints_easy          JSONB DEFAULT '[]'::jsonb,
    hints_medium        JSONB DEFAULT '[]'::jsonb,
    hints_hard          JSONB DEFAULT '[]'::jsonb,
    aliases             TEXT[] DEFAULT '{}',
    is_active           BOOLEAN DEFAULT TRUE,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_celebrity_category ON ofta_prod.celebrity(primary_category);
CREATE INDEX idx_celebrity_active ON ofta_prod.celebrity(is_active);
CREATE INDEX idx_celebrity_popularity ON ofta_prod.celebrity(popularity_score DESC);

-- ================================================
-- QUESTION TEMPLATE
-- ================================================
CREATE TABLE ofta_prod.question_template (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mode            TEXT NOT NULL CHECK (mode IN (
                        'AGE_GUESS', 'WHO_OLDER', 'REVERSE_DOB', 'REVERSE_SIGN'
                    )),
    celebrity_id    UUID REFERENCES ofta_prod.celebrity(id),
    celebrity_id_a  UUID REFERENCES ofta_prod.celebrity(id),
    celebrity_id_b  UUID REFERENCES ofta_prod.celebrity(id),
    difficulty      INT NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    
    -- AGE_GUESS/REVERSE: celebrity_id required
    -- WHO_OLDER: celebrity_id_a + celebrity_id_b required
    CONSTRAINT chk_mode_celebs CHECK (
        (mode IN ('AGE_GUESS', 'REVERSE_DOB', 'REVERSE_SIGN') AND celebrity_id IS NOT NULL)
        OR
        (mode = 'WHO_OLDER' AND celebrity_id_a IS NOT NULL AND celebrity_id_b IS NOT NULL)
    )
);

CREATE INDEX idx_qt_mode ON ofta_prod.question_template(mode);
CREATE INDEX idx_qt_difficulty ON ofta_prod.question_template(difficulty);
CREATE INDEX idx_qt_active ON ofta_prod.question_template(is_active);

-- ================================================
-- DAILY PACK
-- ================================================
CREATE TABLE ofta_prod.daily_pack (
    pack_date       DATE PRIMARY KEY,
    pack_json_url   TEXT NOT NULL,
    pack_hash       TEXT NOT NULL,
    question_count  INT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- GAME SESSION
-- ================================================
CREATE TABLE ofta_prod.game_session (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES ofta_prod.user_account(id),
    mode            TEXT NOT NULL,
    pack_date       DATE,
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    ended_at        TIMESTAMPTZ,
    total_score     INT DEFAULT 0,
    questions_count INT DEFAULT 0,
    correct_count   INT DEFAULT 0,
    best_streak     INT DEFAULT 0,
    device_os       TEXT,
    client_version  TEXT
);

CREATE INDEX idx_session_user ON ofta_prod.game_session(user_id);
CREATE INDEX idx_session_date ON ofta_prod.game_session(started_at DESC);
CREATE INDEX idx_session_pack ON ofta_prod.game_session(pack_date);

-- ================================================
-- QUESTION ATTEMPT
-- ================================================
CREATE TABLE ofta_prod.question_attempt (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id              UUID NOT NULL REFERENCES ofta_prod.game_session(id),
    question_template_id    UUID NOT NULL REFERENCES ofta_prod.question_template(id),
    question_index          INT NOT NULL,
    shown_at                TIMESTAMPTZ,
    answered_at             TIMESTAMPTZ,
    response_time_ms        INT,
    user_answer             JSONB NOT NULL,
    is_correct              BOOLEAN NOT NULL,
    error_value             FLOAT,
    hints_used              INT DEFAULT 0,
    score_awarded           INT NOT NULL DEFAULT 0,
    streak_at_time          INT DEFAULT 0
);

CREATE INDEX idx_attempt_session ON ofta_prod.question_attempt(session_id);

-- ================================================
-- DAILY LEADERBOARD
-- ================================================
CREATE TABLE ofta_prod.leaderboard_daily (
    pack_date       DATE NOT NULL,
    user_id         UUID NOT NULL REFERENCES ofta_prod.user_account(id),
    score           INT NOT NULL,
    rank            INT,
    submitted_at    TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (pack_date, user_id)
);

CREATE INDEX idx_lb_daily_score ON ofta_prod.leaderboard_daily(pack_date, score DESC);

-- ================================================
-- USER STATS (Aggregated)
-- ================================================
CREATE TABLE ofta_prod.user_stats (
    user_id             UUID PRIMARY KEY REFERENCES ofta_prod.user_account(id),
    lifetime_score      BIGINT DEFAULT 0,
    best_streak         INT DEFAULT 0,
    current_streak      INT DEFAULT 0,
    games_played        INT DEFAULT 0,
    total_correct       INT DEFAULT 0,
    total_questions     INT DEFAULT 0,
    accuracy_pct        FLOAT DEFAULT 0.0,
    favourite_category  TEXT,
    daily_challenges    INT DEFAULT 0,
    last_daily_date     DATE,
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- ACHIEVEMENTS
-- ================================================
CREATE TABLE ofta_prod.achievement (
    id              TEXT PRIMARY KEY,
    title           TEXT NOT NULL,
    description     TEXT NOT NULL,
    icon            TEXT,
    condition_type  TEXT NOT NULL,
    condition_value INT NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ofta_prod.user_achievement (
    user_id         UUID NOT NULL REFERENCES ofta_prod.user_account(id),
    achievement_id  TEXT NOT NULL REFERENCES ofta_prod.achievement(id),
    unlocked_at     TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, achievement_id)
);

-- ================================================
-- TELEMETRY EVENTS
-- ================================================
CREATE TABLE ofta_prod.telemetry_event (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID,
    event_type      TEXT NOT NULL,
    event_data      JSONB,
    client_ts       TIMESTAMPTZ,
    server_ts       TIMESTAMPTZ DEFAULT NOW(),
    device_os       TEXT,
    app_version     TEXT
);

CREATE INDEX idx_telemetry_type ON ofta_prod.telemetry_event(event_type);
CREATE INDEX idx_telemetry_time ON ofta_prod.telemetry_event(server_ts DESC);

-- ================================================
-- APP CONFIG (feature flags, versioning)
-- ================================================
CREATE TABLE ofta_prod.app_config (
    key             TEXT PRIMARY KEY,
    value           JSONB NOT NULL,
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 8.3 Post-MVP Tables (Planned)

```sql
-- ofta_prod.user_skill_rating       (Elo/IRT per user)
-- ofta_prod.question_difficulty_stat (IRT per question)
-- ofta_prod.category_pack           (purchasable packs)
-- ofta_prod.purchase_receipt         (IAP validation)
-- ofta_prod.friend_challenge         (async battles)
-- ofta_prod.content_report           (moderation queue)
```

---

## 9. API Spec (FastAPI)

### 9.1 Service Structure

```
ofta_core/
├── main.py                          # FastAPI app entry point
├── Dockerfile
├── requirements.txt
├── .env
├── ofta_core/
│   ├── __init__.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── config.py                # GET /v1/config
│   │   ├── auth.py                  # POST /v1/auth/register, /v1/auth/login
│   │   ├── packs.py                 # GET /v1/packs/daily/{date}
│   │   ├── sessions.py              # POST /v1/sessions/start, /submit
│   │   ├── leaderboards.py          # GET /v1/leaderboards/daily/{date}
│   │   ├── users.py                 # GET /v1/users/me/stats
│   │   ├── telemetry.py             # POST /v1/telemetry/events
│   │   ├── schemas.py               # All Pydantic models
│   │   └── admin/
│   │       ├── celebrities.py       # CRUD celebrities
│   │       ├── packs.py             # Manage packs
│   │       └── moderation.py        # Content moderation
│   ├── services/
│   │   ├── scoring_service.py       # Score calculation logic
│   │   ├── pack_service.py          # Pack generation logic
│   │   ├── leaderboard_service.py   # Leaderboard logic
│   │   ├── achievement_service.py   # Achievement checking
│   │   └── star_sign_service.py     # Star sign computation
│   ├── utils/
│   │   ├── util_ofta_db.py          # DB connector (mirrors TascDBConnector)
│   │   ├── firebase_auth.py         # Firebase token verification
│   │   └── config.py                # Environment config
│   └── jobs/
│       └── generate_daily_pack.py   # Daily pack Cloud Run Job
├── tests/
├── migrations/
└── scripts/
    └── seed_celebrities.py          # Initial data seeder
```

### 9.2 Public API Endpoints (MVP)

#### Config
```
GET /v1/config
→ { min_client_version, daily_pack_hash, daily_pack_date, feature_flags }
```

#### Auth
```
POST /v1/auth/register
  body: { firebase_token, display_name?, device_os }
  → { user_id, access_token }

POST /v1/auth/sync
  body: { firebase_token }
  → { user_id, stats }
```

#### Packs
```
GET /v1/packs/daily/{date}
  → { pack_date, pack_hash, questions: [...] }
  (Returns pack JSON directly or signed GCS URL)
```

#### Sessions
```
POST /v1/sessions/start
  body: { mode, pack_date? }
  → { session_id, questions: [...] }

POST /v1/sessions/{session_id}/submit
  body: { attempts: [{ question_template_id, user_answer, response_time_ms, hints_used }] }
  → { results: [{ score, is_correct, error_value }], 
      session_total, streak, achievements_unlocked }
```

#### Leaderboards
```
GET /v1/leaderboards/daily/{date}?limit=100&country=GB
  → { entries: [{ rank, display_name, score, country }] }

GET /v1/leaderboards/daily/{date}/me
  → { rank, score, percentile }
```

#### User Profile & Stats
```
GET /v1/users/me/stats
  → { lifetime_score, best_streak, current_streak, games_played, 
      accuracy_pct, achievements, favourite_category }
```

#### Telemetry
```
POST /v1/telemetry/events
  body: { events: [{ type, data, client_ts }] }
  → { received: count }
```

### 9.3 Admin API Endpoints (JWT-protected)

```
GET    /admin/celebrities?category=music&page=1&limit=50
POST   /admin/celebrities
PUT    /admin/celebrities/{id}
DELETE /admin/celebrities/{id}

POST   /admin/packs/generate/{date}     # Trigger pack generation
GET    /admin/packs?from=2026-01-01&to=2026-02-01
GET    /admin/stats/dashboard            # KPIs overview
```

---

## 10. Mobile App Architecture (Nuxt 2 + Capacitor)

### 10.1 Project Setup

Mirrors `tasc_mobile_app` pattern exactly:

```
ofta_mobile/
├── package.json
├── nuxt.config.js
├── capacitor.config.json
├── capacitor.config.dev.json
├── android/
├── ios/
├── assets/
│   ├── css/
│   │   ├── main.css
│   │   ├── typography.css
│   │   ├── mobile-fixes.css
│   │   └── game.css              # Game-specific styles
│   ├── images/
│   └── sounds/                   # Sound effects (streak, correct, wrong)
├── components/
│   ├── game/
│   │   ├── AgeGuessCard.vue      # Numeric age guess UI
│   │   ├── WhosOlderCard.vue     # Binary compare UI
│   │   ├── ReverseCard.vue       # Star sign / DOB guess
│   │   ├── HintLadder.vue        # Progressive hints
│   │   ├── ScoreDisplay.vue      # Animated score popup
│   │   ├── StreakCounter.vue      # Streak fire animation
│   │   ├── Timer.vue             # Countdown/elapsed timer
│   │   └── ShareCard.vue         # Shareable results image
│   ├── home/
│   │   ├── DailyBanner.vue       # Daily challenge CTA
│   │   ├── ModeSelector.vue      # Game mode cards
│   │   └── StatsPreview.vue      # Quick stats widget
│   ├── leaderboard/
│   │   ├── LeaderboardList.vue
│   │   └── LeaderboardEntry.vue
│   ├── profile/
│   │   ├── ProfileCard.vue
│   │   ├── AchievementGrid.vue
│   │   └── StatsDetail.vue
│   └── shared/
│       ├── AppHeader.vue
│       ├── BottomNav.vue
│       ├── LoadingSpinner.vue
│       └── Modal.vue
├── layouts/
│   ├── default.vue
│   └── game.vue                  # Full-screen game layout
├── pages/
│   ├── index.vue                 # Home / mode selection
│   ├── game/
│   │   ├── age-guess.vue
│   │   ├── whos-older.vue
│   │   ├── reverse.vue
│   │   └── daily.vue
│   ├── leaderboard.vue
│   ├── profile.vue
│   ├── settings.vue
│   └── onboarding.vue
├── plugins/
│   ├── firebase.js               # Firebase Auth init
│   ├── api.js                    # API client ($api)
│   ├── capacitor.client.js       # Capacitor native bridge
│   ├── haptics.client.js         # Haptic feedback
│   ├── sounds.client.js          # Sound effect manager
│   └── mobile-init.client.js     # Mobile platform detection
├── store/
│   ├── index.js                  # Root Vuex store
│   ├── auth.js                   # Auth state (Firebase)
│   ├── game.js                   # Active game session state
│   ├── packs.js                  # Daily pack cache
│   ├── stats.js                  # User stats
│   └── settings.js               # App settings (sound, haptics)
├── composables/
│   └── useGameSession.js         # Game session composable
├── utils/
│   ├── scoring.js                # Client-side score preview (server is truth)
│   └── share.js                  # Share card generation
├── build_playstore.sh
├── build_testflight.sh
└── sync-from-tasc.sh             # NOT NEEDED (standalone app)
```

### 10.2 Capacitor Config

```json
{
  "appId": "com.ofta.game",
  "appName": "One for the Ages",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2000,
      "backgroundColor": "#1a1a2e",
      "showSpinner": false,
      "splashFullScreen": true,
      "splashImmersive": true
    },
    "StatusBar": {
      "style": "light",
      "backgroundColor": "#1a1a2e",
      "overlaysWebView": false
    },
    "Haptics": {},
    "Share": {},
    "PushNotifications": {
      "presentationOptions": ["badge", "sound", "alert"]
    }
  }
}
```

### 10.3 Vuex Store Design

```javascript
// store/game.js — Core game session state
export const state = () => ({
  currentSession: null,      // { id, mode, pack_date }
  currentQuestionIndex: 0,
  questions: [],
  attempts: [],              // Batched before submit
  currentStreak: 0,
  sessionScore: 0,
  isSubmitting: false,
  results: null,
})

export const mutations = {
  SET_SESSION(state, session) { ... },
  NEXT_QUESTION(state) { ... },
  RECORD_ATTEMPT(state, attempt) { ... },
  SET_RESULTS(state, results) { ... },
  RESET_GAME(state) { ... },
}

export const actions = {
  async startSession({ commit }, { mode, packDate }) { ... },
  async submitAttempts({ commit, state }) { ... },
}
```

### 10.4 Performance & UX

- **Pack caching:** Store daily pack JSON in `localStorage` for instant start + offline play
- **Prefetch:** Load next question data while current question is answered
- **Haptics:** Vibration on correct/incorrect (via Capacitor Haptics)
- **Sounds:** Quick sound effects for streaks, correct, wrong answers
- **Animations:** Score flying up, streak fire, card transitions (CSS + GSAP)
- **Offline:** Graceful degradation — play cached pack, submit when back online

---

## 11. Landing Page / Marketing Site

### 11.1 Purpose

- **Marketing:** Explain the game, show screenshots, social proof
- **Download:** App Store + Play Store links
- **Newsletter:** Email capture for launch & updates
- **SEO:** Rank for "celebrity age game", "guess the age", etc.

### 11.2 Technology

**Option A (Recommended): Standalone Nuxt 2 SSG** — Same as TASC web, deployed on Vercel or GCS.

**Option B: Simple static HTML/CSS/JS** — Fastest to ship, hosted on GCS bucket with Cloud CDN.

### 11.3 Page Structure

```
ofta-landing/
├── pages/
│   ├── index.vue          # Hero, features, screenshots, CTA
│   ├── privacy.vue        # Privacy policy
│   └── terms.vue          # Terms of service
├── components/
│   ├── Hero.vue           # Animated hero with app preview
│   ├── Features.vue       # Game mode showcase
│   ├── Screenshots.vue    # App screenshots carousel
│   ├── Newsletter.vue     # Email signup (→ ofta-core /subscriptions)
│   ├── DownloadCTA.vue    # App Store + Play Store badges
│   └── Footer.vue
```

### 11.4 Design Direction

- **Dark theme** with vibrant accents (gold, electric blue)
- **Bold typography** (Inter / Outfit from Google Fonts)
- **Micro-animations** (numbers counting up, stars twinkling)
- **Social proof** section (player count, ratings when available)

---

## 12. Admin Panel (Next.js)

### 12.1 Technology

Mirrors `tasc_studio` exactly:

- **Next.js 14** (App Router)
- **React 18**
- **TailwindCSS 3**
- **React Query** (TanStack Query v5) for data fetching
- **Zustand** for client state
- **Deployed on Cloud Run** (same as `tasc_studio`)

### 12.2 Pages

```
ofta-admin/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Dashboard (KPIs overview)
│   ├── celebrities/
│   │   ├── page.tsx                # Celebrity list + search + filters
│   │   ├── [id]/page.tsx           # Celebrity detail/edit
│   │   └── create/page.tsx         # Add new celebrity
│   ├── packs/
│   │   ├── page.tsx                # Daily pack management
│   │   └── generate/page.tsx       # Trigger pack generation
│   ├── leaderboards/
│   │   └── page.tsx                # View/manage leaderboards
│   ├── users/
│   │   └── page.tsx                # User management + banning
│   ├── achievements/
│   │   └── page.tsx                # Achievement management
│   ├── telemetry/
│   │   └── page.tsx                # Event analytics dashboard
│   └── settings/
│       └── page.tsx                # App config / feature flags
```

---

## 13. Question & Pack Generation

### 13.1 Daily Pack Generation (Cloud Run Job)

A **cron-triggered Cloud Run Job** runs nightly:

```python
# jobs/generate_daily_pack.py

def generate_daily_pack(target_date: date) -> dict:
    """Generate a daily challenge pack for the given date."""
    
    questions = []
    
    # 1. Select 5 AGE_GUESS questions (mixed difficulty)
    age_guess_qs = select_questions(
        mode='AGE_GUESS',
        count=5,
        difficulty_distribution={1: 1, 2: 1, 3: 1, 4: 1, 5: 1}
    )
    questions.extend(age_guess_qs)
    
    # 2. Select 4 WHO_OLDER questions
    who_older_qs = select_questions(
        mode='WHO_OLDER',
        count=4,
        difficulty_distribution={2: 1, 3: 1, 4: 1, 5: 1}
    )
    questions.extend(who_older_qs)
    
    # 3. Select 3 REVERSE_SIGN questions
    reverse_qs = select_questions(
        mode='REVERSE_SIGN',
        count=3,
        difficulty_distribution={2: 1, 3: 1, 4: 1}
    )
    questions.extend(reverse_qs)
    
    # 4. Shuffle for variety
    random.shuffle(questions)
    
    # 5. Build pack JSON
    pack = {
        "pack_date": target_date.isoformat(),
        "pack_hash": hashlib.sha256(json.dumps(questions).encode()).hexdigest()[:16],
        "question_count": len(questions),
        "questions": questions,
        "generated_at": datetime.utcnow().isoformat()
    }
    
    # 6. Upload to GCS
    gcs_path = f"packs/daily/{target_date.isoformat()}.json"
    upload_to_gcs(pack, gcs_path)
    
    # 7. Write daily_pack row
    db.execute_query("""
        INSERT INTO ofta_prod.daily_pack (pack_date, pack_json_url, pack_hash, question_count)
        VALUES (:date, :url, :hash, :count)
        ON CONFLICT (pack_date) DO UPDATE SET
            pack_json_url = :url, pack_hash = :hash, question_count = :count
    """, {"date": target_date, "url": gcs_path, "hash": pack["pack_hash"], "count": len(questions)})
    
    return pack
```

### 13.2 Cloud Scheduler

```
Schedule:    0 2 * * *  (2 AM UTC daily)
Target:      Cloud Run Job: ofta-pack-generator
Retry:       3 attempts, 5 min between
```

---

## 14. Anti-Cheat & Integrity

### 14.1 MVP Controls

| Control | Implementation |
|---------|---------------|
| **Server-side scoring** | All scoring happens on server; client shows previews only |
| **Rate limiting** | Max 5 session submissions per minute per user |
| **Time sanity** | Reject response times < 200ms (impossible for humans) |
| **Score sanity** | Flag perfect scores on difficulty 5 for review |
| **Session integrity** | Session ID + question order verified server-side |
| **Pack hash** | Client sends pack_hash; server validates it matches expected |

### 14.2 Post-MVP Controls

- Probabilistic bot detection via telemetry features
- Shadow banning for bad actors
- Device fingerprinting  
- Replay detection (identical answer patterns)

---

## 15. Observability & Operations

### 15.1 Key Metrics

| Category | Metrics |
|----------|---------|
| **Engagement** | DAU, WAU, MAU, session starts, completion rate per mode |
| **Retention** | D1, D7, D30 retention |
| **Gameplay** | Streak distribution, mode popularity, accuracy by difficulty |
| **Leaderboard** | Daily participation rate, score distribution |
| **Technical** | Latency P50/P95/P99, error rates (5xx/4xx), cost per active user |

### 15.2 Logging (Structured JSON)

Same pattern as `tasc_core`:

```python
import logging
logger = logging.getLogger(__name__)

# Each request gets a trace_id
logger.info("session_started", extra={
    "trace_id": request.state.trace_id,
    "user_id": user_id,
    "mode": mode,
    "pack_date": pack_date,
})
```

### 15.3 Telemetry Event Taxonomy

```
# Client events
app_open, app_close, app_background
screen_view (screen_name)
game_start (mode, pack_date)
question_shown (question_id, difficulty)
question_answered (question_id, is_correct, response_time_ms)
hint_used (question_id, hint_index)
game_complete (mode, total_score, streak)
share_tapped (content_type)
achievement_unlocked (achievement_id)
settings_changed (setting, value)
```

---

## 16. Deployment on GCP

### 16.1 GCP Services

| Service | Use | Cost Model |
|---------|-----|-----------|
| **Cloud Run** (ofta-core) | API service | Pay-per-request + CPU time |
| **Cloud Run** (ofta-admin) | Admin panel | Minimal traffic |
| **Cloud Run Jobs** | Daily pack generator | Triggered once/day |
| **Cloud SQL** (Postgres 14) | Primary database | Smallest instance (db-f1-micro → db-g1-small) |
| **Cloud Storage** | Pack JSONs, future images | Pay-per-GB |
| **Cloud Scheduler** | Trigger daily pack job | Free tier (3 jobs) |
| **Firebase** | Authentication | Free tier (50K MAU) |

### 16.2 Estimated Monthly Cost (MVP)

| Service | Estimate |
|---------|----------|
| Cloud SQL (db-f1-micro) | ~$7/mo |
| Cloud Run (ofta-core) | ~$5-15/mo (low traffic) |
| Cloud Run (ofta-admin) | ~$2/mo |
| Cloud Storage | ~$1/mo |
| Firebase Auth | Free |
| **Total MVP** | **~$15-25/mo** |

---

## 17. CI/CD Pipeline

### 17.1 ofta-core (Backend)

Mirrors `tasc_core` deploy.yml exactly:

```yaml
name: Deploy ofta-core to Cloud Run

on:
  push:
    tags:
      - '*.*.*-dev'
      - '*.*.*-sandbox'
      - '*.*.*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Auth with GCP
        run: |
          echo "${{ secrets.GCP_SA_KEY }}" | base64 --decode > gcp-key.json
          gcloud auth activate-service-account --key-file=gcp-key.json
      - name: Build & Push
        run: |
          IMAGE_URI="us-central1-docker.pkg.dev/ofta-project/ofta-repo/ofta-core:$VERSION"
          gcloud builds submit --tag "$IMAGE_URI"
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy "ofta-core-$ENVIRONMENT" \
            --image="$IMAGE_URI" \
            --region=us-central1 \
            --allow-unauthenticated \
            --set-env-vars="..."
```

### 17.2 ofta-mobile (Mobile App)

Uses the same `build_playstore.sh` and `build_testflight.sh` pattern:

```
npm run generate → npx cap sync → ./gradlew bundleRelease
```

---

## 18. Monetisation Architecture

### 18.1 MVP Monetisation (Low Complexity)

| Method | Implementation |
|--------|---------------|
| **Banner ads** | AdMob integration via Capacitor plugin |
| **Rewarded ads** | Watch ad → get extra hint or retry |
| **Remove ads (IAP)** | One-time purchase to remove all ads |

### 18.2 Post-MVP

- **Premium packs** (category-specific content)
- **Cosmetics** (profile frames, streak animations)
- Avoid subscriptions unless retention data supports it

---

## 19. MVP Scope & Checklist

### ✅ Must Have (Ship First)

- [ ] Anonymous auth + optional Firebase sign-in
- [ ] Celebrity database (500 celebs seeded)
- [ ] Daily pack generation + GCS caching
- [ ] Age Guess mode (fully playable)
- [ ] Who's Older mode (fully playable)
- [ ] Reverse Star Sign mode
- [ ] Server-side scoring
- [ ] Basic leaderboard (daily)
- [ ] Streaks (current + best)
- [ ] 5 achievements (first game, streak of 5, etc.)
- [ ] Admin panel: celebrity CRUD + pack management
- [ ] Landing page with download links
- [ ] Telemetry pipeline
- [ ] Android build (Play Store)
- [ ] iOS build (TestFlight)

### 🔜 Nice to Have (V1.1)

- [ ] Reverse DOB mode (year guess)
- [ ] Category filters in free play
- [ ] Share card (shareable results image)
- [ ] Sound effects + haptics
- [ ] Push notifications (daily challenge reminder)

### 🚀 Future (V2+)

- [ ] Timed Blitz mode
- [ ] Friend battles (async)
- [ ] Celebrity images (licensed)
- [ ] Elo/IRT difficulty system
- [ ] Ad monetisation
- [ ] IAP (remove ads)
- [ ] Party mode

---

## 20. Build Plan (Phased)

### Phase 1: Foundation (Weeks 1-3)

| Task | Description |
|------|-------------|
| **DB Schema** | Create `ofta_prod` schema + all MVP tables |
| **Backend skeleton** | FastAPI app with auth, config, health endpoints |
| **Celebrity seeder** | Script to seed 500 celebrities from Wikidata |
| **DB connector** | Port `TascDBConnector` → `OftaDBConnector` |
| **Firebase setup** | New Firebase project, auth config |
| **GCP project** | Cloud SQL, Cloud Run, GCS bucket |
| **Mobile scaffold** | Nuxt 2 + Capacitor project init |

### Phase 2: Core Gameplay (Weeks 3-5)

| Task | Description |
|------|-------------|
| **Pack generator** | Daily pack Cloud Run Job |
| **Age Guess** | Full gameplay loop (UI + API + scoring) |
| **Who's Older** | Full gameplay loop |
| **Session management** | Start → play → submit → results flow |
| **Scoring service** | All scoring formulas implemented |
| **Streaks** | Track current + best streak |

### Phase 3: Reverse Mode + Polish (Weeks 5-7)

| Task | Description |
|------|-------------|
| **Reverse Star Sign** | Hint ladder + star sign selection |
| **Daily Challenge** | Pack-driven daily mode |
| **Leaderboard** | Daily leaderboard API + UI |
| **Achievements** | 5 starter achievements |
| **Animations** | Score popups, streak fire, transitions |
| **Admin panel** | Celebrity CRUD, pack management |

### Phase 4: Launch Prep (Weeks 7-8)

| Task | Description |
|------|-------------|
| **Landing page** | Marketing site with download links |
| **Telemetry** | Event pipeline + basic dashboard |
| **Anti-cheat** | Rate limiting, sanity checks |
| **App Store prep** | Screenshots, descriptions, privacy policy |
| **Play Store build** | Signed AAB via `build_playstore.sh` |
| **TestFlight build** | iOS build via `build_testflight.sh` |
| **CI/CD** | GitHub Actions deploy workflow |

---

## 21. Repository Structure

### 21.1 Repositories

| Repo | Description | Mirrors |
|------|-------------|---------|
| `one_for_the_ages` | Monorepo root (docs, specs) | — |
| `ofta_core` | FastAPI backend API | `tasc_core` |
| `ofta_mobile` | Nuxt 2 + Capacitor mobile app | `tasc_mobile_app` |
| `ofta_admin` | Next.js admin panel | `tasc_studio` |
| `ofta_landing` | Marketing landing page | `tasc/ecommerce-site` |

**Alternative: Monorepo approach**

Everything lives under `one_for_the_ages/`:

```
one_for_the_ages/
├── docs/                    # This document, specs, diagrams
├── ofta_core/               # Backend (FastAPI)
├── ofta_mobile/             # Mobile app (Nuxt 2 + Capacitor)
├── ofta_admin/              # Admin panel (Next.js)
├── ofta_landing/            # Landing page
└── scripts/                 # Shared scripts, data seeding
```

---

## 22. Key Technical Decisions

### Why Nuxt 2 + Capacitor (not Flutter)?

- **Team knowledge:** Your entire mobile app pipeline (`tasc_mobile_app`) uses Nuxt 2 + Vue 2 + Capacitor
- **Shared tooling:** Same build scripts (`build_playstore.sh`, `build_testflight.sh`)
- **Code reuse:** Component patterns, plugin patterns, Vuex patterns all carry over
- **Speed to ship:** No new framework to learn

### Why precomputed packs?

- Reduces backend complexity and latency
- Enables offline play (cached JSON)
- Predictable gameplay for daily leaderboards
- Low compute cost (one job/day)
- Easy to A/B test

### Why server-side scoring?

- Anti-cheat (client can't fabricate scores)
- Fairness (consistent formulas)
- Easy to tune without app updates

### Why text-first MVP (no celebrity images)?

- Celebrity image licensing is a legal minefield
- Huge speed-to-market advantage
- Can add images later with proper CC/licensed sources

### Why separate GCP project?

- Independent billing tracking
- Clean IAM boundaries
- No risk of affecting TASC production
- Can be transferred to a separate entity if needed

### Why same DB connector pattern?

- `TascDBConnector` is battle-tested in production
- SQLAlchemy pooling, pandas integration, bulk upsert
- Team already knows the patterns

---

## Appendix A: Pack JSON Schema

```json
{
  "pack_date": "2026-02-11",
  "pack_hash": "a1b2c3d4e5f6g7h8",
  "question_count": 12,
  "generated_at": "2026-02-11T02:00:00Z",
  "questions": [
    {
      "id": "uuid-1",
      "mode": "AGE_GUESS",
      "difficulty": 3,
      "celebrity": {
        "id": "uuid-celeb-1",
        "full_name": "Zendaya",
        "primary_category": "Film & TV",
        "nationality": "American"
      },
      "correct_answer": {
        "age": 29,
        "dob": "1996-09-01",
        "star_sign": "Virgo"
      }
    },
    {
      "id": "uuid-2",
      "mode": "WHO_OLDER",
      "difficulty": 4,
      "celebrity_a": {
        "id": "uuid-celeb-2",
        "full_name": "Drake",
        "primary_category": "Music"
      },
      "celebrity_b": {
        "id": "uuid-celeb-3",
        "full_name": "Rihanna",
        "primary_category": "Music"
      },
      "correct_answer": {
        "older": "b",
        "age_a": 39,
        "age_b": 38,
        "gap_years": 1
      }
    },
    {
      "id": "uuid-3",
      "mode": "REVERSE_SIGN",
      "difficulty": 3,
      "celebrity": {
        "id": "uuid-celeb-4",
        "full_name": "LeBron James",
        "primary_category": "Sports"
      },
      "hints": [
        "Born in Akron, Ohio",
        "Known as 'The King'",
        "Born in the last month of the year"
      ],
      "correct_answer": {
        "star_sign": "Capricorn",
        "dob": "1984-12-30"
      }
    }
  ]
}
```

## Appendix B: MVP Achievements

| ID | Title | Description | Condition |
|----|-------|-------------|-----------|
| `first_game` | "Welcome to the Game" | Complete your first game | games_played >= 1 |
| `streak_5` | "On Fire 🔥" | Get a streak of 5 correct | best_streak >= 5 |
| `streak_10` | "Unstoppable" | Get a streak of 10 correct | best_streak >= 10 |
| `perfect_daily` | "Perfect Day" | Score 100% on a daily challenge | daily_accuracy == 100% |
| `century_club` | "Century Club" | Reach 100 games played | games_played >= 100 |

## Appendix C: Environment Variables

```env
# Database
OFTA_DB_HOST=
OFTA_DB_PORT=5432
OFTA_DB_NAME=ofta_db
OFTA_DB_USERNAME=
OFTA_DB_PASSWORD=

# Firebase
FIREBASE_PROJECT_ID=ofta-firebase
GOOGLE_CLOUD_PROJECT=ofta-project

# GCS
OFTA_STORAGE_BUCKET=gs://ofta_bucket_us_central1

# Auth
JWT_SECRET=
SECRET_KEY=

# API Security
DOCS_USER=
DOCS_PASS=

# Feature Flags
ENABLE_REVERSE_MODE=true
ENABLE_LEADERBOARD=true
```

---

*End of specification. This document should be sufficient to begin implementation with minimal ambiguity.*
