# 🚀 BuilderGraph

> **The Decentralized Reputation Protocol for Developers**  
> *Verify your skills, own your data, and get hired based on code—not claims.*

![BuilderGraph Banner](./banner.png)

## 📜 Table of Contents
- [Problem Statement](#-problem-statement)
- [The Solution](#-the-solution)
- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Installation & Setup](#-installation--setup)
- [How It Works](#-how-it-works)

---

## 🚨 Problem Statement

The tech hiring landscape is broken:

| Problem | Impact |
|---------|--------|
| 📄 **Resume Fraud** | 59% of hiring managers report encountering AI-enhanced/fabricated resumes |
| 🔒 **Platform Lock-in** | Your reputation lives on LinkedIn, GitHub—but you don't own it |
| 🎭 **Subjective Hiring** | Decisions based on buzzwords, not actual code quality |
| ❓ **Verification Gap** | No cryptographic proof of your contributions |
| 💰 **High Costs** | $50+ per background check, taking days to verify |

> By 2028, Gartner predicts **1 in 4 candidates will be "fake"** (AI-generated profiles)

---

## 💡 The Solution

**BuilderGraph** is a decentralized platform that builds a verifiable "Knowledge Graph" of a developer's career.

*   **Profiles as Assets**: Your profile is a public asset on the **OriginTrail Decentralized Knowledge Graph (DKG)**, identified by a unique **UAL** (Uniform Asset Locator).
*   **Proof of Work**: Projects are imported via **GitHub OAuth**, verified, and minted as assets linked to your profile.
*   **AI-Powered Reputation**: An autonomous **AI Agent** analyzes your actual code (commits, quality, file structure) to generate an unbiased **Reputation Score**.
*   **Monetized Access**: Recruiters can view verified scores for free but pay a small fee (in tokens) to access contact details, creating a sustainable ecosystem.

---

## 🏗 System Architecture

We utilize a hybrid architecture combining the speed of Web2 with the trust of Web3.

![BuilderGraph Banner](https://via.placeholder.com/1200x400?text=BuilderGraph+Decentralized+Reputation)

---

## 🌟 Key Features

### 1. **Decentralized Profiles (The "Asset")**
Every user profile is minted as a **Knowledge Asset** on the DKG. It has a permanent, verifiable ID (UAL) that you own. No one can de-platform your reputation.

### 2. **Verified Project Portfolio**
Projects are not just text entries. We use **GitHub OAuth** to verify ownership. Each project becomes a sub-asset linked to your main Profile UAL, creating a graph of your work.

### 3. **AI Reputation Agent** 🤖
Our autonomous agent analyzes your code like a senior engineer would—not a keyword scanner.

#### 📊 The 7-Factor Analysis

| Factor | Weight | What It Measures |
|--------|--------|------------------|
| **Commit Frequency** | 15% | Consistency and activity patterns |
| **Code Quality** | 25% | Adherence to best practices, linting |
| **Endorsements** | 20% | Peer validations (weighted by their score) |
| **Repository Health** | 15% | Tests, CI/CD, issue management |
| **Documentation** | 10% | README quality, inline comments |
| **File Structure** | 10% | Architecture maturity, organization |
| **Key Files** | 5% | Presence of configs, tests, docs |

**Final Score:** `0-100` (Updated automatically when you push new code)

### 4. **Recruiter Dashboard**
A dedicated interface for hiring managers to:
*   Search for developers by **verified skills**.
*   View the **AI Reputation Score**.
*   Pay a micro-transaction (X402) to reveal contact info (Email/Socials).

---

## 🛠 Tech Stack

### **Frontend**
*   **Framework**: React 18
*   **Language**: TypeScript
*   **Styling**: TailwindCSS
*   **Build Tool**: Vite

### **Backend**
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: SQLite3 (for caching and indexing)
*   **Authentication**: Passport.js (GitHub Strategy)

### **AI & Data**
*   **LLM Engine**: Groq (Llama 3 70B)
*   **Orchestration**: LangChain
*   **Protocol**: OriginTrail DKG (Decentralized Knowledge Graph)
*   **Node**: Running locally on port 8600

---

## 🚀 Installation & Setup

Follow these steps to run the complete BuilderGraph ecosystem locally.

### Prerequisites
*   Node.js v18+
*   Git
*   A running OriginTrail DKG Node (listening on port 8600)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/BuilderGraph.git
cd BuilderGraph
```

### 2. Backend Setup
```bash
###############################################
# 🔧 BuilderGraph Backend - Environment File  #
# Copy this file to `.env` and fill the values #
###############################################

########################
# 🌐 Server Settings
########################

# Port where the backend server will run
PORT=3002

# Environment: development | production
NODE_ENV=development


########################
# 🗄 Database
########################

# SQLite database file path
DATABASE_PATH=./database/buildergraph.db


########################
# 🧠 DKG Node Settings
########################

# Public endpoint of the OriginTrail Decentralized Knowledge Graph Node
DKG_NODE_ENDPOINT=https://v6-pegasus-node-02.origin-trail.network

# DKG node port (default: 8900)
DKG_NODE_PORT=8900

# DKG blockchain configuration — otp:20430 is the testnet chain ID for OriginTrail
DKG_BLOCKCHAIN=otp:20430

# Network environment for publishing assets: testnet | mainnet
DKG_ENVIRONMENT=testnet


########################
# 🔑 Wallet Configuration
########################
# ⚠ REQUIRED for publishing assets to the DKG
# Get testnet tokens here → https://faucet.origintrail.io/

# Your public wallet address (0x...)
PUBLIC_KEY=

# Your private key (⚠ keep secret; never commit real keys)
PRIVATE_KEY=


########################
# 🔁 Frontend CORS
########################

# URL of your React/Vite frontend
FRONTEND_URL=http://localhost:5173


########################
# 🔍 DKG Explorer
########################

# Used to generate explorer links for minted assets
DKG_EXPLORER_BASE=https://dkg-testnet.origintrail.io


########################
# 🧩 GitHub OAuth Settings
########################

# GitHub OAuth App Client ID
GITHUB_CLIENT_ID=

# GitHub OAuth App Client Secret
GITHUB_CLIENT_SECRET=

# GitHub OAuth callback route (must match GitHub app settings)
GITHUB_CALLBACK_URL=http://localhost:3002/api/auth/github/callback


########################
# 🔐 Session Configuration
########################

# Secret used for cookie/session encryption
SESSION_SECRET=buildergraph-secret-change-in-production

```

### 3. Frontend Setup
```bash
cd ../buildergraph

# Install dependencies
npm install

# Start the Development Server
npm run dev
```

### 4. Running the DKG Node
Ensure your local OT-Node is running.
```bash
# Example command (depends on your specific node setup)
docker run -p 8900:8900 -p 9000:9000 origintrail/ot-node:latest
```

---

## 📝 How It Works

![BuilderGraph Architecture](../Architecture.webp)
<!-- ![BuilderGraph Architecture](../problem.jpg) -->

### 🎯 Complete User Journey

#### **For Developers: Building Your Reputation**
```
Step 1: Connect GitHub Account
├── Click "Connect with GitHub"
├── OAuth authorization (read-only access)
├── No access to private code, only metadata
└── ✅ Secure authentication completed

Step 2: Profile Creation on DKG
├── System generates your unique profile asset
├── Structure: Person schema (name, avatar, bio)
├── Published to OriginTrail DKG Network
├── Assigned permanent UAL: did:dkg:otp/0x123...abc
└── ✅ Your decentralized identity is live!

Step 3: Import Projects
├── View all your public repositories
├── Select projects to showcase (multi-select)
├── Each repo verified via GitHub API
├── Ownership timestamp recorded
└── ✅ Projects linked to your profile UAL

Step 4: AI Analysis Engine
├── Agent clones repository metadata
├── Analyzes 7 key factors:
│   ├── Commit frequency & patterns
│   ├── Code quality (linting, complexity)
│   ├── Repository health (tests, CI/CD)
│   ├── Documentation quality
│   ├── File structure maturity
│   ├── Key files presence
│   └── Peer endorsements weight
├── Generates score: 0-100
├── Creates detailed breakdown report
└── ✅ Reputation score calculated in 30-60 seconds

Step 5: Publishing to DKG
├── Score published as separate asset
├── Project asset created with metadata
├── All assets linked via UAL references
├── Immutable record on blockchain
└── ✅ Everything verifiable on DKG Explorer

Step 6: Ongoing Updates
├── Add more projects anytime
├── Request re-analysis (weekly limit)
├── Receive endorsements from peers
├── Score updates automatically
└── ✅ Living, breathing reputation graph
```

---

#### **For Recruiters: Finding Verified Talent**
```
Step 1: Browse Dashboard
├── Access recruiter interface (/recruiter)
├── View aggregated developer profiles
├── See reputation scores at a glance
└── ✅ No signup required for browsing

Step 2: Filter & Search
├── Filter by tech stack (React, Rust, etc.)
├── Set minimum reputation score threshold
├── Sort by: Score | Recent Activity | Endorsements
├── Location/timezone filters (optional)
└── ✅ Find candidates matching your criteria

Step 3: Deep Dive Analysis
├── Click on developer profile
├── View detailed metrics breakdown:
│   ├── Overall reputation score
│   ├── Top projects with scores
│   ├── Code quality indicators
│   ├── Consistency metrics
│   └── Peer endorsements
├── Verify on DKG Explorer (click UAL)
└── ✅ All data cryptographically verifiable

Step 4: Unlock Contact (X402 Payment)
├── Click "Request Contact Info"
├── Pay micro-fee: 0.001 TRAC (~$0.10)
├── Transaction processed via X402 protocol
├── Developer receives 80% of payment
├── Instantly receive:
│   ├── Email address
│   ├── GitHub handle (clickable)
│   ├── LinkedIn (if added)
│   └── Portfolio website
└── ✅ Direct connection established

Step 5: Reach Out
├── Contact developer via email
├── Reference their UAL in message
├── Schedule interview if interested
└── ✅ Transparent, fraud-proof hiring
```

---


---

> Built with ❤️ for the **OriginTrail Hackathon**
