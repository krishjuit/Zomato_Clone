# Zomato Clone - Multi-Vendor Food Ordering & Delivery Management Platform

Welcome to the **Zomato Clone** repository! This is a production-grade, multi-vendor online food ordering and delivery ecosystem. It features distinct panels for customers, restaurant vendors, and platform superadmins, all connected to a unified database layer via REST APIs.

---

## 🚀 Features

### 1. Multi-Vendor Architecture & Onboarding
* **Vendor Registration & Auto-Onboarding:** Independent restaurant managers (vendors) can register a new account directly on the Admin Dashboard login screen. The sign-up form automatically captures vendor credentials and restaurant profile details (cuisines, description, address, banner logo) to set up and bind the new kitchen instantly.
* **Restaurant Settings Management:** Vendors can update their kitchen name, cuisines, description, address, banner image, and operational status (toggling an active/inactive switch to open or close the restaurant for ordering) via the "Settings" page.
* **Customer Cart Isolation:** Customers are restricted to ordering from a single restaurant at a time to prevent pick-up and logistics complications.

### 2. Verified Ratings & Reviews with Deletion UI
* **Verified Reviews:** Review submission is locked to registered clients who have placed and completed an order (`DELIVERED` status) from that specific kitchen, protecting restaurants from rating spam.
* **Aggregated Scores:** Average ratings and review counts are recalculated dynamically on MongoDB collections without needing full-table scans.
* **Review Deletion:** Review owners and platform superadmins can delete reviews directly from the customer review UI. Deletion triggers an automatic recalculation of the restaurant and food item's average rating and total review counts in the database.

### 3. Dynamic Promotion & Coupon System
* **Coupon Scoping & Types:** Supports flat or percentage-based discount codes. Coupons can be scoped to specific restaurants (vendor-created) or globally available across the platform (superadmin-created).
* **Validation Engine:** Enforces validation rules at checkout, including minimum order value targets, maximum discount caps, total usage limits, and active date ranges.
* **Available Coupons Cart Panel:** Customers can view a scrollable list of active, valid coupons matching their current restaurant cart directly on the cart page and apply them dynamically.

### 4. Analytical Dashboards
* **Vendor Dashboard:** Visual metrics displaying Month-to-Date (MTD) revenues, active vs. completed order volumes, and top-selling food items.
* **Superadmin Control Deck:** Platform-wide transactional volumes, active vendor listings, onboarding portals, and top-grossing restaurant leaderboards.

### 5. Secure Stripe Payments & Notifications
* **Standard Stripe Integration:** Secure checkout sessions convert dollar amounts to cents and process credit card transactions safely.
* **Status History Audit Trail:** An order status history table tracks status transitions (`ACCEPTED`, `PREPARING`, `READY`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`) along with the updater's ID and timestamps.
* **Database Notifications:** Alerts users and vendors on order status transitions and new orders.

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Customer Frontend** | React (v19) + Vite | Dynamic Single Page Application (SPA) using React Context API for global state and Tailwind CSS for styling. |
| **Admin Panel** | React (v19) + Vite | Unified dashboard interface with secure portals for vendors and superadmins. |
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

Before running the application, make sure you have **Node.js** (v18+) and **npm** installed.

### 1. Configure Environment Variables

Create `.env` configuration files for each component.

#### **Backend Config (`/backend/.env`)**
Create `/backend/.env` with the following variables.

> [!IMPORTANT]
> **Mandatory Startup Validation:** The backend server performs validation on startup. If any of the required environment variables below are missing or empty, the server will print a critical startup error and exit with code 1.

```env
# Database & Authentication
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_signing_key_at_least_32_characters

# Server Port
PORT=4000

# Cloudinary CDN Configuration
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET=your_cloudinary_api_secret

# Payment Gateways
STRIPE_SECRET_KEY=your_stripe_secret_key

# Seeding & Bootstrapping
SUPERADMIN_EMAIL=superadmin@zomato.com
SUPERADMIN_PASSWORD=your_secure_superadmin_password
DEFAULT_VENDOR_EMAIL=default_vendor@zomato.com
DEFAULT_VENDOR_PASSWORD=your_secure_vendor_password

# Client CORS Origins (No Wildcards)
FRONTEND_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
```

> [!TIP]
> * **JWT Key Strength:** In production, it is highly recommended to configure a cryptographically secure `JWT_SECRET` of at least 32 characters to avoid weak key startup warnings.
> * **CORS Security:** Cross-Origin Resource Sharing (CORS) is explicitly locked to the origins defined in `FRONTEND_URL` and `ADMIN_URL`. Wildcard configurations are disabled to secure backend endpoints.

#### **Customer Frontend Config (`/frontend/.env`)**
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

### 2. Database Bootstrapping & Seeding
On startup, the system automatically checks for the existence of required accounts in the database:
1. **Superadmin Bootstrap:** The backend checks if any user with the `superadmin` role exists. If none is found, it automatically creates the first superadmin using the `SUPERADMIN_EMAIL` and `SUPERADMIN_PASSWORD` defined in `/backend/.env`. If a superadmin already exists, this seeding step is skipped.
2. **Default Vendor & Restaurant Setup:** A default vendor and restaurant profile is bootstrapped using `DEFAULT_VENDOR_EMAIL` and `DEFAULT_VENDOR_PASSWORD` to ensure the platform has initial operational data.

---

### 3. Running the Application

For developer convenience, hot-reloading configurations are enabled:
* **Vite Dev Servers (Frontend & Admin):** Configured to use polling file-watchers (`usePolling: true`) for instant, reliable HMR updates across virtualized or shared network filesystems.
* **Backend Nodemon:** Runs with legacy watch mode (`nodemon -L`) to listen for code changes.

Start each component in a separate terminal:

#### **Start the Backend Server**
```bash
cd backend
npm install
npm run dev
```

#### **Start the Customer Frontend**
```bash
cd frontend
npm install
npm run dev
```

#### **Start the Admin Dashboard**
```bash
cd admin
npm install
npm run dev
```

> [!TIP]
> **Windows Users:** If PowerShell script execution policies restrict running `npm`, run standard commands using `npm.cmd` (e.g., `npm.cmd install` and `npm.cmd run dev`).

---

## 🔐 API Routing, Roles & Security

* **Superadmin Registration Protection:** Direct public registration of the `superadmin` role is completely disabled. Attempting to register via `POST /api/user/register` with `role: "superadmin"` will return a `400 Bad Request`. Superadmins must be bootstrapped via environment variables on initial startup.
* **Role Security Middleware:** Blocks unauthorized role actions. For example, a client with a `customer` token attempting to request vendor analytics or admin logs will receive a `403 Forbidden` error.
* **ObjectId Format Check:** Pre-query middleware intercepts and validates parameter formats (e.g. `req.params.id`). If the parameter is not a valid 24-character hexadecimal MongoDB ObjectId, it rejects the request with a `400 Bad Request` before querying the database, preventing server CastError terminations.
* **Authentication Route Stack:** All private endpoints check for Bearer tokens in the `Authorization` header. Decoded payloads are injected with `req.userId` and `req.userRole` parameters for controller logic mapping.

