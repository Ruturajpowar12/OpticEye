# OpticEye

Full-stack eyewear e-commerce platform with:
- `storefront` (customer app)
- `admin` (admin dashboard)
- `server` (REST API)

## Features

### Storefront (`storefront`)
- Browse products and categories
- Advanced filters (search, category, frame type, gender, sorting)
- Product detail page with quantity selection
- Cart management (add/remove/update quantity)
- Checkout with address + payment method selection
- User authentication (register/login)
- Account profile update + order history

### Admin Panel (`admin`)
- Admin login with protected routes
- Dashboard with revenue/orders/products/users summary
- Product CRUD + search + featured toggle + stock/price updates
- Category CRUD
- Order list + order status updates
- User management (toggle admin / delete user)

### Backend API (`server`)
- JWT-based auth
- Role-based authorization (admin/customer)
- Product, category, order, user management APIs
- Admin analytics endpoint
- MongoDB integration with Mongoose
- Seed script for demo users/categories/products

## Tech Stack
- Frontend: React 18, React Router, Axios, Vite
- Backend: Node.js, Express, MongoDB, Mongoose
- Auth: JWT, bcryptjs
- Dev tools: Nodemon, Morgan, CORS, dotenv

## Monorepo Structure

```text
OpticEye/
|- storefront/   # Customer-facing React app (Vite, port 5173)
|- admin/        # Admin React app (Vite, port 5174)
`- server/       # Express + MongoDB API (port 5000)
```

## Prerequisites
- Node.js 18+
- npm 9+
- MongoDB Atlas or local MongoDB

## Environment Variables

### `server/.env`

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
STORE_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
```

### `storefront/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

### `admin/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

## Installation

From each app folder, install dependencies:

```bash
cd server && npm install
cd ../storefront && npm install
cd ../admin && npm install
```

## Run Locally

Open 3 terminals:

1. Start API
```bash
cd server
npm run dev
```

2. Start Storefront
```bash
cd storefront
npm run dev
```

3. Start Admin Panel
```bash
cd admin
npm run dev
```

## Seed Demo Data

```bash
cd server
npm run seed
```

This inserts demo users, categories, and products.

## Demo Credentials

- Admin
  - Email: `admin@opticeye.com`
  - Password: `Admin@123`

- Customer
  - Email: `user@opticeye.com`
  - Password: `User@123`

## API Overview

Base URL: `http://localhost:5000/api`

- Health: `GET /health`
- Auth: `/auth/register`, `/auth/login`, `/auth/profile`
- Products: `/products`
- Categories: `/categories`
- Orders: `/orders`, `/orders/my-orders`
- Admin stats: `/admin/dashboard`

## Scripts

### Server (`server/package.json`)
- `npm run dev` - Start API with nodemon
- `npm start` - Start API with node
- `npm run seed` - Seed database

### Storefront (`storefront/package.json`)
- `npm run dev` - Start Vite dev server on `5173`
- `npm run build` - Production build
- `npm run preview` - Preview build

### Admin (`admin/package.json`)
- `npm run dev` - Start Vite dev server on `5174`
- `npm run build` - Production build
- `npm run preview` - Preview build

## Author
- Ruturaj
