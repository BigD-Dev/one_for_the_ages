# 🚀 OFTA Setup Guide — Step by Step

Follow these steps to get One for the Ages running locally.

---

## ✅ Step 1: Install Mobile Dependencies

```bash
cd /Users/oladiranadanijo/github_repos/one_for_the_ages/mobile
npm install
```

**What this does:** Installs Next.js 15, React 19, Capacitor 7, and all dependencies.

---

## ✅ Step 2: Set Up PostgreSQL Database

### Option A: Create New Database

```bash
# Create the database
createdb ofta_db

# Verify it was created
psql -l | grep ofta_db
```

### Option B: Use Existing Database

If you already have a PostgreSQL database, you can use that and just create a new schema called `ofta`.

---

## ✅ Step 3: Configure Backend Environment

```bash
cd /Users/oladiranadanijo/github_repos/one_for_the_ages/backend

# Copy the example environment file
cp .env.example .env

# Edit the .env file with your database credentials
nano .env  # or use your preferred editor
```

**Update these values in `.env`:**

```bash
OFTA_DB_HOST=localhost
OFTA_DB_PORT=5432
OFTA_DB_NAME=ofta_db          # Your database name
OFTA_DB_USERNAME=postgres      # Your PostgreSQL username
OFTA_DB_PASSWORD=your_password # Your PostgreSQL password
```

---

## ✅ Step 4: Install Backend Dependencies

```bash
cd /Users/oladiranadanijo/github_repos/one_for_the_ages/backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

---

## ✅ Step 5: Run Database Schema Setup

```bash
# Make sure you're in the backend directory with venv activated
cd /Users/oladiranadanijo/github_repos/one_for_the_ages/backend
source venv/bin/activate

# Run the database setup script
python setup_database.py
```

**What this does:**
- Creates the `ofta` schema
- Creates all 12 tables (user_account, celebrity, question_template, etc.)
- Sets up indexes, triggers, and constraints
- Inserts seed data for achievements and app config

**Expected output:**
```
✅ Database connection successful
✅ Schema setup completed successfully
✅ Created 12 tables
✅ Created 8 indexes
✅ Created 2 triggers
```

---

## ✅ Step 6: Configure Firebase Project

### 6.1 Create Firebase Project

1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name it "One for the Ages" or "OFTA"
4. Enable Google Analytics (optional)
5. Create project

### 6.2 Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Enable these sign-in methods:
   - ✅ **Anonymous** (for guest play)
   - ✅ **Email/Password** (for registered users)
   - ✅ **Google** (optional, for social login)

### 6.3 Get Firebase Config

1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps"
3. Click the **Web** icon (`</>`)
4. Register app with nickname "OFTA Web"
5. Copy the `firebaseConfig` object

### 6.4 Create Service Account Key (for Backend)

1. Go to **Project Settings** → **Service Accounts**
2. Click "Generate new private key"
3. Download the JSON file
4. Save it as `/Users/oladiranadanijo/github_repos/one_for_the_ages/backend/firebase-service-account.json`

### 6.5 Update Environment Files

**Backend (`.env`):**
```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_KEY=/path/to/firebase-service-account.json
GOOGLE_CLOUD_PROJECT=your-project-id
```

**Mobile (create `.env.local`):**
```bash
cd /Users/oladiranadanijo/github_repos/one_for_the_ages/mobile

# Create .env.local file
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
EOF
```

---

## ✅ Step 7: Run Backend Server

```bash
cd /Users/oladiranadanijo/github_repos/one_for_the_ages/backend
source venv/bin/activate

# Run the FastAPI server
uvicorn main:app --reload --port 8080
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8080 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Test it:** Open http://localhost:8080/docs in your browser to see the Swagger API documentation.

---

## ✅ Step 8: Run Mobile App

**In a new terminal:**

```bash
cd /Users/oladiranadanijo/github_repos/one_for_the_ages/mobile

# Run the development server
npm run dev
```

**Expected output:**
```
  ▲ Next.js 15.1.4
  - Local:        http://localhost:3000
  - Network:      http://192.168.1.x:3000

 ✓ Ready in 2.3s
```

**Test it:** Open http://localhost:3000 in your browser.

---

## ✅ Step 9: Verify Everything Works

### Backend Health Check
```bash
curl http://localhost:8080/health
```

Expected: `{"status":"healthy","service":"ofta-api","version":"0.0.1"}`

### API Config Endpoint
```bash
curl http://localhost:8080/v1/config
```

Expected: JSON with `min_client_version`, `feature_flags`, `categories`, etc.

### Mobile App
1. Open http://localhost:3000
2. You should see the OFTA home page with 4 game mode buttons
3. Click any button (will need backend + data to fully work)

---

## 🎮 Next Steps

Your OFTA app is now running! But you need celebrity data to play games:

1. **Seed Celebrity Data** — We need to create a script to populate 500 celebrities
2. **Generate Questions** — Create question templates from celebrity data
3. **Test Gameplay** — Play a full game end-to-end

---

## 🐛 Troubleshooting

### Database Connection Error
```
Error: could not connect to server
```
**Fix:** Make sure PostgreSQL is running: `brew services start postgresql` (Mac) or `sudo service postgresql start` (Linux)

### Port Already in Use
```
Error: Address already in use
```
**Fix:** Kill the process using the port:
```bash
lsof -ti:8080 | xargs kill -9  # For backend
lsof -ti:3000 | xargs kill -9  # For mobile
```

### Firebase Auth Error
```
Error: Firebase Admin SDK not initialized
```
**Fix:** Make sure `FIREBASE_SERVICE_ACCOUNT_KEY` path is correct in `.env`

### Module Not Found
```
ModuleNotFoundError: No module named 'fastapi'
```
**Fix:** Activate venv and reinstall:
```bash
source venv/bin/activate
pip install -r requirements.txt
```

---

## 📝 Summary Checklist

- [ ] Mobile dependencies installed (`npm install`)
- [ ] PostgreSQL database created (`createdb ofta_db`)
- [ ] Backend `.env` configured with database credentials
- [ ] Backend dependencies installed (`pip install -r requirements.txt`)
- [ ] Database schema created (`python setup_database.py`)
- [ ] Firebase project created and configured
- [ ] Backend running (`uvicorn main:app --reload --port 8080`)
- [ ] Mobile app running (`npm run dev`)
- [ ] Health check passes (`curl http://localhost:8080/health`)

**Once all checked, you're ready to build!** 🚀
