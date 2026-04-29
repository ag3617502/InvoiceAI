# 🚀 MASTER BUILD PROMPT — InvoiceAI SaaS for Indian Freelancers
## Complete Step-by-Step Instructions for AI-Assisted MERN Development

---

> **ROLE INSTRUCTION FOR AI:**
> You are a **Senior MERN Stack Developer** with 8+ years of experience building scalable SaaS products. You write clean, modular, production-ready code. You always think about security first (no localStorage for tokens, always httpOnly cookies), proper MongoDB schema design with references and aggregations, and React component reusability. You never cut corners. You treat every feature like it's going to 100,000 users.For implementing the AI you part in project you can use the langchain with groq and for embedding save in mongo db if required in project and use the gemeni model for embedding generation we have keys in root.env file copy required thing from there and keep in main folder which we create, user groq api key and gemeni api keys if requiered from the .env available.
1. Mongoose with proper schema design, indexing, and aggregation pipelines 
2. Express.js with layered architecture (routes → controllers → services → models)
3. JWT access + refresh tokens stored in HttpOnly cookies (never localStorage)
4. React 18 with React Router v6, Zustand for state, TanStack Query for server state.
5. Zod for validation on both frontend and backend 
6. You never hardcode secrets, always use .env, and always sanitize inputs 
7. You write middleware for auth, error handling, rate limiting, and role checks
8. Every API response follows: { success, data, message, pagination? } 
9. You think about security first: CORS, Helmet, rate limiting, XSS, NoSQL injection prevention
---

## 🎨 DESIGN SYSTEM (Apply to Every Screen)

### Color Palette
```
Primary:       #6C63FF  (Indigo-Purple — trust, modern)
Primary Dark:  #4B44CC
Secondary:     #00C9A7  (Teal — growth, money)
Accent:        #FF6B6B  (Coral — urgency, CTAs)
Warning:       #FFB347  (Amber — pending, invoices)
Success:       #2ECC71  (Green — paid, confirmed)
Background:    #0F0F1A  (Deep navy-black — premium dark)
Surface:       #1A1A2E  (Card background)
Surface2:      #16213E  (Nested card / sidebar)
Border:        #2A2A45  (Subtle dividers)
Text Primary:  #FFFFFF
Text Secondary:#A0AEC0
Text Muted:    #4A5568
```

### Typography
```
Font Family:   'Inter' (Google Fonts) — clean, modern
Headings:      font-bold, tracking-tight
Body:          font-normal, leading-relaxed
Code/Numbers:  'JetBrains Mono' (for INR amounts, invoice numbers)
```

### Component Style Rules
```
Border Radius: rounded-2xl for cards, rounded-xl for buttons, rounded-full for badges
Shadows:       shadow-[0_4px_24px_rgba(108,99,255,0.15)] — purple glow on cards
Buttons:       Gradient bg — from-[#6C63FF] to-[#00C9A7], hover scale-105, transition-all
Input Fields:  bg-[#1A1A2E] border border-[#2A2A45] focus:border-[#6C63FF] rounded-xl
Sidebar:       bg-[#16213E] w-64 fixed, icon + label nav items
Animations:    framer-motion — page transitions (fadeUp), card entrances (staggered)
```

### Global UI Libraries
```
- TailwindCSS (utility classes)
- ShadCN UI (base components — Dialog, Dropdown, Toast)
- Framer Motion (animations)
- Recharts (all charts and graphs)
- React Hot Toast (notifications)
- Lucide React (icons)
- React Hook Form + Zod (all form validation)
```

---

## 🗂️ REACT ROUTING ARCHITECTURE

### Router Setup
Use **React Router v6** with nested routes and protected route wrapper.

```
/ (root)
├── /auth
│   ├── /login
│   ├── /signup
│   ├── /forgot-password
│   ├── /reset-password/:token
│   └── /verify-email/:token
│
├── /onboarding              ← after first signup only
│
└── /app  (ProtectedRoute wrapper — checks auth cookie)
    ├── /dashboard           ← index route
    ├── /clients
    │   ├── /                ← client list
    │   ├── /new             ← add client form
    │   ├── /:clientId       ← client profile
    │   └── /:clientId/edit  ← edit client
    ├── /invoices
    │   ├── /                ← invoice list
    │   ├── /new             ← invoice builder
    │   ├── /:invoiceId      ← invoice detail / preview
    │   └── /:invoiceId/edit
    ├── /expenses
    │   ├── /                ← expense list
    │   └── /new
    ├── /payments
    │   └── /                ← payment tracker
    ├── /proposals
    │   ├── /                ← proposal list
    │   ├── /new
    │   └── /:proposalId
    ├── /ai-hub              ← all AI tools
    ├── /reports             ← analytics
    ├── /gst                 ← GST & tax
    ├── /settings
    │   ├── /profile
    │   ├── /business
    │   ├── /branding
    │   └── /billing
    └── /team                ← Pro plan only
        ├── /members
        └── /activity
```

### Protected Route Component
```jsx
// src/components/ProtectedRoute.jsx
// Check if user cookie/session is valid
// If not authenticated → redirect to /auth/login
// If authenticated but no onboarding → redirect to /onboarding
// If plan doesn't include feature → show UpgradeModal
```

---

## 🗄️ MONGODB MODELS — COMPLETE SCHEMA

### 1. User Model
```javascript
// models/User.js
{
  _id: ObjectId,
  email: { type: String, unique: true, lowercase: true, required: true },
  password: { type: String, required: true },        // bcrypt hashed
  isEmailVerified: { type: Boolean, default: false },
  emailVerifyToken: String,
  emailVerifyExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,

  // Business Info (filled in onboarding)
  businessName: String,
  businessType: { type: String, enum: ['freelancer','agency','company'] },
  gstNumber: String,
  panNumber: String,
  phone: String,
  address: {
    line1: String, line2: String,
    city: String, state: String, pincode: String
  },
  logo: String,                    // Cloudinary URL

  // Plan
  plan: { type: String, enum: ['free','starter','pro','agency'], default: 'free' },
  planExpiresAt: Date,
  razorpayCustomerId: String,
  razorpaySubscriptionId: String,

  // Team
  teamId: { type: ObjectId, ref: 'Team' },
  role: { type: String, enum: ['owner','admin','member'], default: 'owner' },

  // Preferences
  currency: { type: String, default: 'INR' },
  invoicePrefix: { type: String, default: 'INV' },
  invoiceCounter: { type: Number, default: 1 },

  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}
```

### 2. Client Model
```javascript
// models/Client.js
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true, index: true },
  teamId: { type: ObjectId, ref: 'Team' },

  name: { type: String, required: true },
  email: String,
  phone: String,
  company: String,
  gstNumber: String,
  address: {
    line1: String, line2: String,
    city: String, state: String, pincode: String, country: { type: String, default: 'India' }
  },

  // Stats (denormalized for performance)
  totalInvoiced: { type: Number, default: 0 },
  totalPaid: { type: Number, default: 0 },
  totalPending: { type: Number, default: 0 },
  lastInvoiceDate: Date,

  notes: String,
  tags: [String],
  isActive: { type: Boolean, default: true },

  createdAt: { type: Date, default: Date.now }
}
// Indexes: userId + isActive, userId + name
```

### 3. Invoice Model
```javascript
// models/Invoice.js
{
  _id: ObjectId,
  invoiceNumber: { type: String, required: true },   // e.g. "INV-2024-001"
  userId: { type: ObjectId, ref: 'User', required: true, index: true },
  teamId: { type: ObjectId, ref: 'Team' },
  clientId: { type: ObjectId, ref: 'Client', required: true },

  status: {
    type: String,
    enum: ['draft','sent','viewed','paid','overdue','cancelled'],
    default: 'draft',
    index: true
  },

  issueDate: { type: Date, required: true },
  dueDate: { type: Date, required: true },

  items: [{
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    rate: { type: Number, required: true },
    amount: Number,                         // quantity * rate (computed)
    hsnCode: String,                        // GST HSN/SAC code
    gstRate: { type: Number, default: 18 }  // 0, 5, 12, 18, 28
  }],

  // Totals
  subtotal: Number,
  discountType: { type: String, enum: ['percent','flat'], default: 'percent' },
  discountValue: { type: Number, default: 0 },
  discountAmount: Number,
  cgst: Number,
  sgst: Number,
  igst: Number,
  isInterState: { type: Boolean, default: false },
  total: Number,
  amountPaid: { type: Number, default: 0 },
  balanceDue: Number,

  // GST
  isGstInvoice: { type: Boolean, default: true },
  placeOfSupply: String,

  notes: String,
  termsConditions: String,
  signature: String,           // base64 or URL

  // UPI
  upiId: String,
  showUpiQr: { type: Boolean, default: true },

  // PDF
  pdfUrl: String,
  pdfGeneratedAt: Date,

  // Tracking
  sentAt: Date,
  viewedAt: Date,
  paidAt: Date,

  // Reminders
  remindersSent: [{ sentAt: Date, type: String, message: String }],

  createdAt: { type: Date, default: Date.now },
  updatedAt: Date
}
// Indexes: userId+status, userId+clientId, invoiceNumber+userId (unique)
```

### 4. Expense Model
```javascript
// models/Expense.js
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true, index: true },
  teamId: { type: ObjectId, ref: 'Team' },

  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: {
    type: String,
    enum: ['software','hardware','marketing','travel','food','office','freelancer','tax','other'],
    required: true
  },
  date: { type: Date, required: true, index: true },
  description: String,
  receiptUrl: String,        // Cloudinary URL
  isGstExpense: { type: Boolean, default: false },
  gstAmount: Number,
  vendor: String,
  paymentMethod: { type: String, enum: ['cash','upi','card','bank','other'] },

  createdAt: { type: Date, default: Date.now }
}
```

### 5. Payment Model
```javascript
// models/Payment.js
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true },
  invoiceId: { type: ObjectId, ref: 'Invoice', required: true, index: true },
  clientId: { type: ObjectId, ref: 'Client', required: true },

  amount: { type: Number, required: true },
  method: { type: String, enum: ['upi','bank','cash','razorpay','cheque','other'] },
  transactionId: String,
  paidAt: { type: Date, required: true },
  notes: String,

  createdAt: { type: Date, default: Date.now }
}
```

### 6. Proposal Model
```javascript
// models/Proposal.js
{
  _id: ObjectId,
  userId: { type: ObjectId, ref: 'User', required: true, index: true },
  clientId: { type: ObjectId, ref: 'Client' },

  title: { type: String, required: true },
  projectType: String,
  content: String,             // AI-generated or edited HTML/Markdown
  status: { type: String, enum: ['draft','sent','accepted','rejected'], default: 'draft' },

  validUntil: Date,
  totalAmount: Number,
  currency: { type: String, default: 'INR' },

  sentAt: Date,
  viewedAt: Date,
  respondedAt: Date,

  aiGenerated: { type: Boolean, default: false },
  aiPrompt: String,

  createdAt: { type: Date, default: Date.now }
}
```

### 7. Team Model
```javascript
// models/Team.js
{
  _id: ObjectId,
  name: { type: String, required: true },
  ownerId: { type: ObjectId, ref: 'User', required: true },
  members: [{
    userId: { type: ObjectId, ref: 'User' },
    role: { type: String, enum: ['admin','member'] },
    joinedAt: Date,
    inviteEmail: String,
    status: { type: String, enum: ['pending','active'], default: 'pending' }
  }],
  createdAt: { type: Date, default: Date.now }
}
```

### 8. ActivityLog Model
```javascript
// models/ActivityLog.js
{
  _id: ObjectId,
  teamId: { type: ObjectId, ref: 'Team', index: true },
  userId: { type: ObjectId, ref: 'User' },
  action: String,              // e.g. "Created Invoice INV-001"
  entity: String,              // 'invoice', 'client', 'expense'
  entityId: ObjectId,
  metadata: Object,
  createdAt: { type: Date, default: Date.now }
}
```

---

## 🔐 SECURITY SYSTEM — AUTH ARCHITECTURE

### Token Strategy
```
- Access Token:  JWT, 15 min expiry, stored in httpOnly cookie (accessToken)
- Refresh Token: JWT, 7 day expiry, stored in httpOnly cookie (refreshToken)
- Cookie flags:  httpOnly: true, secure: true (prod), sameSite: 'strict'
- NO localStorage, NO sessionStorage for tokens
```

### Auth Middleware
```javascript
// middleware/auth.js
// 1. Read accessToken from req.cookies
// 2. Verify JWT → get userId
// 3. If expired → check refreshToken cookie
// 4. If refresh valid → issue new accessToken, set new cookie
// 5. Attach req.user = { userId, plan, teamId, role }
// 6. All protected routes use this middleware
```

### Plan Guard Middleware
```javascript
// middleware/planGuard.js
// requirePlan('pro') → check req.user.plan includes 'pro' or 'agency'
// If not → 403 with { error: 'PLAN_UPGRADE_REQUIRED', requiredPlan: 'pro' }
```

---

## 📦 BACKEND FOLDER STRUCTURE
```
server/
├── config/
│   ├── db.js              (mongoose connect)
│   └── constants.js       (plan limits, GST rates)
├── controllers/
│   ├── auth.controller.js
│   ├── client.controller.js
│   ├── invoice.controller.js
│   ├── expense.controller.js
│   ├── payment.controller.js
│   ├── proposal.controller.js
│   ├── ai.controller.js
│   ├── report.controller.js
│   ├── gst.controller.js
│   ├── team.controller.js
│   └── settings.controller.js
├── middleware/
│   ├── auth.js
│   ├── planGuard.js
│   ├── validate.js        (express-validator wrapper)
│   └── rateLimit.js
├── models/                (all 8 models above)
├── routes/
│   ├── auth.routes.js
│   ├── client.routes.js
│   ├── invoice.routes.js
│   └── ... (one per controller)
├── services/
│   ├── pdf.service.js     (puppeteer PDF generation)
│   ├── email.service.js   (nodemailer / Resend)
│   ├── ai.service.js      (Claude/OpenAI API calls)
│   ├── razorpay.service.js
│   └── whatsapp.service.js (Twilio WhatsApp)
├── utils/
│   ├── apiResponse.js     (standard { success, data, error } wrapper)
│   ├── invoiceNumber.js   (generate unique invoice numbers)
│   └── gstCalculator.js
└── app.js
```

---

## ✅ STEP-BY-STEP BUILD INSTRUCTIONS

---

## STEP 1 — PROJECT SETUP & AUTH SYSTEM

### 1A. Backend Setup
**Instruction to AI:**
> Set up an Express.js server with the following: helmet, cors (allow frontend origin with credentials), cookie-parser, express-rate-limit (100 req/15min), mongoose connection to MongoDB Atlas, dotenv. Create a standard API response utility `{ success: true/false, data: {}, message: '', error: '' }`. Set up error handling middleware that catches all async errors.

### 1B. Auth Routes & Controllers
**Instruction to AI:**
> Build complete auth system with these endpoints. Use bcryptjs (saltRounds: 12) for passwords. Use jsonwebtoken for tokens. Send tokens ONLY via httpOnly cookies. Never return tokens in response body.

```
POST /api/auth/signup
  - Validate: email (unique), password (min 8, 1 upper, 1 number), businessName
  - Hash password, create User
  - Send verification email with token (expires 24h)
  - Return: user object (without password)

POST /api/auth/login
  - Validate email+password
  - Check isEmailVerified (if false, return specific error code)
  - Generate accessToken (15min) + refreshToken (7 days)
  - Set both as httpOnly cookies
  - Return: { user: { _id, email, businessName, plan, role } }

POST /api/auth/logout
  - Clear both cookies (set maxAge: 0)

GET /api/auth/refresh
  - Read refreshToken cookie, verify, issue new accessToken cookie

GET /api/auth/verify-email/:token
  - Find user by emailVerifyToken where expires > now
  - Set isEmailVerified: true, clear token fields

POST /api/auth/forgot-password
  - Generate reset token, save hashed version to DB, expires 1h
  - Send reset email

POST /api/auth/reset-password/:token
  - Validate token, update password, clear all sessions

GET /api/auth/me   [Protected]
  - Return current user from req.user (populated from DB, no password)
```

### 1C. Frontend Auth Screens

**LOGIN SCREEN** (`/auth/login`)
```
Layout: Split screen — Left: dark gradient with product tagline + feature bullets
Right: Login form card

Form Fields:
- Email input with @ icon
- Password input with eye toggle
- "Remember me" checkbox
- "Forgot password?" link

Buttons:
- "Login" — full width gradient button
- "Don't have account? Sign Up" link

Validations (React Hook Form + Zod):
- Email: valid format
- Password: required, min 6

On Submit:
- POST /api/auth/login
- On success → check if onboardingComplete → route to /onboarding OR /app/dashboard
- On error → show toast (react-hot-toast) with message

Design: 
- Background: bg-[#0F0F1A]
- Card: bg-[#1A1A2E] rounded-2xl p-8 shadow-purple-glow
- Logo at top center with purple gradient text "InvoiceAI"
```

**SIGNUP SCREEN** (`/auth/signup`)
```
Fields: Full Name, Email, Password, Confirm Password
Same split layout as login
After submit → show "Check your email" confirmation screen
```

**FORGOT PASSWORD SCREEN** (`/auth/forgot-password`)
```
Single email field
On submit → success message shown inline
```

**ONBOARDING WIZARD** (`/onboarding`) — 4 Steps
```
Step 1: Business Type (Freelancer / Agency / Company) — card picker UI
Step 2: Business Info (businessName, phone, address, GST optional)
Step 3: Invoice Preferences (prefix, logo upload, default terms)
Step 4: "You're all set!" with confetti animation → go to dashboard

Progress bar at top, back/next buttons, skip option for step 3
Saves to PATCH /api/auth/onboarding on each step
```

---

## STEP 2 — CLIENT MANAGER

### 2A. Backend
**Instruction to AI:**
> Build CRUD for clients. All routes protected by auth middleware. Filter all queries by `userId: req.user.userId`. Use pagination (page, limit query params). Implement search by name/email/company using MongoDB `$regex` with index.

```
GET    /api/clients?page=1&limit=10&search=&tag=
POST   /api/clients
GET    /api/clients/:id         (with aggregate for stats)
PUT    /api/clients/:id
DELETE /api/clients/:id         (soft delete: isActive: false)

GET /api/clients/:id/stats  → Aggregate pipeline:
  - Match all invoices where clientId matches and userId matches
  - Group: totalInvoiced ($sum items total), totalPaid, totalPending
  - Count invoices by status
  - Most recent invoice date
```

**Aggregate for Client Stats:**
```javascript
// In client.controller.js — getClientStats
Invoice.aggregate([
  { $match: { clientId: new mongoose.Types.ObjectId(clientId), userId: req.user.userId } },
  { $group: {
    _id: '$status',
    count: { $sum: 1 },
    total: { $sum: '$total' }
  }},
  // Also get total paid via Payment model
])
```

### 2B. Frontend Screens

**CLIENT LIST** (`/app/clients`)
```
Layout: Main content area with sidebar

Top Bar:
- "Clients" heading + total count badge
- Search input (debounced 300ms, calls API)
- Filter by tag dropdown
- "+ Add Client" button (gradient)

Client Cards (grid 3 cols on desktop, 1 on mobile):
Each card shows:
- Avatar (initials circle, color based on name hash)
- Name + company
- Email + phone
- Total invoiced (INR formatted)
- Pending amount (amber badge if > 0)
- "View Profile" button

Empty State: Illustration + "Add your first client" CTA

Animations: staggered card entrance with framer-motion
```

**ADD/EDIT CLIENT FORM** (`/app/clients/new`, `/app/clients/:id/edit`)
```
Form Sections:
1. Basic Info: Name*, Email, Phone, Company
2. GST & Tax: GST Number, PAN (optional)
3. Address: Line1, Line2, City, State, Pincode
4. Notes: textarea
5. Tags: tag input (comma separated)

Validation via Zod schema
Auto-save draft every 30 seconds
Submit → POST /api/clients → toast success → redirect to client profile
```

**CLIENT PROFILE** (`/app/clients/:clientId`)
```
Header Section:
- Large avatar + name + company
- Stats row: Total Invoiced | Total Paid | Pending | Invoices Count
  (each as a stat card with icon, animated counter)

Tabs:
1. Invoices — list of all invoices for this client (filterable by status)
2. Payments — all payment records
3. Proposals — proposals sent to this client
4. Notes — editable notepad

Action Buttons:
- "New Invoice" (links to /app/invoices/new?clientId=xxx)
- "Send Reminder" (opens WhatsApp reminder modal)
- "Edit Client"
```

---

## STEP 3 — INVOICE BUILDER + PDF

### 3A. Backend

**Instruction to AI:**
> Build invoice CRUD with automatic invoice number generation (atomic increment on User.invoiceCounter), GST calculations, and Puppeteer-based PDF generation. PDF is generated server-side and stored URL returned.

```
GET    /api/invoices?status=&clientId=&page=&limit=
POST   /api/invoices           (creates draft)
GET    /api/invoices/:id       (populate client data)
PUT    /api/invoices/:id
DELETE /api/invoices/:id       (only drafts can be deleted)
POST   /api/invoices/:id/send  (change status to 'sent', trigger email+PDF)
POST   /api/invoices/:id/mark-paid
GET    /api/invoices/:id/pdf   (generate/return PDF URL)
POST   /api/invoices/:id/reminder  [Pro plan] (send WhatsApp/email reminder)
```

**GST Calculation Utility:**
```javascript
// utils/gstCalculator.js
// Input: items[], discountType, discountValue, isInterState, clientState, userState
// Output: { subtotal, discountAmount, taxableAmount, cgst, sgst, igst, total }
// Rules:
//   - If isInterState (different states): apply IGST = gstRate%
//   - If same state: split into CGST (half) + SGST (half)
//   - Apply discount before GST
```

**PDF Service:**
```javascript
// services/pdf.service.js
// Use Puppeteer to render a handlebars HTML template
// Template includes: logo, business info, client info, itemized table
// GST breakup table, UPI QR code (use qrcode npm package)
// Professional design matching app theme (but light theme for invoice)
// Save to /tmp, upload to Cloudinary, return URL
// Cache: if pdfGeneratedAt and no changes since → return existing URL
```

**Invoice Number Generation:**
```javascript
// utils/invoiceNumber.js
// Use findOneAndUpdate with $inc on User.invoiceCounter (atomic)
// Format: `${user.invoicePrefix}-${year}-${padded counter}`
// Example: INV-2024-0042
```

### 3B. Frontend — Invoice Builder

**INVOICE LIST** (`/app/invoices`)
```
Top section: 
- Status filter tabs: All | Draft | Sent | Paid | Overdue (with count badges)
- Date range picker
- Client filter dropdown  
- Search by invoice number
- "New Invoice" button

Stats Row (top of page):
- Total Invoiced this month
- Pending Amount (amber)
- Paid this month (green)
- Overdue count (red)

Invoice Table (desktop) / Cards (mobile):
Columns: Invoice # | Client | Date | Due Date | Amount | Status | Actions
Status badges: color-coded pill badges
Actions: View | Edit | Send | Download PDF | More (dropdown)

Overdue rows: subtle red left border
```

**INVOICE BUILDER** (`/app/invoices/new`, `/app/invoices/:id/edit`)
```
Two-column layout (60% form, 40% live preview):

LEFT SIDE — Form:
Section 1: Invoice Details
  - Invoice number (auto-generated, editable)
  - Issue date (date picker, default today)
  - Due date (date picker, +30 days default)
  - Client selector (searchable dropdown, "+ Add New Client" option)

Section 2: Line Items Table
  - Columns: Description | HSN/SAC | Qty | Rate | GST% | Amount
  - "Add Item" button — adds new row
  - Each row: delete icon on hover
  - Drag to reorder (react-beautiful-dnd)

Section 3: Totals & GST
  - Subtotal (computed)
  - Discount (toggle: percent or flat amount)
  - GST breakdown (CGST + SGST or IGST based on state)
  - Grand Total (large, prominent)

Section 4: Additional
  - Notes (textarea)
  - Terms & Conditions (textarea with default template)
  - Signature (upload or draw)
  - UPI ID + show QR toggle

Action Buttons:
  - Save Draft
  - Preview (scroll to right panel / modal on mobile)
  - Send to Client (triggers email + PDF generation)

RIGHT SIDE — Live PDF Preview:
  - Rendered invoice preview that updates as user types
  - "Download PDF" button
  - "Copy payment link" button
  - Share via WhatsApp button
```

**INVOICE DETAIL** (`/app/invoices/:invoiceId`)
```
Header: Invoice number + status badge + action buttons
  Actions: Edit | Send | Mark Paid | Send Reminder | Download | Delete

Preview section: full invoice PDF preview (iframe or rendered component)

Right sidebar:
  - Timeline: Created → Sent → Viewed → Paid (with dates)
  - Payment history (list of Payment records)
  - Reminders sent log
  - "Record Payment" button (modal: amount, method, date, txn ID)
```

---

## STEP 4 — PAYMENT TRACKER

### 4A. Backend
```
GET  /api/payments?invoiceId=&clientId=&page=
POST /api/payments           (record a payment)
  - On create: update Invoice.amountPaid, recalculate balanceDue
  - If balanceDue <= 0: set Invoice.status = 'paid', Invoice.paidAt = now
  - Update Client.totalPaid (denormalized)
DELETE /api/payments/:id     (reverse payment, update invoice)

GET /api/payments/summary    → Aggregate:
  - This month paid total
  - Last 6 months payment trend
  - Overdue invoices list (status='sent' AND dueDate < today)

Overdue Detection (cron job - node-cron):
  - Runs daily at 9 AM
  - Finds all invoices where status='sent' AND dueDate < today
  - Sets status='overdue'
  - Sends reminder email if no reminder in last 3 days
```

### 4B. Frontend — Payment Tracker

**PAYMENT TRACKER** (`/app/payments`)
```
Top Stats Row:
- Collected This Month (green)
- Pending (amber) — total of all sent invoices
- Overdue (red) — overdue invoice total
- Average Payment Time (days)

Three Column Layout:
Column 1 — "Pending": invoice cards awaiting payment
Column 2 — "Overdue": red bordered cards, days overdue badge
Column 3 — "Paid": recent payments

Each Invoice Card Shows:
- Client name + invoice number
- Amount + due date
- "Mark as Paid" button (opens modal)
- "Send Reminder" button:
  - Opens modal with pre-written message (AI-generated)
  - Options: WhatsApp | Email
  - Message is editable before sending

"Mark as Paid" Modal:
  - Amount (pre-filled)
  - Payment method (UPI/Bank/Cash/Card)
  - Transaction ID (optional)
  - Payment date
  - UPI QR Code display (if UPI ID set on invoice)
```

---

## STEP 5 — EXPENSE TRACKER

### 5A. Backend
```
GET    /api/expenses?category=&month=&year=&page=
POST   /api/expenses         (with receipt upload to Cloudinary)
PUT    /api/expenses/:id
DELETE /api/expenses/:id

GET /api/expenses/summary → Aggregate:
  - Total expenses this month
  - By category breakdown ($group by category)
  - Monthly trend (last 6 months)
  - Top expense categories
```

### 5B. Frontend

**EXPENSE LIST** (`/app/expenses`)
```
Top Stats: Total This Month | Top Category | GST Claimable | vs Last Month

Filter Bar: Category dropdown | Month picker | Search

Expense Table:
Columns: Date | Title | Category (icon+color badge) | Vendor | Amount | Receipt | Actions

Category Icons with Colors:
- Software: purple laptop icon
- Marketing: orange megaphone  
- Travel: blue airplane
- Food: green fork
- Hardware: gray chip
- etc.

"Add Expense" button → opens slide-over panel (not full page)

Expense Form (Slide-over):
  - Title, Amount, Category
  - Date, Vendor, Payment method
  - Description
  - Receipt upload (drag & drop, preview thumbnail)
  - Is GST expense toggle (if yes: show GST amount field)

Category Breakdown Chart:
  - Donut chart (Recharts) showing expense distribution
  - Sits in a card on right side of list
```

---

## STEP 6 — DASHBOARD

### 6A. Backend
```
GET /api/dashboard/stats  → Aggregate multiple collections:
  - This month revenue (paid invoices)
  - Pending invoices total + count
  - Overdue invoices total + count
  - This month expenses
  - Net profit (revenue - expenses)
  - Revenue trend (last 6 months) — use $dateToString aggregation
  - Top 3 clients by revenue this month
  - Recent activity (last 5 invoices + payments)
  - Invoice status distribution (for donut chart)
```

**Aggregation Pipeline Example:**
```javascript
// Monthly Revenue Trend
Invoice.aggregate([
  { $match: { 
    userId: req.user.userId, 
    status: 'paid',
    paidAt: { $gte: sixMonthsAgo }
  }},
  { $group: {
    _id: { $dateToString: { format: '%Y-%m', date: '$paidAt' }},
    revenue: { $sum: '$total' },
    count: { $sum: 1 }
  }},
  { $sort: { '_id': 1 }}
])
```

### 6B. Frontend — Dashboard

**DASHBOARD** (`/app/dashboard`)
```
Layout: Full-width content with top stats, then charts row, then activity feed

Greeting Bar (top):
"Good morning, [Name] 👋" + today's date
Quick action buttons: "+ Invoice" | "+ Expense" | "+ Client"

Stats Row (4 cards):
1. Revenue This Month — green, with up/down % vs last month
2. Pending Invoices — amber, count + total amount
3. Overdue — red, count + total (urgent CTA if > 0)
4. Net Profit — purple, revenue minus expenses

Charts Row (2 columns):
Left (65%): Revenue Trend — AreaChart (Recharts), last 6 months
  - Smooth gradient fill, purple to transparent
  - Tooltip with INR formatted values
Right (35%): Invoice Status — PieChart donut
  - Draft/Sent/Paid/Overdue with color coding

Bottom Row:
Left (60%): Recent Activity Feed
  - Each item: icon + action text + time ago
  - e.g. "💰 Payment received from Acme Corp — ₹25,000"
  - "📄 Invoice INV-042 sent to TechCo"
Right (40%): Top Clients
  - Mini leaderboard: rank + avatar + name + revenue this month
  - "View All Clients" link

All numbers animate up on first load (react-countup or framer-motion)
Charts animate in with slide-up
```

---

## STEP 7 — AI HUB

### 7A. Backend
**Instruction to AI:**
> Build AI feature controllers using Anthropic Claude API (claude-sonnet-4-20250514). All AI endpoints are rate-limited (free: 5/day, starter: 20/day, pro: unlimited). Use a system prompt that establishes Claude as an Indian business assistant.

```
POST /api/ai/payment-reminder    [Starter+]
  Body: { invoiceId, tone: 'polite'|'firm'|'urgent' }
  → Fetch invoice+client data → Generate WhatsApp/email message
  → Return: { message, subject }

POST /api/ai/proposal-writer     [Pro+]
  Body: { projectType, projectDescription, clientName, budget, timeline }
  → Generate full professional proposal in Markdown
  → Return: { title, content, sections }

POST /api/ai/tax-estimator       [Pro+]
  Body: { month, year }  (or use current)
  → Aggregate income for current quarter → Calculate advance tax liability
  → Return: { quarterlyIncome, taxableIncome, advanceTax, breakdown, tips }

POST /api/ai/business-insights   [Pro+]
  → Aggregate last 3 months data: top clients, revenue trend, expense trend
  → Generate 3-5 actionable insights
  → Return: { insights: [{ title, description, action }] }
  
POST /api/ai/invoice-writer      [Starter+]
  Body: { clientId, projectDescription }
  → Auto-generate invoice line items with descriptions, rates, HSN codes
  → Return: { items: [...] }
```

**AI Service Structure:**
```javascript
// services/ai.service.js
const Anthropic = require('@anthropic-ai/sdk');
const client = new Anthropic({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a smart business assistant for Indian freelancers and agencies. 
You understand GST, UPI, Indian business culture, and communication styles.
Always respond in professional yet friendly Indian English.
Format currency as ₹ (INR). Use Indian number formatting (lakhs, crores).`;

async function generateCompletion(userPrompt, maxTokens = 1000) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: maxTokens,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }]
  });
  return response.content[0].text;
}
```

### 7B. Frontend — AI Hub

**AI HUB** (`/app/ai-hub`)
```
Layout: Hero header + 4 tool cards in a 2x2 grid

Header:
"🤖 AI Hub — Your Secret Weapon"
Subtitle: "Save hours every week with intelligent automation"
Plan badge if locked features

Tool Cards (each card):
Background: gradient from purple to teal
Icon, title, description, "Try Now" button

1. AI Payment Reminder Card:
   Click → opens modal:
   - Select invoice (dropdown)
   - Tone selector (3 buttons: Polite / Firm / Urgent)
   - "Generate" button → loading skeleton → shows generated message
   - Edit textarea (user can tweak)
   - Send via: WhatsApp button | Copy button | Email button

2. AI Proposal Writer Card:
   Click → opens full-page modal / slide panel:
   - Project type (dropdown: Web Design, App Dev, Logo, SEO, etc.)
   - Project description (textarea)
   - Client name, budget range, timeline
   - "Write Proposal" → streams response (animated typing effect)
   - Preview in markdown renderer
   - "Save as Proposal" button → saves to /proposals
   - "Download PDF" button

3. AI Tax Estimator Card:
   Click → opens modal:
   - Shows current quarter income (fetched automatically)
   - Estimated advance tax with breakdown
   - Tips for tax saving
   - "Export for CA" button

4. AI Business Insights Card:
   Automatically loads insights on page open
   Shows 3-5 insight cards with:
   - Icon + headline
   - Description
   - Action button ("View clients", "Create invoice", etc.)

AI Usage Counter (bottom of page):
Shows daily usage for current plan
Progress bar: 3/5 used (free) | 12/20 used (starter) | Unlimited (pro)
```

---

## STEP 8 — REPORTS & ANALYTICS

### 8A. Backend
```
GET /api/reports/income?year=&month=   → Monthly income breakdown
GET /api/reports/expenses?year=        → Expense analytics
GET /api/reports/profit-loss?year=     → P&L statement
GET /api/reports/clients?year=         → Client-wise revenue
GET /api/reports/export?type=income&format=pdf  [Pro+]
  → Generate PDF report using Puppeteer
```

**Key Aggregate Pipelines:**
```javascript
// Profit & Loss — joins Income and Expenses
// Use $facet to run parallel aggregations:
Invoice.aggregate([
  { $facet: {
    monthlyRevenue: [ ...revenueStages ],
    topClients: [ ...topClientStages ],
    invoiceStats: [ ...statusStages ]
  }}
])

// Client-wise Revenue with Lookup:
Invoice.aggregate([
  { $match: { userId, status: 'paid', createdAt: { $gte: startDate } }},
  { $group: { _id: '$clientId', revenue: { $sum: '$total' }, count: { $sum: 1 }}},
  { $lookup: { from: 'clients', localField: '_id', foreignField: '_id', as: 'client' }},
  { $unwind: '$client' },
  { $sort: { revenue: -1 }},
  { $limit: 10 }
])
```

### 8B. Frontend

**REPORTS** (`/app/reports`)
```
Year Selector at top (default current year)

Section 1: Income Overview
- Bar chart: monthly revenue (Recharts BarChart)
- Line chart overlay: expense trend
- Toggle between chart types

Section 2: Profit & Loss Table
- Monthly table: Revenue | Expenses | Net Profit | Margin%
- Positive margin: green, Negative: red
- Year total row at bottom

Section 3: Client Revenue
- Horizontal bar chart (top 10 clients)
- Each bar: client name + total revenue + % of total

Section 4: Invoice Analytics
- Donut: paid vs pending vs overdue
- Average days to payment
- Fastest paying clients

Export Buttons (Pro):
- "Export PDF Report"
- "Export Excel / CSV"  
- "Export for CA (Tally format)"
```

---

## STEP 9 — GST & TAX MODULE

### 9A. Backend
```
GET  /api/gst/invoices?month=&year=     → GST-tagged invoices for period
GET  /api/gst/summary?quarter=&year=    → GSTR-1 style summary
GET  /api/gst/export?format=json        → Export for Zoho/Tally
POST /api/gst/invoice/:invoiceId/generate  → Create GST-compliant PDF
```

**GST Summary Aggregate:**
```javascript
Invoice.aggregate([
  { $match: { userId, isGstInvoice: true, status: 'paid',
    issueDate: { $gte: quarterStart, $lte: quarterEnd }}},
  { $group: {
    _id: { gstRate: { $arrayElemAt: ['$items.gstRate', 0] }},
    taxableValue: { $sum: '$subtotal' },
    cgst: { $sum: '$cgst' },
    sgst: { $sum: '$sgst' },
    igst: { $sum: '$igst' },
    count: { $sum: 1 }
  }}
])
```

### 9B. Frontend

**GST & TAX** (`/app/gst`)
```
Quarter selector at top (Q1 Apr-Jun | Q2 Jul-Sep | Q3 Oct-Dec | Q4 Jan-Mar)

GST Summary Cards:
- Total Taxable Value
- Total CGST | Total SGST | Total IGST
- Total GST Collected

GST Invoice List:
- Table with GST-specific columns: Invoice # | Client GSTIN | Taxable | CGST | SGST | IGST | Total
- Filter: B2B (client has GST) / B2C

Tax Estimate Section:
- Current quarter income
- Estimated advance tax (15% / 45% / 75% / 100% slabs)
- "Pay via Challan" link (external)

Export Options:
- GSTR-1 JSON (for GST portal)
- Excel export
- "Share with CA" (generates a secure link)
```

---

## STEP 10 — SETTINGS

### 10A. Backend
```
GET  /api/settings/profile         → return User (no password)
PUT  /api/settings/profile         → update name, phone, address
PUT  /api/settings/business        → GST, PAN, businessType
PUT  /api/settings/branding        → logo upload (Cloudinary), colors, invoice template
PUT  /api/settings/invoice         → prefix, terms, notes defaults
GET  /api/settings/billing         → Razorpay subscription info
POST /api/settings/billing/upgrade → Create Razorpay subscription order
POST /api/settings/billing/cancel  → Cancel subscription
PUT  /api/settings/password        → change password (verify current first)
```

### 10B. Frontend

**SETTINGS** (`/app/settings/*`)
```
Left sidebar: settings nav (Profile | Business | Branding | Invoice | Billing | Security)

PROFILE TAB:
- Avatar upload (circle, drag & drop)
- Name, email (email change requires re-verify)
- Phone, timezone

BUSINESS TAB:
- Business name, type
- GST number (format validation: 15 chars)
- PAN, address

BRANDING TAB:
- Logo upload with preview
- Brand color picker
- Invoice template selector (3 designs: Classic | Modern | Minimal)
- Live invoice preview on right side

BILLING TAB:
Current plan badge + features list
Plan comparison table:
┌─────────┬──────────┬─────────┬──────────┐
│ Feature │ Free     │ Starter │ Pro      │
│         │ ₹0       │ ₹299/mo │ ₹699/mo  │
├─────────┼──────────┼─────────┼──────────┤
│Invoices │ 3/month  │ Unlimited│ Unlimited│
│AI Tools │ ✗        │ Basic   │ Full     │
│Team     │ ✗        │ ✗       │ 5 members│
└─────────┴──────────┴─────────┴──────────┘
Upgrade button → Razorpay checkout
```

---

## STEP 11 — TEAM MODULE (Pro/Agency Plan)

### 11A. Backend
```
POST /api/team/invite        → Send invite email with token
GET  /api/team/members       → List all members
PUT  /api/team/members/:id/role  → Change admin/member
DELETE /api/team/members/:id → Remove member
GET  /api/team/activity      → Paginated activity log

Invite Flow:
- Generate invite token, save to Team.members with status='pending'
- Send email with /accept-invite/:token link
- On accept: create/link User account, set teamId, set status='active'

All team queries filter by teamId (users in same team share data)
Activity logged automatically via mongoose post-save hooks
```

### 11B. Frontend

**TEAM** (`/app/team`)
```
Members Tab:
- Member cards: avatar + name + email + role badge + last active
- Role badge: Owner (purple) | Admin (blue) | Member (gray)
- Actions: Change Role | Remove (confirmation modal)
- "Invite Member" button → modal with email input + role select + send

Activity Log Tab:
- Timeline feed of all team actions
- Each entry: member avatar + action text + time
- Filter by member, by action type
- Infinite scroll (cursor-based pagination)
```

---

## STEP 12 — SUBSCRIPTION BILLING (Razorpay)

### 12A. Backend
```
POST /api/billing/create-subscription
  - Create Razorpay customer if not exists
  - Create subscription for plan (plan_id from Razorpay dashboard)
  - Return subscription_id + key for frontend

POST /api/billing/webhook   (public, no auth)
  - Verify Razorpay webhook signature (x-razorpay-signature header)
  - Handle: subscription.activated → update User.plan + planExpiresAt
  - Handle: subscription.cancelled → set plan back to free
  - Handle: payment.failed → send email alert

GET /api/billing/status     → Return current subscription details
```

### 12B. Frontend
```
Upgrade flow:
1. User clicks "Upgrade to Pro"
2. POST /api/billing/create-subscription → get Razorpay order
3. Open Razorpay checkout (Razorpay.js)
4. On payment success → show confetti + success modal
5. Plan updates automatically via webhook
```

---

## 📱 SIDEBAR NAVIGATION COMPONENT

```jsx
// Applies to all /app/* routes
// Fixed left sidebar, 256px wide

Nav Items (with Lucide icons):
- 🏠 Dashboard        → /app/dashboard
- 👥 Clients          → /app/clients  
- 📄 Invoices         → /app/invoices
- 💸 Expenses         → /app/expenses
- 💰 Payments         → /app/payments
- 📋 Proposals        → /app/proposals
- 🤖 AI Hub           → /app/ai-hub       (Pro badge if locked)
- 📊 Reports          → /app/reports      (Pro badge if locked)
- 🧾 GST & Tax        → /app/gst
- 👨‍💼 Team            → /app/team         (Pro badge if locked)
- ⚙️ Settings         → /app/settings

Bottom of sidebar:
- User avatar + name + plan badge
- Upgrade button (if free/starter)
- Logout button

Active state: Left purple border + bg highlight + text white
Hover: subtle purple background
```

---

## 🔔 NOTIFICATION SYSTEM

```
Toast notifications (react-hot-toast):
- Success: green check, 3s
- Error: red X, 5s
- Loading: spinner (for AI generation, PDF)

In-app notifications bell (top right):
- Invoice viewed by client
- Payment received
- Overdue invoice alert
- Team member activity

Badge count on bell icon
Dropdown with notification list
Mark all as read
```

---

## 🌐 API STANDARD RESPONSE FORMAT

```javascript
// All endpoints return this format:
{
  success: true,
  data: { ... },
  message: "Operation successful",
  pagination: {        // only for list endpoints
    page: 1,
    limit: 10,
    total: 100,
    totalPages: 10
  }
}

// Errors:
{
  success: false,
  error: "VALIDATION_ERROR" | "NOT_FOUND" | "UNAUTHORIZED" | "PLAN_REQUIRED",
  message: "Human readable message",
  details: [...]       // validation errors array
}
```

---

## 🚀 ENVIRONMENT VARIABLES

```env
# Server
NODE_ENV=production
PORT=5000
CLIENT_URL=https://yourdomain.com

# Database
MONGODB_URI=mongodb+srv://...

# JWT
JWT_ACCESS_SECRET=your_super_secret_access_key_here
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Cookies
COOKIE_SECURE=true    # false in dev
COOKIE_DOMAIN=yourdomain.com

# Email (Resend)
RESEND_API_KEY=re_...

# AI
ANTHROPIC_API_KEY=sk-ant-...

# File Upload
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Payments
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

---

## 📋 FINAL CHECKLIST FOR AI BEFORE EACH STEP

Before writing any code, confirm:
- [ ] Am I filtering every DB query by `userId` or `teamId`?
- [ ] Am I using `httpOnly` cookies, not localStorage?
- [ ] Are all routes using the `auth` middleware?
- [ ] Am I validating all inputs (express-validator or Zod)?
- [ ] Are plan-gated features using `planGuard` middleware?
- [ ] Are MongoDB indexes defined for all filtered fields?
- [ ] Are aggregations using proper `$match` with ObjectId cast?
- [ ] Is the API response using the standard format?
- [ ] Is sensitive data (passwords, tokens) excluded from responses?

---

*End of Master Build Prompt — InvoiceAI SaaS*
*Total Screens: 25+ | Total API Endpoints: 60+ | Models: 8*
