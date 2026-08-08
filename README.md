# 🌌 Aetheria — Premium SaaS Productivity Operating Suite

An all-in-one, highly interactive personal productivity suite built with **React 19 + Vite + Tailwind CSS** on the frontend and **Spring Boot 3.5 + PostgreSQL (Supabase)** on the backend.

Aetheria combines academic task management, multi-currency financial budgeting, rich markdown study notes, 3D Pomodoro focus rooms, daily health metrics, an AI Copilot workspace assistant, and direct administrator support into a seamless enterprise SaaS experience.

---

## 📥 Quick Clone

```bash
git clone https://github.com/Ganesh40292/lifeos-ai.git
cd lifeos-ai
```

---

## 🌟 Key Features

### 🎨 1. WebGL & Glassmorphism UI
- **SoftAurora WebGL Background**: Ambient GLSL shader lighting across login, register, and workspace views.
- **Border Beam Panel**: Animated conic gradient ring with spring physics surrounding authentication cards (`BorderBeamPanel.jsx`).
- **Google Single Sign-On (OAuth)**: 1-click **Continue with Google** single sign-on experience on Login and Register pages.

### 🤖 2. Aetheria AI Workspace Copilot (`Ctrl + Shift + A` / `✨`)
- **Interactive AI Assistant** (`AiCopilot.jsx`):
  - Summarizes study notes into key takeaway bullets.
  - Automatically generates 3D flashcards for exam review.
  - Audits monthly financial transactions and recommends savings strategies.
  - Generates 2-hour time-blocked Pomodoro focus schedules.

### 🛟 3. Help & Support Center (`/help`)
- **Direct Admin Channel**: Direct contact link to `ganeshprasad40292.dev@gmail.com` with 1-click address copy.
- **Interactive Support Ticket Form**: Dispatch bug reports, feature requests, or account inquiries straight to the administrator.
- **Searchable FAQ Accordions**: Live-filtered knowledge base covering security, focus rooms, data exports, and shortcuts.
- **Fixed Dark Concrete Texture**: Multi-layer slate base (`#020617`), 14% opacity SVG noise texture, and top-right indigo radial glow.

### 🎵 4. Web Audio SFX Engine
- **Zero-Dependency Sound Effects** (`soundService.js`): Crisp audio feedback for UI clicks, toggle switches, reward chimes, and notifications synthesized using native Web Audio API oscillators.
- **Topbar Sound Toggle**: Global Mute/Unmute audio toggle with persistent user preference (`🔊` / `🔇`).

### 📱 5. Native PWA Mobile/Desktop App & Offline Banner
- **PWA Install Prompt** (`PwaBanner.jsx`): Prompts users to install Aetheria as a native desktop or mobile home screen application.
- **Offline Network Alert**: Displays a status banner when internet connectivity drops.

### 🔔 6. Interactive Notification Center
- **Slide-out Notification Drawer** (`NotificationCenter.jsx`): Real-time assignment deadline alerts (< 24h), budget category threshold warnings (> 80%), and daily workout reminders.

### 🌐 7. Multi-Language (i18n) Support
- **Global Language Selector**: Toggle workspace languages seamlessly (**English 🇺🇸, Spanish 🇪🇸, Français 🇫🇷, Deutsch 🇩🇪, 日本語 🇯🇵, हिंदी 🇮🇳**).

### ⚙️ 8. Elevated Settings UI (`/settings`)
- **Profile Hero Summary**: Displays user avatar, level status, account verification badge, and email.
- **Live Theme Selector**: 6 curated themes (*Midnight, Aurora, Graphite OLED, Ocean Depth, Emerald Forest, Light Modern*) with real UI color swatch pills.
- **Global Hotkey Matrix**: Searchable keyboard shortcuts table with category pills (`Navigation`, `Actions`, `Global`).
- **Storage Allocation & JSON Backup**: Visual breakdown meter for study notes, finance logs, health data, and 1-click JSON backup exporter.

### 🐘 9. Cloud PostgreSQL & Supabase Integration
- **PostgreSQL Native Support**: Complete database schema (`schema.sql`) configured with `UUID` primary keys, `TIMESTAMP WITHOUT TIME ZONE`, `DECIMAL(15,2)`, and cascading foreign keys.
- **Supabase Cloud Ready**: Pre-configured application profile (`application-supabase.yml`) optimized for Supabase transaction poolers and Render cloud hosting.

---

## 📁 Repository Structure

```text
LifeOS/
├── backend/
│   └── lifeos-api/
│       ├── Dockerfile                   # Multi-stage Docker build for Render/Koyeb
│       ├── pom.xml                      # Spring Boot 3.5 dependencies & PostgreSQL driver
│       └── src/main/resources/
│           ├── application.yml          # Core production environment configuration
│           ├── application-local.yml    # In-memory H2 PostgreSQL mode for local dev
│           ├── application-supabase.yml # Live Supabase PostgreSQL profile
│           └── schema.sql               # PostgreSQL schema definition script
├── frontend/
│   ├── vercel.json                      # Vercel client path rewrites configuration
│   ├── vite.config.js                   # Vite build & PWA configuration
│   └── src/                             # React 19 source code
│       ├── components/                  # UI components, Copilot, NotificationCenter, PwaBanner
│       ├── context/                     # ThemeContext, AuthContext, LanguageContext
│       ├── pages/                       # Dashboard, Student, Finance, Notes, Focus, Health, Help, Settings
│       └── services/                    # SoundService, API services
└── README.md
```

---

## 💻 Local Quickstart Guide

### Step 1: Clone the Repository
```bash
git clone https://github.com/Ganesh40292/lifeos-ai.git
cd lifeos-ai
```

### Step 2: Launch Frontend Client
```bash
cd frontend
npm install
npm run dev
```
Access the application at `http://localhost:5173/`.

### Step 3: Launch Backend API (Local Profile)
Open a separate terminal window:
```bash
cd backend/lifeos-api
./mvnw spring-boot:run "-Dspring-boot.run.profiles=local"
```
The local profile runs in-memory with PostgreSQL dialect compatibility on `http://localhost:8080`.

---

---

## ☁️ Cloud Deployment Setup Guide

> ℹ️ **Note**: All previous live cloud instances (Vercel, Render, Supabase) have been torn down/reset by the project maintainer. Follow the guide below to deploy your own fresh instances.

This project is configured for single-click deployment using **Vercel + Render + Supabase**:

| Layer | Service | Configuration |
|---|---|---|
| **Frontend** | **Vercel** | Root directory: `frontend`, Framework: `Vite`, Env: `VITE_API_URL` |
| **Backend** | **Render** | Root directory: `backend/lifeos-api`, Build: `./mvnw clean package -DskipTests`, Env: `SPRING_PROFILES_ACTIVE=supabase` |
| **Database & Storage** | **Supabase** | PostgreSQL Database (`schema.sql`) & Storage Bucket (`notes`) |

### Deployment Steps:

1. **Database (Supabase)**: Create a new PostgreSQL project on Supabase and run `schema.sql`. Create a storage bucket named `notes`.
2. **Backend (Render)**: Create a Java Web Service on Render pointing to `backend/lifeos-api`. Set environment variables for `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, `JWT_SECRET`, `SUPABASE_URL`, and `SUPABASE_KEY`.
3. **Frontend (Vercel)**: Import the repository into Vercel setting Root Directory to `frontend`. Add environment variable `VITE_API_URL` pointing to your Render backend URL.

### Launch Backend Locally Connected to Supabase
```bash
./mvnw spring-boot:run "-Dspring-boot.run.profiles=supabase"
```
