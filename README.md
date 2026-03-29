<div align="center">

# SpendGuard AI ✨

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Smilingshadow-cmyk/clever-spend-bot)

**Intelligent Expense Auditing & Transaction Triaging Engine** <br/>
*A next-generation financial ledger manager powered by Google Gemini AI.*

<img alt="React" src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB"/>
<img alt="Vite" src="https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white"/>
<img alt="TailwindCSS" src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white"/>
<img alt="TypeScript" src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white"/>
<img alt="Supabase" src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />

</div>

---

## 🌟 Overview

SpendGuard AI transforms overwhelming transaction spreadsheets into structured, audit-ready data. With an intuitive, state-of-the-art **Glassmorphism UI** and an embedded **AI Triage Queue**, distinguishing business expenditures from personal anomalies has never been so frictionless and elegant.

## 🚀 Key Features

- **🤖 AI-Powered Auto-Triage**: Leverages the **Google Gemini API** to automatically parse unfamiliar merchants, infer categorization context, and recommend whether a charge belongs in standard overhead, balance sheet, or an anomaly queue.
- **✨ Premium UI & Animations**: Fluid, next-generation user experience built with heavily customized Tailwind CSS routines, interactive parallax backgrounds, and hardware-accelerated SVG animations.
- **🛡️ Custom Rule Engine**: Teach SpendGuard how to handle recurring vendors. The intelligent auditor learns from your custom ledger overrides to automatically approve matching transactions in the future.
- **📊 Real-time Insights & Analytics**: Clean data visualization powered by Recharts comparing actual spends to allocated budgets.
- **☁️ Silent Cloud Sync**: Local-first architecture meaning your data lives on your machine for zero-latency interactions, while seamlessly synchronizing to our Supabase backend for cross-device persistence.
- **✉️ Automated Exception Resolution**: Auto-generate highly professional email drafts for flagged anomalies via Gemini AI directly within the interface to quickly request justification from employees or contractors.

## 💻 Tech Stack

- **Frontend Framework**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI, Custom Glassmorphism Utilities
- **State Management**: React Context, TanStack Query
- **AI Integration**: Google Gen AI SDK (`gemini-2.5-flash`)
- **Backend / Auth / Database**: Supabase

## 🛠️ Getting Started Locally

### The 1-Click Way (Windows)
If you're on Windows, simply double-click the `run.bat` file in the root directory. This automated script will:
1. Install any missing dependencies securely.
2. Boot up the Vite development server.
3. Automatically load the app in your default web browser (`http://localhost:8080`).

### The Developer Way (Terminal)
Ensure you have Node.js installed on your machine.
```bash
# Clone the repository
git clone https://github.com/Smilingshadow-cmyk/clever-spend-bot.git
cd clever-spend-bot

# Install dependencies (only required once)
npm install

# Start the development server
npm run dev
```
The application will be available at `http://localhost:8080`.

## ⚙️ Environment Configuration

To unlock full capabilities, you will need API keys. Create a `.env` file in the root of the project and populate it with your specific backend integrations:

```env
# Supabase Configuration
VITE_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"

# Google Gemini API Configuration 
VITE_GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

---
<div align="center">
  <i>Built for modern financial audits. Zero friction. Zero confusion.</i>
</div>
