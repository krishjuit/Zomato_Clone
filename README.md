# Zomato Clone - Multi-Vendor Food Ordering & Delivery Management Platform

Welcome to the **Zomato Clone** repository! This is a production-grade, multi-vendor online food ordering and delivery ecosystem. It features distinct panels for customers, restaurant vendors, and platform superadmins, all connected to a unified database layer via REST APIs.

---

## 🚀 Features

### 1. Multi-Vendor Architecture
* Independent restaurant managers (vendors) can register profiles, upload branding, customize menus, and process incoming orders.
* **Customer Cart Isolation:** Customers are restricted to ordering from a single restaurant at a time to prevent pick-up and logistics complications.

### 2. Verified Ratings & Reviews
* Review submission is locked to registered clients who have placed and completed an order (`DELIVERED` status) from that specific kitchen.
* Average ratings and review counts are recalculated dynamically on MongoDB collections without needing full-table scans.

### 3. Promotion & Coupon System
* Supports flat or percentage-based discount codes.
* Scoped validation rules assert minimum order values, maximum discount caps, usage limits, and specific restaurant scopes (or global availability).

### 4. Analytical Dashboards
* **Vendor Dashboard:** Visual metrics displaying Month-to-Date (MTD) revenues, active vs. completed order volumes, and top-selling food items.
* **Superadmin Control Deck:** Platform-wide transactional volumes, active vendor listings, onboarding portals, and top-grossing restaurant leaderboards.

### 5. Secure Stripe Payments & Notifications
* Standard Stripe checkout session integration for secure credit card checkout.
* Database-backed notification history alerts users and vendors on order status transitions.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Customer Frontend** | React (v19) + Vite | Dynamic SPA using React Context API for global state and Tailwind CSS (v4) for styling. |
| **Admin Panel** | React (v19) + Vite | Dashboard interface with secure portals for vendors and superadmins. |
| **Backend Server** | Node.js + Express | Stateless REST API supporting JWT authentication, multer file parsing, and Stripe integrations. |
| **Database** | MongoDB + Mongoose | NoSQL document storage storing structured carts, transactional logs, and audit trails. |
| **Media Hosting** | Cloudinary | Cloud-based CDN hosting high-resolution food items and restaurant banners. |

---

## 📂 Project Directory Structure

```
Zomato_Clone/
├── backend/            # Node.js + Express REST API Server
├── frontend/           # Customer Client SPA (React + Vite)
├── admin/              # Vendor & Superadmin Dashboard SPA (React + Vite)
├── MIGRATION.md        # Database and configuration migration guides
└── project_knowledge_report.md  # Comprehensive project reference report
```

---

## ⚙️ Installation & Setup

Before running the application, make sure you have **Node.js** and **npm** installed.

### 1. Clone & Configure Environment Variables
You must set up `.env` configuration files for each component.

#### **Backend Config (`/backend/.env`)**
Create `/backend/.env` with the following variables:
```env
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_signing_key
PORT=4000
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET=your_cloudinary_api_secret
STRIPE_SECRET_KEY=your_stripe_secret_key
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
DEFAULT_VENDOR_EMAIL=default_vendor@zomato.com
DEFAULT_VENDOR_PASSWORD=vendor123
SUPERADMIN_EMAIL=superadmin@zomato.com
SUPERADMIN_PASSWORD=admin123
```

#### **Frontend Config (`/frontend/.env`)**
Create `/frontend/.env` with:
```env
VITE_BACKEND_URL=http://localhost:4000
VITE_ADMIN_URL=http://localhost:5174
```

#### **Admin Panel Config (`/admin/.env`)**
Create `/admin/.env` with:
```env
VITE_BACKEND_URL=http://localhost:4000
```

---

### 2. Start the Backend Server
```bash
cd backend
npm install
npm run dev
```

### 3. Start the Customer Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Start the Admin Dashboard
```bash
cd admin
npm install
npm run dev
```

> [!TIP]
> **Windows Users:** If PowerShell script execution policies restrict running `npm`, run standard commands using `npm.cmd` (e.g., `npm.cmd install` and `npm.cmd run dev`).

---

## 🔐 API Routing & Roles

* **Role Security Middleware:** Blocks unauthorized role actions (e.g., Customers requesting admin metrics will receive `403 Forbidden`).
* **ObjectId Format Check:** A pre-query middleware validates parameter syntax, protecting database routes from casting failures.
* **Authentication Route Stack:** All private endpoints check for Bearer tokens in the `Authorization` header.
