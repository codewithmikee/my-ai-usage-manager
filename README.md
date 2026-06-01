# LimitTracker

Track API and service rate limits with inline editing, countdown timers, and desktop notification reminders. This is a fully static, offline-first React SPA optimized for prompt deployment on platforms like Cloudflare Pages, Vercel, Netlify, and conventional static web servers.

---

## 🚀 Key Features

- **Offline-First Storage**: Securely stores all configured services, account identifiers, and limit durations locally on your device via standard browser `localStorage` (via persistent Zustand state).
- **Inline Editing**: Double-click any service name or account title to rename instantly.
- **Dynamic Restrictive-timers**: Configure the exact time or offset of a lock relative to local minutes/hours, or specific dates.
- **Micro-Timer Countdowns**: Toggle active time-distance countdowns in your title bar and tables with high-precision updates.
- **Import / Export backups**: Seamlessly export your entire toolchain setup into a standardized `.json` format file. Restore or merge historical configurations directly within the sidebar backup station.
- **Desktop Notification Alerts**: Subscribes to local browser alerts matching the precise millisecond of a limit reset.

---

## 🛠️ Local Development

Ensure Node.js is installed on your local environment (Node 18+ recommended), then follow these commands:

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Dev Server
```bash
npm run dev
```
Loads the local instance directly at `http://localhost:3000`.

### 3. Build & Minify Production Assets
```bash
npm run build
```
Creates highly optimized, lightning-fast static single-page assets inside the `./dist` directory.

---

## ⚡ Deployment Playbook (Cloudflare Pages, Vercel, & Netlify)

Because this application relies entirely on client-side state and high-fidelity native APIs, it generates zero server footprint and requires **no background databases or hosting overhead**.

### Cloudflare Pages
1. Push this workspace code to your preferred GitHub or GitLab repository.
2. Navigate to your **Cloudflare Dashboard** -> **Workers & Pages** -> **Create application** -> **Pages**.
3. Select and connect your repository.
4. Input the following Build configurations:
   - **Framework Preset**: `Vite` (or `None`)
   - **Build Command**: `npm run build`
   - **Build Output Directory**: `dist`
5. Click **Save and Deploy**. Your static tracker is live on Cloudflare's edge network under a secure custom domain instantly.

### Vercel / Netlify
Similarly, import your repository:
- Use build command: `npm run build`
- Use output directory: `dist`
- No environment variables are necessary since all states compute client-side.

---

## 📁 Backup Specifications & Schema
Export states adhere to standard JSON declarations representing structured arrays of services:
```json
[
  {
    "id": "e6a12b9",
    "name": "Service Name (e.g. Claude 3.5 Sonnet)",
    "accounts": [
      {
        "id": "x90v2u1",
        "name": "Personal Tier",
        "availableAt": 1779927600000,
        "notified": false
      }
    ]
  }
]
```
*Note: If `availableAt` is set to `null` or a timestamp in the past, the account is marked instantly as "Ready" for operation.*
