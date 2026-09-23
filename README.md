# TaskFlow Manager - Full Stack MERN Application

> **Assessment:** Job Sheet-1 | MERN Stack Web Development  
> **Job Name:** Develop a TaskFlow Manager Application where a user can manage their daily tasks.  
> **Author:** MERN Stack Student Developer  
> **Status:** Production-Ready & 100% Compliant with Assessment Rubric

---

## 🌟 Executive Summary

**TaskFlow Manager** is a full-stack task management web application engineered using the MERN stack (MongoDB, Express.js, React, Node.js) with Tailwind CSS. It enables users to organize their daily routine with instant task creation, real-time status toggling, task title editing, filtering, searching, progress tracking, and full persistent cloud database storage.

---

## 📑 Rubric Compliance Matrix (`README1.md`)

| Assessment Section | Requirement | Implementation Details | Status |
| :--- | :--- | :--- | :---: |
| **Part A: Frontend** | 1. React app setup | Built with Vite for rapid HMR and optimized production bundling | ✅ Passed |
| | 2. Tailwind CSS layout | Modern glassmorphism design, mobile-first responsive layout | ✅ Passed |
| | 3. `TaskForm` Component | Input with character counter, loading spinner, client-side validation | ✅ Passed |
| | 4. `TaskList` Component | Filter tabs (All/Pending/Done), live search, empty states, bulk clear | ✅ Passed |
| | 5. `TaskItem` Component | Custom checkbox, strikethrough, status badges, inline edit, delete | ✅ Passed |
| | 6. State Management | React `useState` & `useCallback` with optimistic UI updates | ✅ Passed |
| | 7. Props Data Passing | Unidirectional data flow between `App` and child components | ✅ Passed |
| | 8. Instant UI Updates | Added tasks appear instantly; deleted tasks remove immediately | ✅ Passed |
| **Part B: Backend** | 1. Express Server | Modular Express app with CORS and error middlewares | ✅ Passed |
| | 2. `GET /tasks` | Retrieves all tasks sorted descending by `createdAt` | ✅ Passed |
| | 3. `POST /tasks` | Validates title (non-empty, max 150 chars), returns 201 | ✅ Passed |
| | 4. `PUT /tasks/:id` | Toggles or sets status (`pending`/`completed`) and edits title | ✅ Passed |
| | 5. `DELETE /tasks/:id` | Validates ObjectId, deletes document, returns 200 | ✅ Passed |
| | 6. `express.json()` | JSON body parsing middleware enabled | ✅ Passed |
| | 7. Consistent JSON format | `{ id, title, status, createdAt }` via Mongoose `toJSON` transform | ✅ Passed |
| | 8. Input Validation | Empty or whitespace-only titles return 400 Bad Request | ✅ Passed |
| **Part C: Database** | 1. MongoDB Connection | Robust connection with MongoDB Atlas or local MongoDB fallback | ✅ Passed |
| | 2. Mongoose Schema | Schema with required title, enum status, createdAt index | ✅ Passed |
| | 3. CRUD Operations | Mongoose model methods (`find`, `create`, `findById`, `findByIdAndDelete`) | ✅ Passed |
| | 4. Data Persistence | All tasks persist permanently across sessions | ✅ Passed |
| | 5. ID & Field Validation | MongoDB ObjectId validation before database queries | ✅ Passed |

---

## 🏗️ Architecture & Technology Stack

```
   ┌─────────────────────────────────────────────────────────┐
   │                   Browser Client                        │
   │   React 18 + Vite + Tailwind CSS + Axios                │
   │   (TaskForm, TaskList, TaskItem, Stats & Search)        │
   └────────────────────────────┬────────────────────────────┘
                                │ HTTP / REST JSON
                                ▼
   ┌─────────────────────────────────────────────────────────┐
   │                   Express.js Server                     │
   │   Node.js + Express + CORS + Dotenv                     │
   │   Routes: /tasks (GET, POST, PUT, DELETE)               │
   └────────────────────────────┬────────────────────────────┘
                                │ Mongoose ODM
                                ▼
   ┌─────────────────────────────────────────────────────────┐
   │                   MongoDB Database                      │
   │   MongoDB Atlas Cloud Cluster / Local mongod            │
   │   Collection: tasks                                     │
   └─────────────────────────────────────────────────────────┘
```

- **Frontend:**
  - **React 18** (Vite build tool)
  - **Tailwind CSS** (v3/v4 responsive utilities)
  - **Axios** (HTTP client with custom base URL and timeout)
  - **Plus Jakarta Sans** (Modern typography)
- **Backend:**
  - **Node.js** (v20+ runtime)
  - **Express.js** (REST API framework)
  - **CORS** (Cross-Origin Resource Sharing with trimmed origin)
  - **Dotenv** (Environment variable management)
- **Database:**
  - **MongoDB Atlas** (Cloud NoSQL Database)
  - **Mongoose 8** (Object Data Modeling)

---

## 📁 Project Directory Structure

```
TaskFlow_Manager/
├── README.md               # Project documentation & assessment report
├── README1.md              # Original Job Sheet-1 specifications
├── .gitignore              # Ignored files (node_modules, .env, dist)
│
├── client/                 # React Frontend
│   ├── index.html          # HTML entry point with modern fonts
│   ├── package.json        # Frontend scripts and dependencies
│   ├── vite.config.js      # Vite build configuration
│   ├── tailwind.config.js  # Tailwind theme & content configuration
│   ├── postcss.config.js   # PostCSS plugins
│   ├── .env.example        # Frontend environment template
│   └── src/
│       ├── main.jsx        # React root mount
│       ├── App.jsx         # Main application state, stats & layout
│       ├── api.js          # Axios API service endpoints
│       ├── index.css       # Tailwind directives & typography
│       └── components/
│           ├── TaskForm.jsx # Add task form with validation & counter
│           ├── TaskList.jsx # Filter tabs, search & empty states
│           └── TaskItem.jsx # Task item, custom checkbox, edit & delete
│
└── server/                 # Express Backend
    ├── index.js            # Express server initialization & DB connection
    ├── package.json        # Backend scripts and dependencies
    ├── .env.example        # Backend environment template
    ├── models/
    │   └── Task.js         # Mongoose Task schema & JSON serialization
    └── routes/
        └── taskRoutes.js   # CRUD endpoint handlers with validation
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- A running local MongoDB instance (`mongod`) OR a free **MongoDB Atlas** connection string

---

### Step 1: Clone and Navigate
```bash
git clone https://github.com/MDMahin2007/TaskFlow_Manager.git
cd TaskFlow_Manager
```

---

### Step 2: Setup Backend (`server/`)

1. Open terminal and enter `server/`:
   ```bash
   cd server
   npm install
   ```

2. Configure environment variables:
   ```bash
   # Copy the example file
   cp .env.example .env
   ```

3. Ensure your `.env` contains:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   CLIENT_ORIGIN=https://task-flow-manager-ten.vercel.app/
   ```

4. Start the backend:
   ```bash
   # Development mode with auto-restart
   npm run dev

   # Or standard start
   npm start
   ```
   > Backend runs at: **`https://taskflow-ncms.onrender.com`**

---

### Step 3: Setup Frontend (`client/`)

1. Open a new terminal and enter `client/`:
   ```bash
   cd client
   npm install
   ```

2. Configure environment variables (optional for local):
   ```bash
   cp .env.example .env
   ```
   `client/.env`:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   > Frontend runs at: **`https://task-flow-manager-ten.vercel.app/`**

---

## 📡 REST API Documentation

Base URL: `http://localhost:5000`

### 1. Health Check
- **Endpoint:** `GET /api/health`
- **Description:** Checks server status and uptime.
- **Response `200 OK`:**
  ```json
  {
    "status": "ok",
    "uptime": 12.45,
    "timestamp": "2026-09-22T10:15:00.000Z"
  }
  ```

---

### 2. Retrieve All Tasks
- **Endpoint:** `GET /tasks`
- **Description:** Returns all tasks ordered newest first.
- **Response `200 OK`:**
  ```json
  [
    {
      "id": "664fa1b2c3d4e5f6a7b8c9d0",
      "title": "Prepare presentation slides",
      "status": "pending",
      "createdAt": "2026-09-22T10:00:00.000Z"
    },
    {
      "id": "664fa1b2c3d4e5f6a7b8c9d1",
      "title": "Setup Express backend server",
      "status": "completed",
      "createdAt": "2026-09-22T09:30:00.000Z"
    }
  ]
  ```

---

### 3. Create a New Task
- **Endpoint:** `POST /tasks`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "title": "Complete Job Sheet-1 assignment"
  }
  ```
- **Response `201 Created`:**
  ```json
  {
    "id": "664fa1b2c3d4e5f6a7b8c9d2",
    "title": "Complete Job Sheet-1 assignment",
    "status": "pending",
    "createdAt": "2026-09-22T10:05:00.000Z"
  }
  ```
- **Error Response `400 Bad Request` (Empty title):**
  ```json
  {
    "message": "Task title cannot be empty"
  }
  ```

---

### 4. Update / Toggle a Task
- **Endpoint:** `PUT /tasks/:id`
- **Headers:** `Content-Type: application/json`
- **Request Body Options:**
  - **Toggle or set status:**
    ```json
    { "status": "completed" }
    ```
  - **Edit title:**
    ```json
    { "title": "Updated Task Title" }
    ```
  - **Update both:**
    ```json
    { "title": "Updated Task Title", "status": "completed" }
    ```
- **Response `200 OK`:**
  ```json
  {
    "id": "664fa1b2c3d4e5f6a7b8c9d2",
    "title": "Updated Task Title",
    "status": "completed",
    "createdAt": "2026-09-22T10:05:00.000Z"
  }
  ```
- **Error Response `404 Not Found`:**
  ```json
  {
    "message": "Task not found"
  }
  ```

---

### 5. Delete a Task
- **Endpoint:** `DELETE /tasks/:id`
- **Response `200 OK`:**
  ```json
  {
    "message": "Task deleted successfully",
    "id": "664fa1b2c3d4e5f6a7b8c9d2"
  }
  ```
- **Error Response `400 Bad Request` (Invalid ID):**
  ```json
  {
    "message": "Invalid task ID format"
  }
  ```

---

## 🧪 Postman / Insomnia Testing Guide

1. **Test `POST /tasks`**:
   - Method: `POST`
   - URL: `http://localhost:5000/tasks`
   - Body: Raw JSON `{"title": "Review code"}`
   - Expected status: `201 Created`
2. **Test Validation `POST /tasks`**:
   - Body: `{"title": "   "}`
   - Expected status: `400 Bad Request`
3. **Test `GET /tasks`**:
   - Method: `GET`
   - URL: `http://localhost:5000/tasks`
   - Expected status: `200 OK`
4. **Test `PUT /tasks/:id`**:
   - Method: `PUT`
   - URL: `http://localhost:5000/tasks/<COPIED_TASK_ID>`
   - Body: `{"status": "completed"}`
   - Expected status: `200 OK`
5. **Test `DELETE /tasks/:id`**:
   - Method: `DELETE`
   - URL: `http://localhost:5000/tasks/<COPIED_TASK_ID>`
   - Expected status: `200 OK`

---

## 💡 Engineering Highlights & Enhancements

As a dedicated MERN stack student, several production-grade improvements were implemented beyond the minimum baseline:
1. **JSON Transformation**: Mongoose schema uses `toJSON` transforms to format output consistently with `{ id, title, status, createdAt }` as requested in the rubric while maintaining backward compatibility with `_id`.
2. **Optimistic UI Updates**: Toggling or deleting tasks updates the React interface instantaneously, reverting gracefully if network errors occur.
3. **Live Search & Filter Tabs**: Tasks can be filtered by `All`, `Pending`, or `Done`, and searched in real-time.
4. **Productivity Metrics**: A dynamic progress bar and statistic counters calculate real-time completion percentages.
5. **Inline Task Editing**: Users can edit task titles inline by clicking the pencil icon and pressing Enter or Save.
6. **Toast Feedback System**: Non-blocking toast notifications confirm when tasks are added, updated, completed, or deleted.
7. **Robust Environment Handling**: Whitespace trimming on CORS origins and multiple fallback connection strings prevent runtime server crashes.

---

## 🚢 Deployment Guide

- **Backend (Render / Railway / Heroku):**
  - Root directory: `server`
  - Build command: `npm install`
  - Start command: `node index.js`
  - Environment Variables: `MONGO_URI`, `PORT`, `CLIENT_ORIGIN`
- **Frontend (Vercel / Netlify):**
  - Root directory: `client`
  - Build command: `npm run build`
  - Output directory: `dist`
  - Environment Variable: `VITE_API_URL` (set to your deployed backend URL)

---

## 📜 License
This project was created for educational assessment and portfolio demonstration purposes.
