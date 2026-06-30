# 🌌 LifeOS — The Gamified Operating System for Your Life

An all-in-one, highly interactive personal productivity suite that transforms daily habits, academic tasks, study notes, and financial budgeting into a gamified RPG experience.

[![Vite](https://img.shields.io/badge/Vite-8.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io)
[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://oracle.com/java)
[![MySQL](https://img.shields.io/badge/MySQL-9.6-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://mysql.com)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-11.0-F107A3?style=for-the-badge&logo=framer&logoColor=white)](https://framer.com/motion)

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
