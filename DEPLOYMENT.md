# 🚀 Aetheria Production Deployment & Security Guide

This document outlines deployment configurations for Vercel, Render, and Supabase PostgreSQL & Cloud Storage, alongside security header directives for production environments.

---

## 🏗️ Production Architecture

```text
Vercel (React + Vite PWA Frontend)
       │
       ▼ REST (HTTPS) / WebSockets (WSS)
Render (Spring Boot 3 REST API)
       │
       ├──────────────────────────┐
       ▼                          ▼
Supabase PostgreSQL DB      Supabase Cloud Storage (PDF Attachments)
```

---

## 🔒 Recommended HTTP Security Headers

When serving Aetheria in production (via Vercel `vercel.json` or reverse proxies), configure the following headers:

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
        }
      ]
    }
  ]
}
```

---

## ☁️ Production Deployment Checklist

### 1. Frontend (Vercel)
1. Import repository into Vercel dashboard.
2. Build Settings:
   - Framework: **Vite**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Environment Variables:
   - `VITE_API_URL` = `https://aetheria-backend-cxnb.onrender.com`
   - `VITE_GOOGLE_CLIENT_ID` = `<YOUR_GOOGLE_CLIENT_ID>`

### 2. Backend (Render / Docker)
1. Create Web Service on Render targeting `backend/lifeos-api`.
2. Build Command: `./mvnw clean package -DskipTests`
3. Start Command: `java -jar target/lifeos-api-0.0.1-SNAPSHOT.jar`
4. Environment Variables:
   - `SPRING_PROFILES_ACTIVE` = `supabase`
   - `SPRING_DATASOURCE_URL` = `jdbc:postgresql://aws-0-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require`
   - `SPRING_DATASOURCE_USERNAME` = `<YOUR_SUPABASE_USERNAME>`
   - `SPRING_DATASOURCE_PASSWORD` = `<YOUR_SUPABASE_PASSWORD>`
   - `FRONTEND_URL` = `https://lifeos-ai-azure.vercel.app`
   - `JWT_SECRET` = `<YOUR_CRYPTOGRAPHICALLY_STRONG_256_BIT_SECRET>`
   - `GOOGLE_CLIENT_ID` = `<YOUR_GOOGLE_CLIENT_ID>`
   - `GOOGLE_CLIENT_SECRET` = `<YOUR_GOOGLE_CLIENT_SECRET>`
   - `GEMINI_API_KEY` = `<YOUR_GEMINI_API_KEY>`
   - `SUPABASE_URL` = `https://bujlhczsiucvmjvwswnw.supabase.co`
   - `SUPABASE_KEY` = `<YOUR_SUPABASE_KEY>`
   - `SUPABASE_BUCKET` = `notes`

### 3. Database & Storage (Supabase)
1. Provision PostgreSQL database on Supabase.
2. Create Storage Bucket named **`notes`** for persistent PDF note attachment storage.
