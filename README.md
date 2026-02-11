# One for the Ages 🎮

> **Celebrity age trivia game** — Guess ages, compete on leaderboards, master the ages!

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📱 What is One for the Ages?

A mobile-first trivia game where players guess celebrity ages across multiple game modes:

- **Age Guess** — How old is this celebrity?
- **Who's Older?** — Pick the older celebrity
- **Daily Challenge** — Compete on daily leaderboards
- **Reverse Mode** — Guess star signs from hints

---

## 🏗️ Project Structure

This is a **monorepo** containing all OFTA components:

```
one_for_the_ages/
├── backend/          # FastAPI backend (Python 3.10)
├── mobile/           # Next.js 15 mobile app (iOS + Android via Capacitor)
├── admin/            # Next.js 15 admin panel
├── landing/          # Marketing landing page
├── docs/             # Architecture & design docs
└── scripts/          # Shared scripts (DB seeding, deployment)
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (for mobile/admin/landing)
- **Python** 3.10+ (for backend)
- **PostgreSQL** 14+ (local or Cloud SQL)
- **Docker** (optional, for local development)

### Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Configure your environment
uvicorn main:app --reload --port 8080
```

Visit: http://localhost:8080/docs

### Mobile App (Next.js + Capacitor)

```bash
cd mobile
npm install
npm run dev           # Web development
npm run build         # Production build
npm run mobile:ios    # Open iOS in Xcode
npm run mobile:android # Open Android in Android Studio
```

Visit: http://localhost:3000

### Admin Panel

```bash
cd admin
npm install
npm run dev
```

Visit: http://localhost:3001

---

## 📦 Deployment

### Backend & Admin (Automated via GitHub Actions)

```bash
# Tag for deployment
git tag 1.0.0         # Production
git tag 1.0.0-dev     # Development
git tag 1.0.0-sandbox # Sandbox/Test

git push --tags       # Triggers Cloud Run deployment
```

### Mobile (Manual Build)

```bash
cd mobile

# Android (Play Store)
./build_playstore.sh

# iOS (TestFlight)
./build_testflight.sh
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Mobile** | Next.js 15, React 18, TypeScript, Capacitor 7, TailwindCSS |
| **Backend** | FastAPI, Python 3.10, Pydantic v2, SQLAlchemy |
| **Database** | PostgreSQL 14 (Cloud SQL) |
| **Admin** | Next.js 15, React 18, TypeScript, TailwindCSS |
| **Auth** | Firebase Auth |
| **Cloud** | GCP (Cloud Run, Cloud SQL, Cloud Storage) |
| **CI/CD** | GitHub Actions |

---

## 📚 Documentation

- [Architecture & Design](./docs/ARCHITECTURE.md) — Complete system design
- [API Specification](./docs/API_SPEC.md) — Backend API docs
- [Deployment Guide](./docs/DEPLOYMENT.md) — How to deploy

---

## 🎯 Roadmap

### MVP (v1.0) — Target: 8 weeks
- [x] Architecture design
- [ ] Backend API (FastAPI)
- [ ] Mobile app (Next.js + Capacitor)
- [ ] Admin panel
- [ ] 500 celebrity database
- [ ] Daily pack generation
- [ ] Leaderboards
- [ ] App Store submission

### v1.1
- [ ] Sound effects & haptics
- [ ] Share cards
- [ ] Push notifications
- [ ] Category packs

### v2.0
- [ ] Friend battles
- [ ] Timed blitz mode
- [ ] Celebrity images
- [ ] Monetization (ads + IAP)

---

## 📄 License

MIT License — See [LICENSE](./LICENSE) for details.

---

## 👥 Team

Built by the TASC team.

---

## 🔗 Links

- **Landing Page:** [Coming Soon]
- **App Store:** [Coming Soon]
- **Play Store:** [Coming Soon]
- **Support:** [Coming Soon]
