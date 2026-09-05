# Ziggers Admin Console (Web)

A high-performance, standalone React + TypeScript web application built for the **Ziggers** internal operations team. Connects with the Spring Boot backend REST API and Supabase PostgreSQL database to manage identity verification queues (KYC), escrow dispute resolution, automated fraud & risk monitoring, trust scores & penalty fines, B2B corporate enterprise accounts, and 8 precomputed analytics modules.

---

## 🚀 Tech Stack

- **Frontend Core**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS v4, custom glassmorphism design tokens, Lucide Icons
- **Routing**: React Router DOM v6 with top-level `AuthGuard`
- **State & Data Fetching**: TanStack Query (React Query v5) for typed API management
- **Analytics Charts**: Recharts (Area, Bar, Line, Pie, Histograms)
- **Backend & Auth**: Spring Boot REST API integration (`/api/admin/*`) + JWT authentication with `ROLE_ADMIN` authority requirement + automatic mock fallback layer
- **Database**: Supabase PostgreSQL (via Spring Boot backend)

---

## 🏛️ Information Architecture & Modules

| Route | Module | Purpose & Features |
|---|---|---|
| `/login` | Authentication | Admin JWT login screen, role verification, demo credentials preset |
| `/admin/dashboard` | Analytics Overview | Overview KPI cards + 8 precomputed analytics snapshot tabs (Recharts) + manual snapshot refresh trigger |
| `/admin/kyc/queue` | Verification Queue | Pending worker & employer KYC list, role filters, quick approve/reject actions |
| `/admin/kyc/:userId` | KYC Detail | Aadhaar/PAN photo inspector, Didit Liveness AI gauge, side-by-side field comparison, hotkeys (`A` / `R`) |
| `/admin/disputes` | Dispute Resolution | Contested task overview, worker vs employer evidence photos, escrow release split slider |
| `/admin/fraud-alerts` | Risk Monitoring | Location spoofing, velocity jumps, duplicate device IDs, flag & account suspension modals |
| `/admin/trust-score` | Trust Score & Fines | Manual trust score adjustments, bonus issuance, penalty fines, wallet balance adjustments |
| `/admin/organizations` | B2B Accounts | Corporate client list, workforce stats, onboard company modal, active/suspend toggle |
| `/admin/organizations/:orgId` | Organization Detail | Member roster, posted enterprise zigs, billing invoice history |

---

## ⌨️ High-Volume Reviewer Keyboard Shortcuts

On the **KYC Detail Inspector** screen (`/admin/kyc/:userId`):
- Press <kbd>A</kbd> to trigger **Approve Application** modal.
- Press <kbd>R</kbd> to trigger **Reject Submission** modal.
- Press <kbd>Esc</kbd> to dismiss confirmation dialogs.

---

## 🛠️ Installation & Running Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Vite Development Server**:
   ```bash
   npm run dev
   ```

3. **Build Production Bundle & Verify Types**:
   ```bash
   npm run build
   ```
