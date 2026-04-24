# DevCircle

A dark-themed developer social media platform built with the MERN stack.

> CodeAlpha Internship • Task 01 • Full Stack • MERN

---

## About

DevCircle is a mini social media platform designed for developers. Built as Task 01 of the CodeAlpha internship, it features a GitHub-inspired dark UI with a complete social experience — posts, comments, likes, follows, notifications, and profile management with link sharing.

---

## Features

### Auth
- JWT-based authentication (register & login)
- Secure password hashing with bcryptjs
- Protected routes on both frontend and backend

### Posts
- Create text posts with optional image upload (Cloudinary)
- Like / Unlike posts with live count
- Delete your own posts
- @ mention autocomplete when writing posts

### Comments
- Add comments on any post
- @ mention autocomplete in comment box
- Delete your own comments
- Username shown on every comment card

### Profiles
- User profile with avatar, bio, stats (posts, followers, following)
- Edit profile — name, bio (300 char / 5 line limit), avatar upload
- Add and delete custom links (GitHub, LinkedIn, portfolio, etc.)
- Feed sidebar shows your top 5 links
- Email visible only on your own profile

### Social
- Follow / Unfollow users
- Who to Follow suggestions in feed sidebar
- User search with live results in navbar

### Notifications
- Bell icon in navbar with unread badge count
- Notifications for likes, comments, follows, and mentions
- Auto-expires after 14 days (MongoDB TTL index)
- Mark all as read, popup dropdown UI

---

## Tech Stack

### Frontend
- HTML5, CSS3, Vanilla JavaScript
- Syne (display font) + JetBrains Mono (code font)
- GitHub-dark inspired color palette
- Responsive layout with CSS Grid and Flexbox

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT for authentication
- Cloudinary + Multer for image uploads
- bcryptjs for password hashing

---

## Project Structure
CodeAlpha_DevCircle/
├── backend/
│   ├── config/          # Cloudinary setup
│   ├── middleware/       # JWT auth middleware
│   ├── models/           # User, Post, Comment, Notification
│   ├── routes/           # auth, users, posts, comments, notifications
│   ├── seed.js           # Seed data with 10 dev community profiles
│   └── server.js
├── frontend/
│   ├── css/style.css
│   ├── js/               # api, auth, feed, profile, post, notifications
│   ├── index.html        # Login / Register
│   ├── feed.html
│   ├── profile.html
│   └── post.html
├── package.json          # Root — starts both with concurrently
└── .gitignore
---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Cloudinary account

### Installation

1. Clone the repo and navigate into the project folder
2. Install root dependencies:
```bash
   npm install
```
3. Install backend dependencies:
```bash
   cd backend && npm install
```
4. Create `backend/.env` with the following:
```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
```
5. (Optional) Seed the database:
```bash
   cd backend && node seed.js
```
6. Start the app from root:
```bash
   npm start
```
7. Open `http://127.0.0.1:5500` in your browser

---

## Seed Data

Run `node seed.js` inside `backend/` to populate the database with 10 real developer community profiles — Theo Browne, Fireship, Brad Traversy, Kevin Powell, Tanay Pratap, Kunal Kushwaha, Hitesh Choudhary, Piyush Garg, Josh Werner, and your own profile — along with 20 posts, follows, likes, and comments.

**All seed users password:** `Test@2026`

---

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default 5000) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |

---

## Author

**Aaryan Aggrawa** • [GitHub](https://github.com/ryan-4u) • [Instagram](https://instagram.com/aaryan.0to1) • aaryanaggrawa.dev@gmail.com

---

## License

MIT