# 🎯 OFTA Database Configuration — Updated

## ✅ Changes Made

### 1. Database Schema Structure
- **Schema**: `da_prod` (shared schema, not `ofta`)
- **Tables**: All prefixed with `ofta_` (e.g., `da_prod.ofta_user_account`)
- **Views**: All prefixed with `v_ofta_` (e.g., `da_prod.v_ofta_active_users`)
- **Functions**: All prefixed with `ofta_` (e.g., `da_prod.ofta_calculate_age()`)
- **Triggers**: All prefixed with `ofta_` (e.g., `ofta_trigger_update_user_stats`)

### 2. Database Connector
- **File**: `backend/ofta_core/utils/util_db.py` (copied from TASC pattern)
- **Function**: `get_db_connector()` (singleton pattern)
- **Class**: `OftaDBConnector`
- **Features**:
  - Connection pooling
  - Bulk upsert with temp tables
  - DataFrame operations
  - COPY for fast inserts

### 3. Environment Variables
- `OFTA_DB_HOST` (not TASC_DB_HOST)
- `OFTA_DB_PORT`
- `OFTA_DB_NAME`
- `OFTA_DB_USERNAME`
- `OFTA_DB_PASSWORD`

### 4. Data Products Folder
Created `data_products/` structure:
```
data_products/
├── README.md
└── table/
    └── create/
        └── (SQL scripts go here)
```

---

## 📋 Complete Table List

All tables in `da_prod` schema with `ofta_` prefix:

1. `da_prod.ofta_user_account` — User accounts and profiles
2. `da_prod.ofta_celebrity` — Celebrity data (name, DOB, category, hints)
3. `da_prod.ofta_question_template` — Question templates for all game modes
4. `da_prod.ofta_daily_pack` — Daily challenge packs
5. `da_prod.ofta_game_session` — Game sessions
6. `da_prod.ofta_question_attempt` — Individual question attempts
7. `da_prod.ofta_leaderboard_daily` — Daily leaderboard rankings
8. `da_prod.ofta_user_stats` — Aggregated user statistics
9. `da_prod.ofta_achievement` — Achievement definitions
10. `da_prod.ofta_user_achievement` — User achievement unlocks
11. `da_prod.ofta_telemetry_event` — Analytics events
12. `da_prod.ofta_app_config` — App configuration and feature flags

---

## 🔧 Updated Files

### Backend
- ✅ `backend/schema.sql` — Updated to use `da_prod.ofta_*`
- ✅ `backend/setup_database.py` — Updated to check `da_prod` schema
- ✅ `backend/ofta_core/utils/util_db.py` — New DB connector (from TASC)
- ✅ `backend/ofta_core/api/auth.py` — Updated table references
- ✅ `backend/ofta_core/api/config.py` — Updated table references
- ✅ `backend/ofta_core/api/sessions.py` — Updated table references
- ✅ `backend/.env.example` — Uses `OFTA_DB_*` variables

### Data Products
- ✅ `data_products/README.md` — Documentation
- ✅ `data_products/table/create/` — Folder for SQL scripts

---

## 🚀 Next Steps (Setup Guide)

### Step 1: Install Dependencies
```bash
# Mobile
cd mobile && npm install

# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Step 2: Configure Environment
```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
```

### Step 3: Setup Database
```bash
# Option A: Create new database
createdb ofta_db

# Option B: Use existing database (just create da_prod schema if needed)
psql -d your_existing_db -c "CREATE SCHEMA IF NOT EXISTS da_prod;"
```

### Step 4: Run Schema Setup
```bash
cd backend
source venv/bin/activate
python setup_database.py
```

**Expected Output:**
```
🔌 Connecting to PostgreSQL at localhost:5432/ofta_db...
✅ Connected successfully!
📄 Reading schema from schema.sql...
🔨 Creating schema and tables...
✅ Schema created successfully!

📊 Created 12 OFTA tables in da_prod schema:
   ✓ ofta_achievement
   ✓ ofta_app_config
   ✓ ofta_celebrity
   ✓ ofta_daily_pack
   ✓ ofta_game_session
   ✓ ofta_leaderboard_daily
   ✓ ofta_question_attempt
   ✓ ofta_question_template
   ✓ ofta_telemetry_event
   ✓ ofta_user_account
   ✓ ofta_user_achievement
   ✓ ofta_user_stats

🎉 Database setup complete!
```

### Step 5: Configure Firebase
See `SETUP_GUIDE.md` for detailed Firebase setup instructions.

### Step 6: Run Backend
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8080
```

### Step 7: Run Mobile App
```bash
cd mobile
npm run dev
```

---

## 📝 Naming Convention Summary

| Object Type | Pattern | Example |
|-------------|---------|---------|
| **Tables** | `da_prod.ofta_{name}` | `da_prod.ofta_user_account` |
| **Views** | `da_prod.v_ofta_{name}` | `da_prod.v_ofta_active_users` |
| **Functions** | `da_prod.ofta_{name}` | `da_prod.ofta_calculate_age()` |
| **Triggers** | `ofta_trigger_{name}` | `ofta_trigger_update_user_stats` |
| **Indexes** | `idx_ofta_{table}_{column}` | `idx_ofta_user_firebase_uid` |

---

## ✅ Verification Checklist

- [ ] Database connector uses `da_prod.ofta_*` tables
- [ ] All API endpoints reference `da_prod.ofta_*`
- [ ] Schema creates tables in `da_prod` schema
- [ ] Environment variables use `OFTA_DB_*` prefix
- [ ] `data_products/` folder structure created
- [ ] `setup_database.py` checks for `da_prod` schema

---

**All updates complete! Ready to proceed with setup.** 🚀
