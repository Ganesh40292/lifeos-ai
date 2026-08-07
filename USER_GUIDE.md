# 📖 Aetheria User & Developer Guide

Welcome to **Aetheria** — the gamified SaaS productivity suite.

---

## ⌨️ Keyboard Shortcuts Reference

| Shortcut | Action |
| :--- | :--- |
| `⌘ K` / `Ctrl + K` | Toggle Universal Command Palette |
| `?` | Toggle Keyboard Shortcut Cheatsheet |
| `V` | Activate SiriOS Voice Commander |
| `g` then `d` | Jump to Dashboard |
| `g` then `n` | Jump to Study Notes & AI Companion |
| `g` then `f` | Jump to Finance Manager |
| `g` then `s` | Jump to Student Hub |
| `g` then `h` | Jump to Health Tracker |
| `g` then `p` | Jump to 3D Focus Room |
| `g` then `e` | Jump to Settings & Preferences |
| `Esc` | Close popups and dialogs |

---

## 🚀 Local Quickstart Setup

### 1. Database Setup
Start a local MySQL server and initialize the schema:
```bash
mysql -u root -p < backend/lifeos-api/src/main/resources/schema-mysql.sql
```

### 2. Launch Backend API
```bash
cd backend/lifeos-api
./mvnw spring-boot:run "-Dspring-boot.run.profiles=local"
```

### 3. Launch Frontend Client
```bash
cd frontend
npm install
npm run dev
```
Access the application at [http://localhost:5173/](http://localhost:5173/).
