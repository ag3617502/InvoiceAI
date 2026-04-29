# InvoiceAI SaaS Platform

Welcome to the **InvoiceAI SaaS Platform**! This repository is optimized for managing clients, generating intelligent automated invoices, tracking project lifecycle pipelines, and using generative AI workflows for optimal business tracking.

## 🚀 Getting Started

To spin up the local development suite, make sure you configure variables properly.

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** running locally (`mongodb://localhost:27017/invoiceai`)

### 2. Setting Up Environment Variables
We have defined `.env` configurations inside this scope. 

#### Back-end Configuration
1. Navigate to `/server`.
2. Create a `.env` file based on the structure highlighted in `server/test.env`.
3. Fill in your corresponding Gemini/Groq API authorization endpoints.

#### Front-end Configuration
1. Navigate to `/client`.
2. Create a `.env` file referencing the parameters detailed in `client/test.env`.

### 3. Installation & Booting

#### Server / Back-End
```bash
cd server
npm install
npm run dev
```

#### Client / Front-End
```bash
cd client
npm install
npm run dev
```

---

## 💡 What is Important? (Crucial Guidelines)

1. **Strict Client-Project Bindings**: Always create proper client associations before drafting invoices or mapping proposed milestones.
2. **Cross-Origin Configuration (CORS)**: If the front-end ports are swapped, reflect the proper route address mappings via the `.env` endpoints.
