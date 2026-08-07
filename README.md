# 🌌 Aetheria — Premium SaaS Productivity Operating Suite

An all-in-one, highly interactive personal productivity suite built with **React 19 + Vite + Tailwind CSS** on the frontend and **Spring Boot 3.5 + PostgreSQL (Supabase)** on the backend.

Aetheria combines academic task management, multi-currency financial budgeting, rich markdown study notes, 3D Pomodoro focus rooms, daily health metrics, an AI Copilot workspace assistant, and direct administrator support into a seamless enterprise SaaS experience.

---

## 🌟 Key Features & Latest Upgrades

### 🎨 1. Premium WebGL & Glassmorphism Aesthetics
- **SoftAurora WebGL Background**: Procedural GLSL shader animation powering full-screen ambient lighting across authentication and workspace views.
- **Border Beam Panel**: Twin comets orbiting a 2px conic gradient ring driven by delta-time spring physics (`BorderBeamPanel.jsx`).
- **Google Single Sign-On (OAuth)**: 1-click **Continue with Google** single sign-on experience on both Login and Register pages.

### 🤖 2. Aetheria AI Workspace Copilot (`Ctrl + Shift + A` / `✨`)
- **Smart Workspace Assistant** (`AiCopilot.jsx`):
  - Summarizes study notes into key takeaway bullets.
  - Automatically generates 3D flashcards for exam review.
  - Audits monthly financial transactions and recommends savings strategies.
  - Generates 2-hour time-blocked Pomodoro focus schedules.

### 🛟 3. Help & Support Center (`/help`)
- **Direct Admin Channel**: Quick contact link to `ganeshprasad40292.dev@gmail.com` with 1-click email copy.
- **Interactive Support Ticket Form**: Dispatch bug reports, feature requests, or account inquiries straight to the administrator.
- **Searchable FAQ Accordions**: Instant live-filtered knowledge base covering security, focus rooms, data exports, and shortcuts.
- **Fixed Dark Concrete Texture**: Multi-layer slate base (`#020617`), 14% opacity SVG noise texture, and top-right indigo radial glow.

### 🎵 4. Web Audio Micro-Interaction SFX Engine
- **Zero-Dependency Sound Effects** (`soundService.js`): Synthesizes crisp audio feedback for UI clicks, toggle switches, reward chimes, and notifications using browser Web Audio API oscillator nodes.
- **Topbar Sound Toggle**: Global Mute/Unmute audio toggle with persistent user preference (`🔊` / `🔇`).

### 📱 5. Native PWA Mobile/Desktop App & Offline Banner
- **PWA Install Prompt** (`PwaBanner.jsx`): Invites users to install Aetheria as a native desktop or mobile home screen application.
- **Offline Network Alert**: Displays a subtle status alert when internet connectivity drops.

### 🔔 6. Interactive Notification Center Drawer
- **Slide-out Notification Drawer** (`NotificationCenter.jsx`): Displays real-time assignment deadline alerts (< 24h), budget category threshold warnings (> 80%), and daily workout reminders.

### 🌐 7. Multi-Language (i18n) Support
- **Global Language Selector**: Toggle workspace languages seamlessly (**English 🇺🇸, Spanish 🇪🇸, Français 🇫🇷, Deutsch 🇩🇪, 日本語 🇯🇵, हिंदी 🇮🇳**).

### ⚙️ 8. Elevated Next-Level Settings UI (`/settings`)
- **Profile Hero Summary**: Displays user initials avatar, level status, account security verification badge, and email.
- **Live Theme Selector**: 6 curated themes (*Midnight, Aurora, Graphite OLED, Ocean Depth, Emerald Forest, Light Modern*) with real UI color swatch pills.
- **Global Hotkey Filters**: Searchable keyboard shortcuts matrix with category pills (`Navigation`, `Actions`, `Global`).
- **Data & Storage Allocation Bar**: Visual breakdown meter for study notes, finance logs, health data, and 1-click JSON backup export.

### 🐘 9. Cloud PostgreSQL & Supabase Integration
- **PostgreSQL Native Support**: Complete database schema (`schema.sql`) configured with `UUID` primary keys, `TIMESTAMP WITHOUT TIME ZONE`, `DECIMAL(15,2)`, and cascading foreign keys.
- **Supabase Cloud Ready**: Dedicated application profile (`application-supabase.yml`) optimized for Supabase transaction poolers and Render cloud hosting.

---

## 📁 Repository Structure
```
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

## 💻 Local Quickstart

### 1. Run the Frontend Client
```bash
cd frontend
npm install
npm run dev
```
Access the application at `http://localhost:5173/`.

### 2. Run the Backend API (Local Profile)
```bash
cd backend/lifeos-api
./mvnw spring-boot:run "-Dspring-boot.run.profiles=local"
```
The local profile runs in-memory with PostgreSQL dialect compatibility.

---

## ☁️ Production Deployment Architecture

- **Frontend**: Deployed on **Vercel** (`frontend/`)
- **Backend API**: Deployed on **Render** (`backend/lifeos-api/` with `Dockerfile`)
- **Database**: Hosted on **Supabase** (PostgreSQL)

### Launching Backend with Supabase
```bash
./mvnw spring-boot:run "-Dspring-boot.run.profiles=supabase"
```
