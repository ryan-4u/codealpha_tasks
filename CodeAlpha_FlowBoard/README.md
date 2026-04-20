# ⬡ FlowBoard

A full-stack project management tool built for the **CodeAlpha Internship (Task 02)**. FlowBoard is a Trello/Asana-style Kanban application where teams can organize work visually using boards, columns, and task cards — with real-time collaboration powered by Socket.io.

**Live Demo:** _Deploy link here_
**Built by:** Aaryan Aggarwal | [GitHub: ryan-4u](https://github.com/ryan-4u)

---

## 📸 Screenshots

> Add screenshots of: Login page, Dashboard, Board view, Task modal, Invite modal

---

## ✨ Features

### Core
- 🔐 **JWT Authentication** — Register, login, logout with 7-day token expiry
- 📁 **Project Management** — Create projects, invite members by username search
- 📋 **Kanban Board** — Four columns: Todo → In Progress → In Review → Done
- 🃏 **Task Cards** — Title, description, priority (Low/Medium/High), due date, assignee
- 🖱️ **Drag & Drop** — Move cards between columns using HTML5 native drag events
- 💬 **Comments** — Threaded comments on every task card
- 🔔 **Notifications** — In-app notifications for task assignments, comments, and project invites
- 👥 **Member Management** — Invite members with live username search and suggestions

### Bonus
- ⚡ **Real-time Collaboration** — Socket.io syncs card movements, task updates, and comments live across all connected clients
- 🏠 **Project Rooms** — Each project board is a Socket.io room; updates are scoped correctly per project

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Real-time | Socket.io |
| Frontend | Vanilla HTML, CSS, JavaScript |
| Fonts | Google Fonts — Inter |

---

## 📁 Folder Structure

```
CodeAlpha_FlowBoard/
├── server/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── middleware/
│   │   └── auth.js               # JWT verify middleware
│   ├── models/
│   │   ├── User.js               # User + embedded notifications
│   │   ├── Project.js            # Project + members array
│   │   ├── Board.js              # Board with 4 default columns
│   │   ├── Task.js               # Task card schema
│   │   └── Comment.js            # Comment schema
│   ├── routes/
│   │   ├── auth.js               # Register, login, /me, notifications, user search
│   │   ├── projects.js           # CRUD projects + invite members
│   │   ├── tasks.js              # CRUD tasks + drag-drop column update
│   │   └── comments.js           # Add/list/delete comments
│   ├── socket/
│   │   └── socketHandler.js      # Socket.io event handlers
│   ├── seed.js                   # Seed script (12 users, 5 projects, 39 tasks, 60 comments)
│   └── index.js                  # Express + Socket.io entry point
├── public/
│   ├── css/
│   │   └── style.css             # Full dark theme stylesheet
│   ├── js/
│   │   ├── api.js                # Fetch wrapper with JWT header injection
│   │   ├── auth.js               # Login + register logic
│   │   ├── dashboard.js          # Projects dashboard + notifications
│   │   └── board.js              # Board rendering, drag-drop, modals, socket client
│   └── pages/
│       ├── login.html
│       ├── register.html
│       ├── dashboard.html
│       └── board.html
├── .env
├── .gitignore
├── package.json
└── README.md
```

---

## 🗄️ Database Schema

### Users
```
_id, username, email, password (hashed), avatar
notifications: [{ message, link, read, createdAt }]
```

### Projects
```
_id, name, description
owner: ref → User
members: [{ user: ref → User, role: "admin" | "member" }]
```

### Boards
```
_id
project: ref → Project (unique — one board per project)
columns: [{ id, title, order }]  ← 4 default columns
```

### Tasks
```
_id, title, description
board: ref → Board
column: "todo" | "inprogress" | "inreview" | "done"
priority: "low" | "medium" | "high"
dueDate, order
assignedTo: ref → User
createdBy: ref → User
```

### Comments
```
_id, content
task: ref → Task
author: ref → User
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/ryan-4u/CodeAlpha_tasks.git
cd CodeAlpha_tasks/CodeAlpha_FlowBoard

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env
# Fill in your values (see below)

# 4. Seed the database (optional but recommended)
npm run seed

# 5. Start the dev server
npm run dev
```

### Environment Variables

Create a `.env` file in the root of `CodeAlpha_FlowBoard/`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/flowboard
JWT_SECRET=your_super_secret_key_here
```

For MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string.

### Available Scripts

```bash
npm run dev      # Start with nodemon (development)
npm start        # Start with node (production)
npm run seed     # Seed database with demo data
```

---

## 🌐 API Routes

### Auth — `/api/auth`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/register` | Create new account | No |
| POST | `/login` | Login, returns JWT | No |
| GET | `/me` | Get current user | Yes |
| GET | `/search?q=` | Search users by username | Yes |
| GET | `/notifications` | Get user notifications | Yes |
| PATCH | `/notifications/read` | Mark all notifications read | Yes |

### Projects — `/api/projects`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/` | Create project (auto-creates board) | Yes |
| GET | `/` | Get all projects for current user | Yes |
| GET | `/:id` | Get single project with members | Yes |
| POST | `/:id/invite` | Invite member by username | Yes (owner only) |
| DELETE | `/:id` | Delete project | Yes (owner only) |

### Tasks — `/api/tasks`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/` | Create task on a board | Yes |
| GET | `/board/:boardId` | Get all tasks for a board | Yes |
| GET | `/board-by-project/:projectId` | Get board by project ID | Yes |
| PATCH | `/:id` | Update task (incl. column move) | Yes |
| DELETE | `/:id` | Delete task | Yes |

### Comments — `/api/comments`
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/` | Add comment to task | Yes |
| GET | `/:taskId` | Get all comments for a task | Yes |
| DELETE | `/:id` | Delete own comment | Yes |

---

## ⚡ Real-time Events (Socket.io)

| Event | Direction | Payload |
|---|---|---|
| `joinBoard` | Client → Server | `projectId` |
| `taskCreated` | Client ↔ Server | task object |
| `taskMoved` | Client ↔ Server | `{ projectId, taskId, column }` |
| `taskUpdated` | Client ↔ Server | task object |
| `taskDeleted` | Client ↔ Server | `{ projectId, taskId }` |
| `newComment` | Client ↔ Server | `{ projectId, taskId, comment }` |

Each project board is a Socket.io room. Updates are broadcast to all members in the room except the sender.

---

## 🧪 Demo Accounts

After running `npm run seed`:

| Username | Email | Password |
|---|---|---|
| aaryan | aaryan@test.com | password123 |
| rahul | rahul@test.com | password123 |
| priya | priya@test.com | password123 |
| arjun | arjun@test.com | password123 |
| sneha | sneha@test.com | password123 |
| vikram | vikram@test.com | password123 |
| neha | neha@test.com | password123 |
| rohan | rohan@test.com | password123 |
| ananya | ananya@test.com | password123 |
| karan | karan@test.com | password123 |
| divya | divya@test.com | password123 |
| mohit | mohit@test.com | password123 |

Seed data includes **5 projects**, **39 tasks** across all columns, **60 comments**, and **15 notifications**.

---

## 🧠 Key Implementation Details

**Why embedded notifications?**
Notifications are stored as an embedded array inside the User document rather than a separate collection. At this scale it keeps queries simple — one `findById` returns the user and all their notifications together.

**Drag and drop without libraries**
Card movement uses the native HTML5 Drag and Drop API (`ondragstart`, `ondragover`, `ondrop`). No external library needed. The column ID is passed on drop, a PATCH request updates MongoDB, and a Socket.io event syncs all other clients.

**Socket.io room scoping**
When a user opens a board, the client emits `joinBoard` with the `projectId`. The server joins that socket to a room named after the project. All board events are broadcast with `socket.to(projectId).emit(...)` — meaning only members viewing that specific board receive updates.

**Assignment notification deduplication**
The PATCH route checks whether `assignedTo` actually changed before pushing a notification. This prevents duplicate notifications when a task is saved without changing the assignee.

---

## 👨‍💻 Author

**Aaryan Aggarwal**
- GitHub: [@ryan-4u](https://github.com/ryan-4u)
- Portfolio: [aaryan-aggrawa-v1.netlify.app](https://aaryan-aggrawa-v1.netlify.app)
- Email: aaryanaggrawa.dev@gmail.com

---

## 📄 License

This project was built as part of the **CodeAlpha Web Development Internship**.
Feel free to use it as a reference or learning resource.