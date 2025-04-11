
# Express JWT Auth API with MongoDB Atlas

A secure backend API built with **Node.js**, **Express.js**, and **MongoDB Atlas** that supports **JWT authentication**, **access & refresh tokens**, and **role-based user management**.

## 🔐 Features

- JWT-based **authentication** with access & refresh tokens
- **Secure password hashing** using bcrypt
- **Role-based access control** (admin & user)
- CRUD operations for users
- **HTTP-only cookies** for refresh tokens
- Built with security best practices

---

## 📁 Project Structure

```

│
├── controllers/          # Logic for auth and user routes
├── middleware/           # Auth middleware for JWT & role checks
├── models/               # User schema and methods
├── routes/               # Route definitions
├── server.js             # Express server setup and MongoDB connection
├── .env.example          # Environment variable example
├── package.json          # Project dependencies and scripts
└── README.md             # You're here!
```

---

## 🛠️ Setup Instructions

1. **Clone the repository**:
```bash
gh repo clone Utkarsh283/Backend-assignment
cd express-mongo-jwt-auth
```

2. **Install dependencies**:
```bash
npm install
```

3. **Create your `.env` file**:
Duplicate `.env.example` and rename it to `.env`. Fill in:

```env
PORT=5000
MONGO_URI=mongodb+srv://<db_name>:<db_password>@cluster0.jrvsjdc.mongodb.net/
JWT_SECRET=your_jwt_access_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
JWT_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=7d
```
Get you MongoDB URL from https://cloud.mongodb.com/  , click on conncet->compass->copy link.

4. **Start the server**:
```bash
npm run dev
```

---

## Script Testing(Make sure server is running before running test scripts)

### Running Tests

To execute the test scripts, use the following commands:

- **Authentication Tests:**
  ```bash
  npm run testauth
  ```

- **User Management Tests:**
  ```bash
  npm run testuser
  ```

### Test Coverage

Ensure that all test cases pass to verify the integrity and security of the application. Review test logs for any failures and address them promptly.

## 🔄 Authentication Flow

1. **Signup** - `/api/auth/signup`
2. **Login** - `/api/auth/login`
   - Returns access token (in body)
   - Sets refresh token (HTTP-only cookie)
3. **Access Protected Routes** with:
   ```
   Authorization: Bearer <access_token>
   ```
4. **Refresh Token** - `/api/auth/refresh`
   - Uses refresh token cookie to issue new access token
5. **Logout** - `/api/auth/logout`
   - Invalidates refresh token and clears cookie

---

## 🧪 Testing in Postman

### ✅ Signup
- **POST** `/api/auth/signup`
- **Body (JSON)**:
```json
{
  "username": "john123",
  "fullname": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

---

### 🔐 Login
- **POST** `/api/auth/login`
- **Body (JSON)**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
- Response: `accessToken` + sets `jwt` cookie

---

### 🙋 Get Current User
- **GET** `/api/users/me`
- **Header**:
```
Authorization: Bearer <accessToken>
```

---

### 🔄 Refresh Token
- **POST** `/api/auth/refresh`
- Sends back a **new access token**
- Requires `jwt` cookie set (refresh token)

---

### 🚪 Logout
- **POST** `/api/auth/logout`
- Clears `jwt` cookie and invalidates it on server

---



## 👮 Admin Features

If your user has `role: "admin"`:

- **GET** `/api/users` – Get all users
- **POST** `/api/users` – Create a user
- **PUT** `/api/users/:id` – Update any user
- **DELETE** `/api/users/:id` – Delete any user

---

## 🛡️ Security Notes

- Passwords are **hashed** with bcrypt
- Refresh tokens are stored in **HTTP-only cookies**
- **Access tokens** are short-lived (`15m`)
- **Role checks** prevent unauthorized access
- **MongoDB Atlas** used for cloud-hosted DB

---

