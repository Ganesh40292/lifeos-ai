# 📂 Aetheria Project Structure & Directory Layout

```
Aetheria/
├── backend/
│   └── lifeos-api/                     # Spring Boot 3.5 REST API Backend
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/com/lifeos/
│       │   │   │   ├── config/         # CorsConfig, SecurityConfig, WebSocketConfig
│       │   │   │   ├── controller/     # Auth, User, Finance, Student, Health, Notes Controllers
│       │   │   │   ├── model/          # JPA Entities (User, Subject, Assignment, Transaction, etc.)
│       │   │   │   ├── repository/     # Spring Data JPA Repositories
│       │   │   │   ├── security/       # JWT Token Provider & Filter, TOTP 2FA Utilities
│       │   │   │   └── service/        # Business Logic Services
│       │   │   └── resources/
│       │   │       ├── application.properties
│       │   │       └── schema.sql       # MySQL Schema DDL
│       └── pom.xml
│
├── frontend/                           # React 18 + Vite Production Frontend
│   ├── public/                         # Static Assets, PWA Icons, robots.txt
│   ├── src/
│   │   ├── assets/                     # Styles, SVG Assets
│   │   ├── components/
│   │   │   ├── dashboard/              # QuickStats, Charts, Heatmap, Habits, LifeScore, Report
│   │   │   ├── finance/                # ForecastPanel, InsightsPanel
│   │   │   ├── gamification/           # XPBar, LevelModal, AchievementsPanel
│   │   │   ├── health/                 # HealthInsightsPanel
│   │   │   ├── layout/                 # Sidebar, Topbar, Breadcrumbs, MobileBottomNav, MainLayout
│   │   │   ├── notes/                  # StudyCompanion, Flashcards, QuizModal
│   │   │   ├── notifications/          # NotificationBell, NotificationCenter
│   │   │   ├── student/                # StudyScheduler
│   │   │   └── ui/                     # Avatar, Badge, Button, Card, CommandPalette, EmptyState, ErrorBoundary, Input, Loader3D, Modal, OnboardingTour, ShortcutHelp, SkeletonLoader, ThreeDBackground, VoiceButton
│   │   ├── context/                    # AuthContext, ThemeProvider
│   │   ├── hooks/                      # useAuth, useClickOutside, useDebounce, useHotkeys, useNotifications, useVoiceInput
│   │   ├── pages/                      # LoginPage, RegisterPage, DashboardPage, SkillsPage, FocusPage, NotesPage, FinancePage, StudentPage, HealthPage, SettingsPage
│   │   ├── routes/                     # AppRoutes (React.lazy + Suspense), ProtectedRoute
│   │   ├── services/                   # Axios API Clients (auth, dashboard, finance, student, health, notes)
│   │   └── utils/                      # constants, exportUtils, formatters
│   ├── index.html                      # Entry HTML with Google Fonts & Meta Details
│   ├── src/index.css                   # Aetheria Design Tokens & Tailwind Directives
│   ├── vite.config.js                  # Rollup manualChunks Vendor Splitting & PWA Manifest
│   └── package.json
│
├── ARCHITECTURE.md                     # System Architecture & Mermaid Diagrams
├── DESIGN_SYSTEM.md                    # Design Tokens, 8px Spacing, Typography & Motion
├── USER_GUIDE.md                       # Keyboard Shortcuts & Usage Guide
├── PROJECT_STRUCTURE.md                # Repository Directory Map
└── DEPLOYMENT.md                       # Production Deployment & Security Headers Guide
```
