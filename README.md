# DPSWT (Direct People Support Welfare Team) - Peer-to-Peer (P2P) Welfare Aid Platform

A production-ready, zero-custody Peer-to-Peer Welfare Aid platform inspired by **DPSWT** (`https://dpswt.com/`), built using **Next.js 15 (App Router), TypeScript (strict mode), Tailwind CSS, and Supabase (PostgreSQL, Auth, Storage & RLS)**.

---

## 🏛️ Architectural Overview & Core Principles

1. **Zero-Custody P2P Model:**
   The platform never holds or handles donation funds in an escrow wallet. When an emergency appeal is active, the verified nominee's bank account and UPI details are presented directly to contributing members.

2. **UPI Intent Deep Linking:**
   Contributing members tap one button on mobile to launch their native UPI app (`upi://pay?pa={upiId}&pn={nomineeName}&am=50&cu=INR&tn={appealCode}`) to transfer ₹50 directly into the nominee's account. Desktop users can scan dynamically generated QR codes.

3. **The 75% Compliance Engine:**
   Members must maintain a minimum 75% contribution rate to historical community appeals to remain eligible for family aid grants (up to ₹20,00,000 for bereavement). Calculated dynamically via:
   $$\text{Compliance Ratio} = \left(\frac{\text{Contributed Appeals}}{\text{Total Historical Appeals}}\right) \times 100$$

4. **Proof & Verification Workflow:**
   Donors submit their 12-digit bank UTR reference number and upload a payment receipt screenshot to Supabase Storage. District Field Inspectors audit and match these records against nominee passbooks before approving them.

5. **Membership & Annual Renewal:**
   Aadhaar-verified registration tracking a ₹50 annual subscription fee cycle to maintain portal infrastructure and field inspection operations.

---

## 📱 Universal Cross-Device Responsiveness

- **Mobile Phones (< 640px):** Single-column layout, touch targets >= 44x44px, sticky bottom navigation bar (`BottomNav`), native UPI deep links, mobile file camera/upload picker.
- **Tablets (640px - 1024px):** 2-column adaptive grid layouts for appeals and statistics, balanced padding, fluid typography.
- **Desktop (> 1024px):** Multi-column dashboard layouts, comprehensive audit tables, sticky headers, subtle hover micro-interactions, QR code zoom view.

---

## 🎨 Claude-Inspired Editorial Design System

- **Backgrounds:** Warm Sand / Canvas (`#FAF8F5`), crisp white cards (`#FFFFFF`) with subtle inset panels (`#F5F2EB`).
- **Typography:** Warm Charcoal (`#262421`) for primary text, Warm Driftwood (`#736F68`) for subtitles. Editorial serif headings paired with clean sans-serif for numbers, tables, and badges.
- **Accents:** Terracotta Clay (`#C85A32`) for primary actions, emergency alerts, and progress fills; Muted Sage (`#437A5B`, bg: `#EDF4EE`) for verified compliance badges and active membership statuses.
- **Borders:** Warm muted stone (`#E7E2DA`).

---

## 📂 Site Architecture & Route Map

| Route | Page Name | Purpose |
|---|---|---|
| `/` | **Landing Page** | Trust mission statement ("जन से जन तक, सहयोग हर जरूरतमंद तक"), live metrics counter, 4 core pillars, live appeals preview, interactive 75% compliance simulator, FAQ. |
| `/appeals` | **Active Appeals Feed** | Filterable feed (Bereavement, Daughter's Marriage, Active/Closed), search by code/district, live progress bars, 1-click UPI pay button, QR modal, Slip upload trigger. |
| `/appeals/[id]` | **Appeal Detail Page** | Full case story, signed inspector verification report, nominee bank credentials with copy-to-clipboard, dynamic QR code, and live public donors audit log. |
| `/appeals/create` | **Submit Emergency Appeal** | Portal for members/coordinators to file bereavement or marriage assistance requests with nominee bank credentials. |
| `/rules` | **75% Compliance Rules** | Complete editorial rulebook explaining ₹50 annual contribution model, 75% compliance formula, 90-day lock-in period, and field audit protocols. |
| `/dashboard` | **Member Dashboard** | Personal membership ID card, annual renewal countdown, dynamic Compliance Meter (radial SVG gauge & eligibility badge), pending appeals requiring ₹50, and past contribution history. |
| `/admin/inspector` | **District Inspector Audit** | Review dashboard for field officers to filter pending UTR submissions, inspect receipt thumbnails with zoom modal, passbook matching, and 1-click Verify / Reject actions. |
| `/contact` | **Coordinator Directory** | Searchable directory of state and district coordinators across Uttar Pradesh divisions, emergency helpline, and grievance desk. |
| `/login` | **Member Login** | Login with membership ID / phone and 1-click Demo Role Switcher (Member, Inspector, Admin). |
| `/register` | **Aadhaar Registration** | 2-step registration with Aadhaar hash extraction, department selector, nominee bank credentials, and immediate membership ID generation. |

---

## 🗄️ Supabase Schema & Database Integration

The complete PostgreSQL schema, RLS policies, triggers, and seed data are included in:
- `supabase/schema.sql`: Complete DDL, tables, constraints, indexes, RLS policies, trigger `recalculate_appeal_collected_amount`, and stored function `get_member_compliance`.
- `supabase/seed.sql`: Realistic seed data with Uttar Pradesh districts, verified appeals, nominees, and donation records.

### Tables:
1. `members` (UUID PK linked to `auth.users`, membership_id, full_name, phone, aadhaar_last4, aadhaar_hash, department, district, state, role, fee_expires_at)
2. `nominees` (UUID PK, member_id FK, full_name, relationship, bank_name, account_number, ifsc_code, upi_id)
3. `appeals` (UUID PK, code, member_id FK, type, target_amount, collected_amount, status, inspector_name, nominee_snapshot JSONB)
4. `donation_records` (UUID PK, appeal_id FK, donor_id FK, amount, utr_number [12-digit unique], slip_url, status, inspector_notes)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables (Optional)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
*(Note: If left empty, the application automatically runs in zero-friction demo mode using the interactive reactive store with full state persistence, UTR verification, and compliance simulation!)*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```
