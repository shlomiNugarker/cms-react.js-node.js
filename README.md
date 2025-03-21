# CMS React.js & Node.js

## Overview
This is a full-stack **Content Management System (CMS)** built with **React.js (Vite) on the frontend** and **Node.js (Express.js) on the backend**. The system enables administrators to create, manage, and publish content dynamically, with built-in authentication, media management, and SEO optimization features.

## Tech Stack
### **Frontend (React.js + Vite)**
- **React.js** – Modern UI framework for a responsive and interactive experience.
- **React Router** – Client-side routing for seamless navigation.
- **Context API** – Global state management for authentication.
- **Tailwind CSS** – Utility-first CSS framework for styling.
- **i18next** – Internationalization (RTL support for Hebrew & Arabic).
- **Vite** – Fast bundler and development server.

### **Backend (Node.js + Express.js)**
- **Express.js** – REST API framework for handling requests.
- **MongoDB + Mongoose** – NoSQL database for flexible data management.
- **JWT Authentication** – Secure login and token-based authentication.
- **bcrypt** – Password encryption for security.
- **Nodemailer** – Email service for password recovery.
- **Helmet & CORS** – Security enhancements.

## Features
### **Authentication & Authorization**
- Secure user authentication with **JWT tokens**.
- Role-based access control (**Admin/User**).
- Persistent login via `localStorage`.
- Password reset via email.

### **Content Management**
- Create, edit, and delete content.
- Supports multiple content types: `post`, `page`, `product`, `custom`.
- Rich text support with structured metadata.
- **SEO-friendly** fields (meta tags, OpenGraph, Twitter Cards).

### **Media Management**
- Upload, store, and manage media assets.
- Secure file handling and optimized image delivery.

### **Admin Dashboard**
- **User management** (view, update, delete users).
- **Content approval workflow** for editors.
- **Site settings configuration**.

### **Performance & Security**
- **Express-rate-limit** – Protection against DDoS attacks.
- **Helmet.js** – Secure HTTP headers.
- **Lazy loading & code splitting** for optimized frontend performance.

## Project Structure
```
cms-project/
├── backend/                # Express.js API
│   ├── src/
│   │   ├── controllers/    # Business logic
│   │   ├── routes/         # API endpoints
│   │   ├── models/         # Mongoose schemas
│   │   ├── middlewares/    # Authentication & security
│   │   ├── utils/          # Utility functions
│   │   ├── database/       # MongoDB connection
│   │   ├── config/         # Configuration files
│   ├── server.ts           # Entry point for the backend
│   ├── package.json        # Backend dependencies
│
├── frontend/               # React.js application
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Views & pages
│   │   ├── routes/         # Navigation (React Router)
│   │   ├── context/        # Global state management
│   │   ├── services/       # API calls
│   │   ├── hooks/          # Custom hooks
│   │   ├── styles/         # Tailwind styles
│   ├── package.json        # Frontend dependencies
│
├── README.md               # Project documentation
```

## Installation & Setup
### **1. Clone the repository**
```sh
git clone https://github.com/shlominugarker/cms-project.git
cd cms-project
```

### **2. Setup Backend**
```sh
cd backend
npm install
cp .env.example .env   # Set up environment variables
npm run dev            # Start development server
```

### **3. Setup Frontend**
```sh
cd ../frontend
npm install
npm run dev            # Start Vite frontend server
```

## API Endpoints
### **Authentication**
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/api/auth/login` | User login |
| `POST` | `/api/auth/register` | User registration |
| `POST` | `/api/auth/forgot-password` | Request password reset |
| `GET`  | `/api/auth/me` | Get logged-in user |

### **Content Management**
| Method | Endpoint | Description |
|--------|---------|-------------|
| `GET`  | `/api/content` | Fetch all content |
| `GET`  | `/api/content/:id` | Fetch content by ID |
| `POST` | `/api/content` | Create new content (Admin only) |
| `PUT`  | `/api/content/:id` | Update content (Admin only) |
| `DELETE` | `/api/content/:id` | Delete content (Admin only) |

## Contributing
1. Fork the repository.
2. Create a new branch (`feature/new-feature`).
3. Commit your changes (`git commit -m "Added new feature"`).
4. Push to the branch (`git push origin feature/new-feature`).
5. Open a Pull Request.

## License
This project is licensed under the **MIT License**.

## Authors
- Shlomi Nugarker – Full Stack Developer

## הגדרת Cloudinary

כדי להשתמש ב-Cloudinary לאחסון מדיה:

1. צור חשבון ב-[Cloudinary](https://cloudinary.com/) (יש חשבון חינמי)
2. העתק את פרטי ה-API מלוח המחוונים שלך
3. הוסף את הפרטים לקובץ `.env` בתיקיית `backend`:

```
USE_CLOUDINARY=true
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. הפעל מחדש את השרת

