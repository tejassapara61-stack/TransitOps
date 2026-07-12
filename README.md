<div align="center">
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License" />
  <h1>🚀 CoreNexa: Autonomous AI Recruitment Engine</h1>
  <p><strong>The future of zero-touch, AI-driven hiring.</strong></p>
  
  <p>
    CoreNexa is an advanced, multi-agent SaaS architecture built to automate the entire top-of-funnel hiring process. By orchestrating LLMs, web scrapers, and database engines, it strictly evaluates candidate profiles against specific job roles without human intervention.
  </p>
</div>

---

## ⚡ Key Outcomes & Metrics
- **Time Saved:** Reduced manual resume screening and sourcing time by **85%**.
- **High Throughput:** Evaluates and scores **500+ candidate bios per minute**.
- **Zero-Touch:** Completely eliminates initial manual scheduling and candidate matching touchpoints.

## 🛠️ Stack & Technologies
<p align="center">
  <img src="https://img.shields.io/badge/n8n-Workflow_Orchestration-ea4b3d?style=for-the-badge&logo=n8n" alt="n8n" />
  <img src="https://img.shields.io/badge/Groq%20LLaMA_3-Agentic_AI-000000?style=for-the-badge&logo=meta" alt="Groq LLaMA" />
  <img src="https://img.shields.io/badge/Apify-Web_Scraping-3f51b5?style=for-the-badge" alt="Apify" />
  <img src="https://img.shields.io/badge/Airtable-Database_%26_ATS-fced22?style=for-the-badge&logo=airtable" alt="Airtable" />
  <img src="https://img.shields.io/badge/React-FrontendUI-61DAFB?style=for-the-badge&logo=react" alt="React" />
</p>

## 🧠 System Architecture

The core logic is driven by a highly complex **n8n workflow** comprising autonomous agents:
1. **Trigger & Ingestion:** System receives target Job Description (JD) and required candidate parameters via Webhook.
2. **Autonomous Sourcing:** Integrates with Apify to execute targeted Google Search queries (`site:linkedin.com/in/`) to scrape relevant professional profiles based on the JD.
3. **Agentic Evaluation:** A specialized Groq LLaMA 3 Agent evaluates the scraped candidate data against the strict parameters of the Job Role.
4. **Data Standardization & Storage:** Processed, scored, and categorized candidate profiles are automatically piped into an Airtable ATS for final review.
5. **Notification Loop:** The system responds back via Webhook confirming the batch processing status.

## 📂 Repository Contents
- **`src/`** - Frontend application built with React and Vite. Contains dashboards, candidate portals, and integration logic.
- **`dataconnect/`** - Firebase DataConnect schemas and backend configurations.
- **`workflows/`** - Exportable `.json` n8n workflow blueprints.
- **`docs/`** - Additional deployment and architecture documentation.

## 🚀 Quick Start (Frontend)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up environment variables (`.env`):
   ```env
   VITE_FIREBASE_API_KEY=your_key
   VITE_AIRTABLE_TOKEN=your_token
   # Add other required keys
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

---
<p align="center">
  <em>Engineered by <strong>Tejass Sapara</strong> — AI Architect & Autonomous Agent Developer.</em>
</p>
