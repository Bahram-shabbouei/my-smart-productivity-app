# My Smart Productivity App

This is an AI-powered productivity assistant built with Azure serverless technologies. This project is part of my final project for the "Web Development & Cloud Computing" course at Techstarter.

## Project Overview

This application is a serverless web app that provides task and note management with integrated AI features.

### Core Technologies

- **Frontend:** React 18 (Create React App)
- **Backend:** Azure Functions (Node.js v4 code-first via `@azure/functions`)
- **Local Orchestration:** Azure Static Web Apps CLI (proxies SPA and API)
- **Deployment:** GitHub Actions (Azure Static Web Apps)

## Local Development

Prerequisites: Node.js >= 18 (SWA CLI pulls Functions Core Tools automatically).

1. Install dependencies and run:

   ```powershell
   npm install
   npm run install:all
   npm run dev
   ```
