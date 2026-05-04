## 👁️ OpticEye – Full Stack Eyewear E-Commerce Platform

OpticEye is a full-stack e-commerce web application designed for seamless online eyewear shopping. It provides a complete digital solution with a customer-facing storefront, an admin dashboard for management, and a robust REST API backend.

## Live Links
- Storefront: `https://opticeye-1.onrender.com`
- Admin: `https://opticeye-admin.onrender.com`

## Apps
- `storefront` - customer website (React + Vite)
- `admin` - admin dashboard (React + Vite)
- `server` - API server (Node.js + Express + MongoDB)

=======
# 👁️ OpticEye – Full Stack Eyewear E-Commerce Platform

OpticEye is a full-stack e-commerce web application designed for seamless online eyewear shopping. It provides a complete digital solution with a customer-facing storefront, an admin dashboard for management, and a robust REST API backend.
## Live Links
- Storefront: `https://opticeye-1.onrender.com`
- Admin: `https://opticeye-admin.onrender.com`

## Apps
- `storefront` - customer website (React + Vite)
- `admin` - admin dashboard (React + Vite)
- `server` - API server (Node.js + Express + MongoDB)

## Quick Setup
```bash
cd server && npm install
cd ../storefront && npm install
cd ../admin && npm install
```

## Environment Variables
`server/.env`
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
STORE_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
```

`storefront/.env`
```env
VITE_API_URL=http://localhost:5000/api
```

`admin/.env`
```env
VITE_API_URL=http://localhost:5000/api
```

## Run
```bash
# terminal 1
cd server && npm run dev

# terminal 2
cd storefront && npm run dev

# terminal 3
cd admin && npm run dev
```

## Demo Admin Login
- Email: `admin@opticeye.com`
- Password: `Admin@123`
