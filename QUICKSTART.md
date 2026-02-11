# 🚀 OFTA Quick Start

## Prerequisites
- PostgreSQL 14+
- Python 3.10+
- Node.js 18+
- Firebase account

---

## 1️⃣ Install Dependencies (5 min)

```bash
# Backend
cd /Users/oladiranadanijo/github_repos/one_for_the_ages/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Mobile
cd /Users/oladiranadanijo/github_repos/one_for_the_ages/mobile
npm install
```

---

## 2️⃣ Configure Database (2 min)

```bash
# Create database (or use existing)
createdb ofta_db

# Configure backend
cd /Users/oladiranadanijo/github_repos/one_for_the_ages/backend
cp .env.example .env
nano .env  # Update OFTA_DB_* variables
```

---

## 3️⃣ Run Database Setup (1 min)

```bash
cd /Users/oladiranadanijo/github_repos/one_for_the_ages/backend
source venv/bin/activate
python setup_database.py
```

**Expected:** 12 tables created in `da_prod` schema with `ofta_` prefix

---

## 4️⃣ Configure Firebase (10 min)

1. Create project at https://console.firebase.google.com/
2. Enable Authentication (Anonymous + Email/Password)
3. Download service account key → `backend/firebase-service-account.json`
4. Update `backend/.env`:
   ```
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_SERVICE_ACCOUNT_KEY=./firebase-service-account.json
   ```
5. Create `mobile/.env.local` with Firebase config

---

## 5️⃣ Run Everything (1 min)

```bash
# Terminal 1: Backend
cd /Users/oladiranadanijo/github_repos/one_for_the_ages/backend
source venv/bin/activate
uvicorn main:app --reload --port 8080

# Terminal 2: Mobile
cd /Users/oladiranadanijo/github_repos/one_for_the_ages/mobile
npm run dev
```

---

## ✅ Verify

- Backend: http://localhost:8080/docs
- Mobile: http://localhost:3000
- Health: `curl http://localhost:8080/health`

---

## 📚 Full Documentation

- **Complete Setup**: `SETUP_GUIDE.md`
- **Database Config**: `DATABASE_CONFIG.md`
- **Architecture**: `docs/ARCHITECTURE.md`
- **Build Progress**: `BUILD_COMPLETE.md`

---

**Total Setup Time: ~20 minutes** ⏱️
