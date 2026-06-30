# 🌌 LifeOS — The Gamified Operating System for Your Life

An all-in-one, highly interactive personal productivity suite that transforms daily habits, academic tasks, study notes, and financial budgeting into a gamified RPG experience.

[![Vite](https://img.shields.io/badge/Vite-8.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io)
[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://oracle.com/java)
[![MySQL](https://img.shields.io/badge/MySQL-9.6-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://mysql.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.0-F107A3?style=for-the-badge&logo=framer&logoColor=white)](https://framer.com/motion)
[![Live Site](https://img.shields.io/badge/Live_Site-Visit_Here-00C9A7?style=for-the-badge&logo=vercel&logoColor=white)](https://lifeos-ai-one.vercel.app/)

---

## 🌟 Key Features

### 🎮 Gamification Core & RPG leveling
- **Dynamic XP Progress Bar**: Earn experience points (XP) and level up for every task completed, focus block tracked, note saved, and expense logged.
- **WebSocket Real-time Notifications**: Receive system messages and levels alerts instantly.

### 🔮 Interactive RPG Skill Tree (`/skills`)
- **Spend SP to Unlock Perks**: Spend accumulated character levels (Skill Points) to unlock passive attribute gains (e.g. *Study Initiate*, *Frugal Scholar*).
- **Web Audio Synthesizer**: Unlocking or inspecting nodes plays audio frequencies using the browser **Web Audio API** oscillator nodes.

### ⌛ Interactive 3D Focus Room (`/focus`)
- **Procedural lo-fi Sound Generator**: Generate customized ambient noises (Rain, Ocean waves, Drone frequencies) completely client-side.
- **Glassmorphism 3D Timer**: Track Pomodoro cycles inside an animated glass cylinder.

### 📚 Notes & AI PDF Study Companion (`/notes`)
- **Split-Screen Reader Panel**: View notes/PDFs on the left and Summaries, Quizzes, or Flashcards on the right.
- **CSS 3D Flashcards**: Flip cards dynamically to review vocabulary.
- **Practice Quizzes**: Take generated understanding quizzes and submit scores to claim **+30 XP** in the database.

### 📊 Daily Focus Streak Heatmap (Dashboard)
- **Active Streak Calculations**: Automatically walks backward to compute active consecutive days of logged activity.
- **GitHub-Style Contribution Grid**: Dark mode grid indicating study activity density.

### 🗣️ SiriOS Voice Commander
- **Vocal Shortcuts**: Tap "V" to activate the microphone. Parse natural language statements such as *"spent 150 on food"* or navigate directly with *"go to focus"* or *"open settings"*.

### 💵 Finance Multi-Currency Switcher (`/finance`)
- **Dynamic Exchange Rates**: Toggle baseline display values dynamically (USD, EUR, GBP, INR, JPY, CAD, AUD).
- **Inputs Auto-Conversion**: Modal form entries are read in local currencies and converted to base USD in the DB automatically.

---

## 📁 Repository Structure
```
LifeOS/
├── backend/
│   └── lifeos-api/         # Spring Boot backend application code
├── frontend/
│   ├── vercel.json         # Vercel client path rewrites configuration
│   ├── vite.config.js      # Vite build + Workbox PWA caching rules
│   └── src/                # React components, pages, context, and hooks
└── schema-mysql.sql        # MySQL complete database setup script
```

---

## 💻 Local Quickstart

### 1. Database Setup
Ensure you have **MySQL** running locally, then execute the setup script:
```bash
mysql -u root -p < schema-mysql.sql
```

### 2. Run the Backend API
1. Navigate to the backend directory:
   ```bash
   cd backend/lifeos-api
   ```
2. Launch the Spring Boot application under the local profile:
   ```bash
   ./mvnw spring-boot:run "-Dspring-boot.run.profiles=local"
   ```

### 3. Run the Frontend Client
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Access the web app at [http://localhost:5173/](http://localhost:5173/).

---

## ☁️ Cloud Deployment Configuration

This repository is optimized for quick hosting configurations:

| Service | Host | Configuration Required |
| :--- | :--- | :--- |
| **Database** | Railway | Create a MySQL instance. Host variables (`MYSQLHOST`, `MYSQLPORT`, etc.) are read automatically. |
| **Backend API** | Render | Map `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` variables. Set `FRONTEND_URL` to Vercel domain. |
| **Frontend** | Vercel | Set `VITE_API_URL` and `VITE_API_BASE_URL` to point to the Render backend service url. |

---

## 🔑 Environment Variables Reference

### Backend (`backend/lifeos-api`)
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `SPRING_DATASOURCE_URL` | JDBC database connection endpoint | `jdbc:mysql://host:port/db?useSSL=false` |
| `SPRING_DATASOURCE_USERNAME` | MySQL database username | `root` |
| `SPRING_DATASOURCE_PASSWORD` | MySQL database password | `yourpassword` |
| `SPRING_JPA_PROPERTIES_HIBERNATE_DIALECT` | Hibernate SQL translation engine | `org.hibernate.dialect.MySQLDialect` |
| `FRONTEND_URL` | CORS authorized frontend address | `https://lifeos.vercel.app` |
| `JWT_SECRET` | Secret key for signing login JWTs | `at-least-256-bit-long-secret-key-phrase` |
| `JWT_EXPIRATION_MS` | Token validity duration | `86400000` (24 Hours) |

### Frontend (`frontend`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | API target for client HTTP fetches | `https://lifeos-api.onrender.com/api` |
| `VITE_API_URL` | Base host target for WebSockets | `https://lifeos-api.onrender.com` |

---

## 📡 Core API Endpoints

### 🔐 Authentication
* `POST /api/auth/register` — Create a new account.
* `POST /api/auth/login` — Sign in and retrieve JWT.
* `POST /api/auth/verify-2fa` — Verify two-factor authentication TOTP code.

### 🎮 Gamification & User Profiles
* `POST /api/users/xp` — Reward XP for specific activities (e.g. `STUDY_QUIZ`).
* `GET /api/notifications` — Retrieve level achievements and WebSocket alerts history.
* `POST /api/notifications/mark-all-read` — Reset unread notification counts.

### 📚 Study & notes
* `GET /api/notes` — Retrieve user note lists and study materials folders.
* `POST /api/notes` — Save notes and folders created via SiriOS or split-screen companion.
* `GET /api/student/subjects` — Get list of course modules, class attendance, and grade points.
* `POST /api/student/assignments` — Add assignments or due project dates.

### 💰 Transactions & Ledger
* `GET /api/finance/summary` — Get ledger statistics, budgets limits, and savings goals totals.
* `POST /api/finance/transactions` — Log income/expense entries (DB auto-scales local input currencies to USD).

---

## ⌨️ Keyboard Shortcuts & Shortcuts Menu

Maximize navigation speeds using global hotkeys:

* `Ctrl + K` — Toggle search **Command Palette** popup overlay.
* `?` — View keyboard shortcut cheatsheet.
* `v` — Activate **SiriOS Voice Assistant** speech-recognition.
* `g` then `d` — Navigate to **Dashboard**.
* `g` then `n` — Navigate to **Notes Page**.
* `g` then `f` — Navigate to **Finance Manager**.
* `g` then `s` — Navigate to **Academics / Student** dashboard.
* `g` then `h` — Navigate to **Health Manager**.
* `g` then `p` — Navigate to **Focus Pomodoro Room**.
* `g` then `e` — Navigate to **Settings Page**.

---

## 🎙️ SiriOS Natural Language Voice Commands

Once voice mode is active (click microphone or press `V`), speak natural sentences:

* **Log Transaction**: *"spent 150 on food"* or *"log expense 500 for books"* or *"paid 1200 for rent"*
* **Save Notes**: *"note down project ideas"* or *"create note shopping list"*
* **Academic Tasks**: *"study database tomorrow"* or *"add assignment calculus"*
* **Quick Navigation**: *"go to focus"*, *"navigate to finance"*, *"open settings"*, *"show dashboard"*, *"open skill tree"*
