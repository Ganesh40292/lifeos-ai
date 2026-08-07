# 🚀 Aetheria Production Deployment & Security Guide

This document outlines deployment configurations for Vercel, Render, and Railway, alongside security header directives for production environments.

---

## 🔒 Recommended HTTP Security Headers

When serving Aetheria in production (via Vercel `vercel.json` or nginx/Apache reverse proxies), configure the following headers:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(self), geolocation=(), payment=()"
        },
        {
          "key": "Cross-Origin-Opener-Policy",
          "value": "same-origin"
        },
        {
          "key": "Cross-Origin-Resource-Policy",
          "value": "same-origin"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' http://localhost:8080 ws://localhost:8080 wss: https:;"
        }
      ]
    }
  ]
}
```

---

## ☁️ Deployment Checklist

### 1. Frontend (Vercel)
1. Import repository into Vercel dashboard.
2. Build Settings:
   - Framework: **Vite**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Environment Variables:
   - `VITE_API_BASE_URL` = `https://your-backend.onrender.com/api`
   - `VITE_API_URL` = `https://your-backend.onrender.com`

### 2. Backend (Render / Docker)
1. Create Web Service on Render targeting `backend/lifeos-api`.
2. Build Command: `./mvnw clean package -DskipTests`
3. Start Command: `java -jar target/lifeos-api-0.0.1-SNAPSHOT.jar`
4. Environment Variables:
   - `SPRING_DATASOURCE_URL` = `jdbc:mysql://your-railway-mysql:3306/lifeos?useSSL=false`
   - `SPRING_DATASOURCE_USERNAME` = `root`
   - `SPRING_DATASOURCE_PASSWORD` = `[YOUR_SECRET_PASSWORD]`
   - `FRONTEND_URL` = `https://aetheria.vercel.app`
   - `JWT_SECRET` = `[YOUR_SECURE_256_BIT_SECRET]`

### 3. Database (Railway MySQL)
1. Provision a MySQL 8.0 instance on Railway.
2. Initialize database schema via `backend/lifeos-api/src/main/resources/schema-mysql.sql`.
