# 🔧 Repair Management System — Backend

A scalable **RESTful backend** built with **Node.js and Express.js** for managing customer service and repair workshop operations.

This repository contains the backend API of the **Repair Management System**, providing authentication, business logic, repair management, planning, invoicing, AI integrations, and communication with the database.

> **Frontend:** Angular 17
> **Backend:** Node.js / Express.js
> **Database:** MySQL / MariaDB

---

## 📌 About the Project

The Repair Management System is a complete digital solution designed to streamline the operations of a repair workshop.

The backend provides the APIs and business logic required to manage the complete repair lifecycle:

```text
Customer
   ↓
Device
   ↓
Repair Request
   ↓
Diagnosis & Repair
   ↓
Planning
   ↓
Repair Completion
   ↓
Invoice
   ↓
Customer Delivery
```

The architecture is designed to separate **API endpoints, business logic, database models, authentication, and external integrations**.

---

## ✨ Main Features

### 🔐 Authentication & Authorization

* User registration and login
* JWT-based authentication
* Protected API routes
* Role-based authorization
* Authentication middleware
* Secure access to resources

---

### 👥 Customer Management

* Create customers
* Update customer information
* Retrieve customer details
* Manage customer history
* Associate customers with devices and repair requests

---

### 💻 Device Management

* Register customer devices
* Store device information
* Associate devices with customers
* Track device repair history

---

### 🛠️ Repair Management

* Create repair requests
* Manage repair information
* Track repair status
* Update repair workflow
* Manage repair-related operations
* Retrieve repair history

---

### 📅 Planning & Scheduling

* Create repair planning records
* Schedule repair operations
* Manage workshop activities
* Track planned repairs

---

### 🧾 Invoice Management

* Create invoices
* Retrieve invoice information
* Generate invoice documents
* Export invoices as PDF
* Manage invoice-related data

---

### 🏷️ Repair Labels & QR Codes

The backend supports repair identification and tracking through:

* Repair labels
* QR code generation
* Device identification
* Repair record tracking

---

## 🤖 AI & Automation

The backend also integrates AI-oriented functionality to improve repair workshop operations.

### OCR

The project includes an **OCR-based approach for invoice/document processing**, allowing relevant information to be extracted from documents and reducing manual data entry.

### Ollama

**Ollama** is used to explore local AI capabilities and integrate AI-powered functionality into the system.

### Model Context Protocol

An **MCP-based integration** exposes backend capabilities to AI systems, allowing AI agents to interact with application functionality through structured tools.

### n8n

The project also integrates **n8n** for workflow automation, including automated business processes and notifications.

---

## 🏗️ Backend Architecture

The backend follows a modular structure separating the main application responsibilities.

```text
Backend_pfe/
│
├── config/
│   └── Database configuration
│
├── controllers/
│   └── Business logic
│
├── middleware/
│   └── Authentication & authorization
│
├── migrations/
│   └── Database migrations
│
├── models/
│   └── Sequelize models
│
├── routes/
│   └── REST API routes
│
├── services/
│   └── External & application services
│
├── n8n/
│   └── Automation workflows
│
├── n8n-assets/
│   └── Assets used by automation workflows
│
├── public/
│   └── Public resources
│
├── app.js
├── package.json
└── README.md
```

---

## 🛠️ Tech Stack

### Backend

* **Node.js**
* **Express.js**
* **JavaScript**
* **Sequelize ORM**

### Database

* **MySQL**
* **MariaDB**

### Authentication

* **JSON Web Token (JWT)**
* Authentication middleware
* Role-based authorization

### Document & PDF Processing

* **Puppeteer**
* **PDFKit**

### AI

* **OCR**
* **Ollama**
* **Model Context Protocol (MCP)**

### Automation

* **n8n**

### Development

* **Git**
* **GitHub**
* **Postman**
* **Docker**

---

## 🔄 API Architecture

The backend exposes RESTful endpoints consumed by the Angular frontend.

```text
Angular Frontend
       │
       │ HTTP / REST API
       ▼
┌──────────────────────┐
│    Express Server    │
├──────────────────────┤
│       Routes         │
│          ↓           │
│     Controllers      │
│          ↓           │
│      Services        │
│          ↓           │
│       Models         │
│          ↓           │
│      Sequelize      │
└──────────┬───────────┘
           │
           ▼
      MySQL / MariaDB
```

---

## 🗄️ Database

The application uses **MySQL/MariaDB** with **Sequelize ORM**.

The database layer manages entities such as:

* Users
* Customers
* Devices
* Repair requests
* Planning
* Invoices
* And other repair-related entities

Database migrations are maintained in the `migrations/` directory.

---

## ⚙️ Installation

### Prerequisites

Make sure you have installed:

* Node.js
* npm
* MySQL or MariaDB
* Git

### Clone the repository

```bash
git clone https://github.com/feeryel/Backend_pfe.git

cd Backend_pfe
```

### Install dependencies

```bash
npm install
```

### Environment Variables

Create a `.env` file and configure the required environment variables.

Example:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=repair_management
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your_secret_key
```

> Never commit real credentials, API keys, tokens, or secrets to the repository.

### Start the server

```bash
node app.js
```

The API will be available at:

```text
http://localhost:3000
```

---

## 🔗 Frontend Repository

The Angular frontend is maintained in a separate repository:

**Frontend:**
https://github.com/feeryel/repair-management-system

---

## 🔗 Full Project

### Frontend

https://github.com/feeryel/repair-management-system

### Backend

https://github.com/feeryel/Backend_pfe

---

## 🎯 Project Objectives

The backend was designed to:

* Centralize repair workshop data
* Provide a reliable REST API
* Secure application access
* Manage the complete repair lifecycle
* Simplify invoice generation
* Improve repair traceability
* Integrate AI-powered document processing
* Automate business workflows
* Provide a scalable foundation for future features

---

## 👩‍💻 Author

### Feryel Dadi

**Software Engineer — Software Engineering**
**Master's Degree in Mobile Development Engineering**

🌐 Portfolio:
https://portfolio-feryel.vercel.app

🐙 GitHub:
https://github.com/feeryel

💼 Linkedin:
https://www.linkedin.com/in/feeryel-dadi

---

## 📄 License

This project was developed as part of an academic and professional software engineering project.
