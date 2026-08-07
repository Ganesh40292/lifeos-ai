# 🏛️ Aetheria System Architecture

Aetheria is an all-in-one gamified SaaS productivity operating platform structured around a modern decoupled client-server architecture.

```mermaid
graph TD
    subgraph Client ["Aetheria Client (React 18 + Vite)"]
        UI["React Component UI Layer"]
        FM["Framer Motion Engine (150ms-350ms)"]
        WA["Web Audio Synthesizer"]
        AX["Axios HTTP / SockJS STOMP Client"]
    end

    subgraph Backend ["Aetheria Backend (Spring Boot 3.5)"]
        SC["Spring Security (JWT + 2FA TOTP)"]
        RC["REST Controllers (/api/*)"]
        WS["WebSocket STOMP Broker (/ws/*)"]
        JPA["Spring Data JPA / Hibernate ORM"]
    end

    subgraph DB ["Database (MySQL 8.0)"]
        T1["Users & Sessions"]
        T2["Academics & Timetable"]
        T3["Ledger & Budgets"]
        T4["Notes & Gamification XP"]
    end

    UI --> AX
    FM --> UI
    WA --> UI
    AX -->|HTTPS / REST| RC
    AX -->|WSS / STOMP| WS
    RC --> SC
    SC --> JPA
    WS --> JPA
    JPA --> DB
```

---

## 🔒 Security Architecture
1. **JWT Session Tokens**: Signed with HMAC SHA-256 keys, stored in secure local storage with expiration validation.
2. **Two-Factor Authentication (2FA)**: Time-based One-Time Passwords (TOTP) generated via authenticator applications.
3. **Password Security**: Hashed via BCrypt with salt rounds.
4. **CORS Policy**: Configured in `CorsConfig.java` to support credentialed cross-origin requests.

---

## 📡 WebSockets & Real-Time Notification Pipeline
- Connection: STOMP protocol over SockJS fallback endpoint `/ws`.
- Channels:
  - `/topic/notifications`: System-wide achievements, level-up alerts, and budget threshold warnings.
