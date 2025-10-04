# 💼 Expense Management System

## 📘 Project Overview

The **Expense Management System** is a full-stack application designed to manage, verify, and approve employee expenses in an organization with a **multi-level approval workflow**.  
It supports **OCR-based receipt verification**, **role-based dashboards**, and **real-time analytics** for expense tracking and approvals.

📹 **Demo Video:** [Google Drive Folder](https://drive.google.com/drive/u/0/folders/1f8LhDQrw2SQjeMV71uYQvSyAxbDYeHhr)

---

## ⚙️ Tech Stack

### 🖥️ Frontend
- **Framework:** React (Vite + TypeScript)
- **Styling:** Tailwind CSS
- **UI Library:** shadcn-ui
- **Charts:** Chart.js
- **Routing:** React Router DOM
- **State Management:** Context API

### ⚙️ Backend
- **Language:** Python  
- **Framework:** FastAPI  
- **Database Connector:** MySQL Connector (python-db)  
- **OCR Integration:** pytesseract  
- **Authentication:** JWT Tokens (via FastAPI security)
- **Database:** MySQL  

---

## 🧾 Key Features

- 🔐 **Role-based Login:** Admin, Manager, CFO, and Employee dashboards.  
- 🧾 **Expense Submission with OCR:** Upload bill images and auto-extract data using `pytesseract`.  
- ⚖️ **Dynamic Multi-Level Approval Flow:**
  - Below threshold → Manager approval only.  
  - Above threshold → Sent to CFO (CFO decides to approve directly or request multi-level approval).  
  - Requires at least 60% manager approvals.  
  - CFO has veto power.  
  - Admin configures approval levels and thresholds.
- 📊 **Analytics Dashboard:**
  - Expense trends, department spending, and approval stats.  
  - OCR accuracy tracking.  
  - Monthly and role-based trends.  
- 🌙 **Dark Theme UI** with animated transitions and clean dashboard layouts.  
- 🧩 **Admin Panel:**
  - Manage users, roles, and approval levels.  
  - Set limits and thresholds.  
- 💬 **Activity Tracker:** Shows recent approvals, rejections, and submissions.  
 

## 🧑‍💻 How to Run Locally

### 🔹 Prerequisites
- [Node.js](https://nodejs.org/en/download/)
- [Python 3.10+](https://www.python.org/downloads/)
- [MySQL](https://dev.mysql.com/downloads/)
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract)

---

### 🖥️ 1. Clone the Repository

```bash
git clone https://github.com/Cancel5thMember/Expense-Management.git
cd Expense-Management


The only requirement is having Node.js & npm installed - install with nvm

Follow these steps:

# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
