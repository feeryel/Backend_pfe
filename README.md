# 🛠️ Repair Management System — Backend

A **Node.js / Express backend** powering a complete Repair Management System for repair workshops.

The backend provides REST APIs for customers, devices, repairs, repair requests, planning, invoices, spare parts, users, and repair lines.

It also integrates **JWT authentication**, **n8n workflow automation**, automated customer notifications through **Email and WhatsApp**, and an AI integration layer through a dedicated **MCP Server** powered by **Ollama**.

---

## ✨ Features

### 👥 Customer Management

- Create customers
- Retrieve customers
- Update customer information
- Delete customers
- Manage customer-related data

### 💻 Device Management

- Create and manage devices
- Associate devices with customers
- Store device information
- Track repair-related devices

### 🛠️ Repair Management

- Create repairs
- Retrieve repairs
- Update repair information
- Delete repairs
- Track repair status
- Assign technicians

### 📋 Repair Requests

- Create repair requests
- Manage repair requests
- Track repair symptoms
- Manage repair status
- Associate requests with devices

### 📅 Planning

- Create planning records
- Schedule repairs
- Manage dates
- Assign responsible users

### 🧾 Invoice Management

- Create invoices
- Manage invoice information
- Calculate invoice amounts
- Manage VAT and fiscal stamp
- Generate invoice documents

### 🔩 Spare Parts

- Create and manage spare parts
- Track stock
- Manage prices
- Associate parts with repairs

### 👤 Users

- User management
- Authentication
- Role management
- JWT authorization

### 🔧 Repair Lines

- Associate spare parts with repairs
- Manage quantities
- Manage unit prices
- Track repair components

---

# 🔐 Authentication & Authorization

The backend uses **JWT authentication** to protect application resources.

```text
User Login
    ↓
Authentication
    ↓
JWT Token
    ↓
Protected API Routes
    ↓
Authorized Operation
```

JWT tokens are used by the frontend and can also be provided to the MCP server when authenticated operations are required.

---

# ⚡ n8n Workflow Automation

One of the main features of the backend is its integration with **n8n** for event-driven workflow automation.

When a repair reaches the completed status, the backend can trigger an **n8n webhook**.

```text
Repair Status Updated
        ↓
Backend
        ↓
n8n Webhook
        ↓
Workflow Processing
        ↓
Check Repair Status
        ↓
Status = DONE
        ↓
Retrieve Customer Information
        ↓
┌──────────────────┬──────────────────┐
│                  │                  │
▼                  ▼                  │
📧 Email        💬 WhatsApp           │
Notification    Notification          │
│                  │                  │
└──────────────────┴──────────────────┘
                   ↓
             👤 Customer
                   ↓
          📱 Device Ready
```

This automation reduces manual communication and improves the customer experience by automatically notifying the customer when the repaired device is ready.

---

# 🎥 Automation Workflow Demo

The backend repository also contains a **demonstration video** showing the complete customer notification process.

The video presents the workflow from the moment the device is repaired until the customer receives the automated notification.

### 🔄 Complete Process

```text
Device Repaired
      ↓
Repair Status = DONE
      ↓
Backend Event
      ↓
n8n Webhook
      ↓
Automation Workflow
      ↓
┌─────────────────────┐
│ Email Notification  │
│         +           │
│ WhatsApp Message    │
└──────────┬──────────┘
           ↓
    👤 Customer
           ↓
 📱 Device Ready for Pickup
```

### 🎬 Demo Video

The demonstration video is available in the repository under:

```text
public/videos/
```

👉 **[🎥 Open the video assets](./public/videos/)**

The `n8n/` and `n8n-assets/` directories also contain the resources related to the automation workflow.

---

# 🤖 AI & MCP Integration

The backend can be accessed by a dedicated **Model Context Protocol (MCP) Server**.

The MCP server exposes structured tools allowing a local LLM powered by **Ollama** to interact with the backend REST API.

```text
                 ┌───────────────────┐
                 │   Ollama / LLM    │
                 │    Local Model    │
                 └─────────┬─────────┘
                           │
                           │ MCP
                           ▼
                 ┌───────────────────┐
                 │    MCP Server     │
                 │ Structured Tools  │
                 └─────────┬─────────┘
                           │
                           │ REST / HTTP
                           ▼
                 ┌───────────────────┐
                 │     Backend       │
                 │ Node.js / Express │
                 └─────────┬─────────┘
                           │
                           ▼
                    MySQL / MariaDB
```

This architecture allows AI assistants to interact with business operations without accessing the database directly.

```text
❌ AI → Database

✅ AI → MCP → REST API → Database
```

---

# 🧩 MCP Operations

The MCP server provides structured tools for the main backend resources.

### Clients

```text
getClients
createClient
getClient
updateClient
deleteClient
```

### Devices

```text
getAppareils
createAppareil
getAppareil
updateAppareil
deleteAppareil
```

### Repairs

```text
getReparations
createReparation
getReparation
updateReparation
deleteReparation
```

### Repair Requests

```text
getDemandes
createDemande
getDemande
updateDemande
deleteDemande
```

### Invoices

```text
getFactures
createFacture
getFacture
updateFacture
deleteFacture
```

### Spare Parts

```text
getPieces
createPiece
getPiece
updatePiece
deletePiece
```

### Planning

```text
getPlannings
createPlanning
getPlanning
updatePlanning
deletePlanning
```

### Users

```text
getUsers
createUser
getUser
updateUser
deleteUser
```

### Repair Lines

```text
getLignes
createLigne
getLigne
updateLigne
deleteLigne
```

---

# 🏗️ Architecture

The backend is the central layer connecting the frontend, database, automation workflows, and AI services.

```text
                         ┌─────────────────────┐
                         │   Angular Frontend  │
                         └──────────┬──────────┘
                                    │
                                    │ REST API
                                    ▼
                         ┌─────────────────────┐
                         │   Node.js / Express │
                         │       Backend       │
                         └───────┬─────┬───────┘
                                 │     │
                    ┌────────────┘     └─────────────┐
                    │                                │
                    ▼                                ▼
             ┌──────────────┐                 ┌─────────────┐
             │ MySQL /      │                 │     n8n     │
             │ MariaDB      │                 │ Automation  │
             └──────────────┘                 └──────┬──────┘
                                                     │
                                           ┌─────────┴─────────┐
                                           ▼                   ▼
                                      📧 Email            💬 WhatsApp


                         ┌─────────────────────┐
                         │   Ollama / Local AI │
                         └──────────┬──────────┘
                                    │
                                    │ MCP
                                    ▼
                             ┌────────────┐
                             │ MCP Server │
                             └─────┬──────┘
                                   │
                                   │ REST API
                                   ▼
                                Backend
```

---

# 🛠️ Technologies

### Backend

- **Node.js**
- **Express.js**
- **JavaScript**
- REST API
- Axios
- Sequelize

### Database

- **MySQL**
- **MariaDB**

### Authentication

- **JWT**
- Role-based authorization

### Automation

- **n8n**
- Webhooks
- HTTP Requests
- Email automation
- WhatsApp notifications

### AI

- **Ollama**
- **Model Context Protocol (MCP)**
- Local LLMs
- Structured AI tools

### Documents

- Puppeteer
- PDF generation
- QR Code generation

---

# 📂 Project Structure

```text
Backend_pfe/
│
├── controllers/
├── models/
├── routes/
├── middleware/
├── services/
│
├── n8n/
├── n8n-assets/
│
├── public/
│   └── videos/
│
├── config/
├── server.js
├── package.json
├── package-lock.json
└── README.md
```

The backend is organized into business modules.

The `n8n/` and `n8n-assets/` directories contain resources related to workflow automation.

The `public/videos/` directory contains the demonstration video for the automated customer notification process.

---

# 🚀 Installation

## Prerequisites

Make sure you have:

- Node.js
- npm
- MySQL / MariaDB
- A configured database
- n8n for workflow automation
- Ollama for local AI integration

---

## Clone the Repository

```bash
git clone https://github.com/feeryel/Backend_pfe.git

cd Backend_pfe
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment Variables

Create a `.env` file according to your local configuration.

Example:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=repair_management
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your_secret
```

Update the values according to your environment.

---

## Run the Backend

```bash
npm start
```

Or, if a development script is configured:

```bash
npm run dev
```

---

# 🔄 End-to-End Workflow

The complete repair lifecycle can be represented as follows:

```text
Customer
   ↓
Angular Frontend
   ↓
Create Repair Request
   ↓
Node.js / Express API
   ↓
MySQL / MariaDB
   ↓
Technician Repairs Device
   ↓
Repair Status = DONE
   ↓
n8n Webhook
   ↓
Automation Workflow
   ↓
Email + WhatsApp Notification
   ↓
Customer
   ↓
Device Ready for Pickup
```

---

# 🎯 Project Objectives

The main objectives of the backend are to:

- Provide a complete REST API for repair management
- Centralize business logic
- Manage customers and devices
- Manage repairs and repair requests
- Handle planning and invoicing
- Manage spare parts and repair lines
- Secure API access with JWT
- Automate customer communication with n8n
- Send Email and WhatsApp notifications
- Integrate AI through MCP
- Support local LLMs with Ollama
- Build an extensible architecture for AI-assisted repair management

---

# 💡 Technical Highlights

### 🌐 RESTful Backend

A centralized Node.js / Express API manages the application's business operations.

### 🗄️ Relational Database

MySQL / MariaDB stores customers, devices, repairs, invoices, planning records, users, and spare parts.

### ⚡ Event-Driven Automation

n8n connects backend events to automated workflows.

### 📧 Email + 💬 WhatsApp

Customers can automatically receive notifications when their repair is completed.

### 🤖 Local AI

Ollama enables local LLM execution and AI-assisted interaction with the application.

### 🔌 MCP Integration

MCP provides a standardized tool-based interface between the AI layer and the repair management backend.

### 🔐 Controlled AI Access

AI agents do not access the database directly. Operations are executed through the MCP server and the existing REST API.

---

# 🔗 Related Repositories

### Frontend — Angular

https://github.com/feeryel/repair-management-system

### Backend — Node.js / Express

https://github.com/feeryel/Backend_pfe

### MCP Server — Ollama + MCP

https://github.com/feeryel/mcp_server_pfe

---

# 👩‍💻 Author

## Feryel Dadi

**Software Engineer**  
**Master's Degree in Mobile Development Engineering**

🌐 **Portfolio:**  
https://portfolio-feryel.vercel.app

💼 **LinkedIn:**  
https://www.linkedin.com/in/feryeldadi

🐙 **GitHub:**  
https://github.com/feeryel

---

# 📄 License

This project was developed as part of an academic and professional software engineering project.
