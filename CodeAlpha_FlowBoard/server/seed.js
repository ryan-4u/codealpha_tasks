require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");
const Project = require("./models/Project");
const Board = require("./models/Board");
const Task = require("./models/Task");
const Comment = require("./models/Comment");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  await User.deleteMany();
  await Project.deleteMany();
  await Board.deleteMany();
  await Task.deleteMany();
  await Comment.deleteMany();
  console.log("Cleared existing data");

  const salt = await bcrypt.genSalt(10);
  const hp = (pw) => bcrypt.hash(pw, salt);

  // ── 12 USERS ──────────────────────────────────────────────
  const [aaryan, rahul, priya, arjun, sneha, vikram,
         neha, rohan, ananya, karan, divya, mohit] = await User.insertMany([
    { username: "aaryan",  email: "aaryan@test.com",  password: await hp("password123") },
    { username: "rahul",   email: "rahul@test.com",   password: await hp("password123") },
    { username: "priya",   email: "priya@test.com",   password: await hp("password123") },
    { username: "arjun",   email: "arjun@test.com",   password: await hp("password123") },
    { username: "sneha",   email: "sneha@test.com",   password: await hp("password123") },
    { username: "vikram",  email: "vikram@test.com",  password: await hp("password123") },
    { username: "neha",    email: "neha@test.com",    password: await hp("password123") },
    { username: "rohan",   email: "rohan@test.com",   password: await hp("password123") },
    { username: "ananya",  email: "ananya@test.com",  password: await hp("password123") },
    { username: "karan",   email: "karan@test.com",   password: await hp("password123") },
    { username: "divya",   email: "divya@test.com",   password: await hp("password123") },
    { username: "mohit",   email: "mohit@test.com",   password: await hp("password123") },
  ]);
  console.log("Created 12 users");

  // ── 5 PROJECTS ────────────────────────────────────────────
  const p1 = await Project.create({
    name: "FlowBoard Dev",
    description: "Building the FlowBoard project management tool for CodeAlpha internship",
    owner: aaryan._id,
    members: [
      { user: aaryan._id,  role: "admin" },
      { user: rahul._id,   role: "member" },
      { user: priya._id,   role: "member" },
      { user: arjun._id,   role: "member" },
      { user: sneha._id,   role: "member" },
    ]
  });

  const p2 = await Project.create({
    name: "EduTrack LMS",
    description: "Learning management system for colleges — attendance, grades, timetable",
    owner: vikram._id,
    members: [
      { user: vikram._id,  role: "admin" },
      { user: neha._id,    role: "member" },
      { user: rohan._id,   role: "member" },
      { user: aaryan._id,  role: "member" },
      { user: karan._id,   role: "member" },
    ]
  });

  const p3 = await Project.create({
    name: "ShopNest E-Commerce",
    description: "Full stack e-commerce platform with cart, orders, and payment integration",
    owner: priya._id,
    members: [
      { user: priya._id,   role: "admin" },
      { user: ananya._id,  role: "member" },
      { user: divya._id,   role: "member" },
      { user: mohit._id,   role: "member" },
      { user: rahul._id,   role: "member" },
    ]
  });

  const p4 = await Project.create({
    name: "DevCircle Social",
    description: "Developer social media platform — posts, follows, likes, real-time chat",
    owner: arjun._id,
    members: [
      { user: arjun._id,   role: "admin" },
      { user: sneha._id,   role: "member" },
      { user: karan._id,   role: "member" },
      { user: rohan._id,   role: "member" },
      { user: aaryan._id,  role: "member" },
    ]
  });

  const p5 = await Project.create({
    name: "HealthPulse App",
    description: "Healthcare app for appointment booking, records, and doctor dashboards",
    owner: neha._id,
    members: [
      { user: neha._id,    role: "admin" },
      { user: divya._id,   role: "member" },
      { user: mohit._id,   role: "member" },
      { user: ananya._id,  role: "member" },
      { user: vikram._id,  role: "member" },
    ]
  });

  console.log("Created 5 projects");

  // ── BOARDS ────────────────────────────────────────────────
  const [b1, b2, b3, b4, b5] = await Board.insertMany([
    { project: p1._id },
    { project: p2._id },
    { project: p3._id },
    { project: p4._id },
    { project: p5._id },
  ]);
  console.log("Created 5 boards");

  // ── TASKS: PROJECT 1 — FlowBoard Dev ─────────────────────
  const p1tasks = await Task.insertMany([
    { board: b1._id, column: "done",       title: "Initialize repo and folder structure",     description: "Set up Express, MongoDB, folder layout, .env, nodemon",                           priority: "low",    createdBy: aaryan._id, assignedTo: aaryan._id },
    { board: b1._id, column: "done",       title: "Design database schema",                   description: "Plan all 5 collections: User, Project, Board, Task, Comment with relationships", priority: "high",   createdBy: aaryan._id, assignedTo: aaryan._id },
    { board: b1._id, column: "done",       title: "Build JWT auth routes",                    description: "Register, login, /me endpoint, JWT middleware",                                    priority: "high",   createdBy: aaryan._id, assignedTo: rahul._id  },
    { board: b1._id, column: "done",       title: "Create Mongoose models",                   description: "User, Project, Board, Task, Comment schemas",                                      priority: "medium", createdBy: rahul._id,  assignedTo: rahul._id  },
    { board: b1._id, column: "inreview",   title: "Project and board API routes",             description: "CRUD for projects, invite members, auto-create board on project creation",         priority: "high",   createdBy: aaryan._id, assignedTo: arjun._id, dueDate: new Date(Date.now() + 1 * 86400000) },
    { board: b1._id, column: "inreview",   title: "Task API with column movement",            description: "Create, update, delete tasks. PATCH for column drag-drop",                         priority: "high",   createdBy: arjun._id,  assignedTo: priya._id, dueDate: new Date(Date.now() + 2 * 86400000) },
    { board: b1._id, column: "inprogress", title: "Kanban board frontend",                    description: "Four columns, task cards, drag and drop using HTML5 drag events",                  priority: "high",   createdBy: priya._id,  assignedTo: priya._id, dueDate: new Date(Date.now() + 3 * 86400000) },
    { board: b1._id, column: "inprogress", title: "Task modal with comments",                 description: "Click card to open modal, edit all fields, add comments inline",                   priority: "medium", createdBy: sneha._id,  assignedTo: sneha._id, dueDate: new Date(Date.now() + 4 * 86400000) },
    { board: b1._id, column: "inprogress", title: "Socket.io real-time sync",                 description: "Live card movement, task create/update/delete, comment sync across clients",       priority: "high",   createdBy: aaryan._id, assignedTo: rahul._id, dueDate: new Date(Date.now() + 2 * 86400000) },
    { board: b1._id, column: "todo",       title: "Notification system",                      description: "In-app notifications for task assignment and comments",                             priority: "medium", createdBy: rahul._id,  assignedTo: arjun._id, dueDate: new Date(Date.now() + 5 * 86400000) },
    { board: b1._id, column: "todo",       title: "Write README and deploy to Render",        description: "Document setup steps, features, API routes. Deploy backend + static frontend",     priority: "low",    createdBy: aaryan._id, assignedTo: aaryan._id, dueDate: new Date(Date.now() + 7 * 86400000) },
  ]);

  // ── TASKS: PROJECT 2 — EduTrack LMS ──────────────────────
  const p2tasks = await Task.insertMany([
    { board: b2._id, column: "done",       title: "Setup authentication system",              description: "Role-based auth: student, teacher, admin roles with JWT",                          priority: "high",   createdBy: vikram._id, assignedTo: vikram._id },
    { board: b2._id, column: "done",       title: "Student registration module",              description: "Form, validation, enrollment number generation",                                    priority: "medium", createdBy: neha._id,   assignedTo: neha._id   },
    { board: b2._id, column: "inreview",   title: "Attendance tracking system",               description: "Teacher marks attendance per subject per day, student can view history",           priority: "high",   createdBy: vikram._id, assignedTo: rohan._id, dueDate: new Date(Date.now() + 2 * 86400000) },
    { board: b2._id, column: "inreview",   title: "Timetable management",                     description: "Admin creates timetable, students and teachers see their schedule",                 priority: "medium", createdBy: rohan._id,  assignedTo: karan._id, dueDate: new Date(Date.now() + 3 * 86400000) },
    { board: b2._id, column: "inprogress", title: "Grade entry and report cards",             description: "Teachers enter marks, system calculates grade and percentage",                      priority: "high",   createdBy: neha._id,   assignedTo: vikram._id, dueDate: new Date(Date.now() + 4 * 86400000) },
    { board: b2._id, column: "inprogress", title: "Student dashboard UI",                     description: "Shows attendance %, upcoming classes, recent grades, announcements",               priority: "medium", createdBy: karan._id,  assignedTo: aaryan._id, dueDate: new Date(Date.now() + 5 * 86400000) },
    { board: b2._id, column: "todo",       title: "Notice board and announcements",           description: "Admin posts notices, students see them on dashboard with date filter",             priority: "low",    createdBy: vikram._id, assignedTo: neha._id,  dueDate: new Date(Date.now() + 6 * 86400000) },
    { board: b2._id, column: "todo",       title: "Mobile responsive UI",                     description: "Make all pages work on mobile using CSS grid and flexbox",                         priority: "medium", createdBy: aaryan._id, assignedTo: karan._id, dueDate: new Date(Date.now() + 8 * 86400000) },
  ]);

  // ── TASKS: PROJECT 3 — ShopNest ───────────────────────────
  const p3tasks = await Task.insertMany([
    { board: b3._id, column: "done",       title: "Product catalog and categories",           description: "List products with filters, search, pagination",                                    priority: "high",   createdBy: priya._id,  assignedTo: priya._id  },
    { board: b3._id, column: "done",       title: "User auth and profile",                    description: "Register, login, profile edit, address management",                                 priority: "high",   createdBy: rahul._id,  assignedTo: rahul._id  },
    { board: b3._id, column: "inreview",   title: "Shopping cart functionality",              description: "Add to cart, update quantity, remove items, persist across sessions",              priority: "high",   createdBy: priya._id,  assignedTo: ananya._id, dueDate: new Date(Date.now() + 1 * 86400000) },
    { board: b3._id, column: "inreview",   title: "Order management system",                  description: "Place order, track status, order history, invoice generation",                      priority: "high",   createdBy: ananya._id, assignedTo: divya._id, dueDate: new Date(Date.now() + 2 * 86400000) },
    { board: b3._id, column: "inprogress", title: "Payment gateway integration",              description: "Integrate Razorpay for payments, handle success/failure webhooks",                  priority: "high",   createdBy: mohit._id,  assignedTo: mohit._id, dueDate: new Date(Date.now() + 3 * 86400000) },
    { board: b3._id, column: "inprogress", title: "Admin product dashboard",                  description: "Add, edit, delete products. Manage inventory and pricing",                         priority: "medium", createdBy: priya._id,  assignedTo: rahul._id, dueDate: new Date(Date.now() + 4 * 86400000) },
    { board: b3._id, column: "todo",       title: "Product reviews and ratings",              description: "Users can rate and review purchased products. Avg rating shown on listing",        priority: "low",    createdBy: divya._id,  assignedTo: ananya._id, dueDate: new Date(Date.now() + 6 * 86400000) },
    { board: b3._id, column: "todo",       title: "Email notifications for orders",           description: "Send confirmation, shipping, delivery emails using Nodemailer",                     priority: "medium", createdBy: rahul._id,  assignedTo: mohit._id, dueDate: new Date(Date.now() + 7 * 86400000) },
  ]);

  // ── TASKS: PROJECT 4 — DevCircle ─────────────────────────
  const p4tasks = await Task.insertMany([
    { board: b4._id, column: "done",       title: "User profiles and follow system",          description: "Profile page, follow/unfollow, follower count, following list",                    priority: "high",   createdBy: arjun._id,  assignedTo: arjun._id  },
    { board: b4._id, column: "done",       title: "Post creation with code snippets",         description: "Rich text post with syntax highlighted code blocks using highlight.js",            priority: "high",   createdBy: sneha._id,  assignedTo: sneha._id  },
    { board: b4._id, column: "inreview",   title: "Like and comment on posts",                description: "Like toggle, threaded comments, notification on interaction",                       priority: "medium", createdBy: karan._id,  assignedTo: rohan._id, dueDate: new Date(Date.now() + 2 * 86400000) },
    { board: b4._id, column: "inreview",   title: "Real-time notifications",                  description: "Socket.io notifications for likes, comments, follows",                              priority: "high",   createdBy: arjun._id,  assignedTo: karan._id, dueDate: new Date(Date.now() + 3 * 86400000) },
    { board: b4._id, column: "inprogress", title: "Direct messaging system",                  description: "Real-time DMs between users using Socket.io rooms",                                priority: "high",   createdBy: rohan._id,  assignedTo: arjun._id, dueDate: new Date(Date.now() + 4 * 86400000) },
    { board: b4._id, column: "inprogress", title: "Explore and trending feed",                description: "Algorithm-based feed showing trending posts and suggested users",                   priority: "medium", createdBy: sneha._id,  assignedTo: sneha._id, dueDate: new Date(Date.now() + 5 * 86400000) },
    { board: b4._id, column: "todo",       title: "GitHub integration",                       description: "Connect GitHub account, show pinned repos on profile",                             priority: "low",    createdBy: aaryan._id, assignedTo: rohan._id, dueDate: new Date(Date.now() + 7 * 86400000) },
    { board: b4._id, column: "todo",       title: "Deploy to Render with CI/CD",              description: "GitHub Actions pipeline for auto deploy on push to main",                          priority: "medium", createdBy: arjun._id,  assignedTo: aaryan._id, dueDate: new Date(Date.now() + 9 * 86400000) },
  ]);

  // ── TASKS: PROJECT 5 — HealthPulse ───────────────────────
  const p5tasks = await Task.insertMany([
    { board: b5._id, column: "done",       title: "Doctor and patient auth",                  description: "Separate login flows for doctors and patients with role-based access",             priority: "high",   createdBy: neha._id,   assignedTo: neha._id   },
    { board: b5._id, column: "done",       title: "Doctor profile and availability",          description: "Doctor sets available slots, specialization, fee per consultation",                 priority: "high",   createdBy: divya._id,  assignedTo: divya._id  },
    { board: b5._id, column: "inreview",   title: "Appointment booking system",               description: "Patient books slot, doctor confirms or rejects, both get notified",                priority: "high",   createdBy: neha._id,   assignedTo: mohit._id, dueDate: new Date(Date.now() + 2 * 86400000) },
    { board: b5._id, column: "inreview",   title: "Patient medical records",                  description: "Upload and view prescriptions, lab reports, visit history",                        priority: "high",   createdBy: mohit._id,  assignedTo: ananya._id, dueDate: new Date(Date.now() + 3 * 86400000) },
    { board: b5._id, column: "inprogress", title: "Video consultation feature",               description: "WebRTC based video call between doctor and patient for teleconsult",               priority: "high",   createdBy: vikram._id, assignedTo: vikram._id, dueDate: new Date(Date.now() + 4 * 86400000) },
    { board: b5._id, column: "inprogress", title: "Prescription generation",                  description: "Doctor fills digital prescription form, patient can download as PDF",              priority: "medium", createdBy: neha._id,   assignedTo: divya._id, dueDate: new Date(Date.now() + 5 * 86400000) },
    { board: b5._id, column: "todo",       title: "Medicine reminder notifications",          description: "Patient sets medicine reminders, app sends push notifications",                     priority: "medium", createdBy: ananya._id, assignedTo: mohit._id, dueDate: new Date(Date.now() + 6 * 86400000) },
    { board: b5._id, column: "todo",       title: "Admin analytics dashboard",                description: "Total appointments, revenue, top doctors, patient demographics charts",            priority: "low",    createdBy: vikram._id, assignedTo: neha._id,  dueDate: new Date(Date.now() + 8 * 86400000) },
  ]);

  console.log("Created 39 tasks across 5 projects");

  // ── COMMENTS ──────────────────────────────────────────────
  await Comment.insertMany([
    // FlowBoard Dev
    { task: p1tasks[2]._id, author: rahul._id,  content: "JWT middleware is done. Using Bearer token pattern, same as DevCircle." },
    { task: p1tasks[2]._id, author: aaryan._id, content: "Good. Make sure token expiry is 7 days. We don't want users logged out too fast." },
    { task: p1tasks[2]._id, author: priya._id,  content: "Should we add refresh tokens later? Could be a good bonus feature." },
    { task: p1tasks[2]._id, author: rahul._id,  content: "Let's keep it simple for the internship deadline. Can add refresh tokens post-submission." },

    { task: p1tasks[6]._id, author: priya._id,  content: "HTML5 drag events are working. ondragstart and ondrop handlers set up on cards and columns." },
    { task: p1tasks[6]._id, author: arjun._id,  content: "Nice. Does it persist to DB after drag? Or just visual?" },
    { task: p1tasks[6]._id, author: priya._id,  content: "Yes, PATCH request fires after drop to update the column field in MongoDB." },
    { task: p1tasks[6]._id, author: aaryan._id, content: "Perfect. Make sure socket emits taskMoved so other clients update too." },
    { task: p1tasks[6]._id, author: sneha._id,  content: "Tested on two tabs — card moves live on both. Socket is working." },

    { task: p1tasks[8]._id, author: rahul._id,  content: "Socket rooms are working. Each project gets its own room via joinBoard event." },
    { task: p1tasks[8]._id, author: aaryan._id, content: "Excellent. Test with three clients to make sure broadcast excludes the sender." },
    { task: p1tasks[8]._id, author: rahul._id,  content: "Confirmed. socket.to(room).emit skips the sender correctly." },
    { task: p1tasks[8]._id, author: arjun._id,  content: "This is the best part of the project honestly. Real-time is always impressive in demos." },

    { task: p1tasks[4]._id, author: arjun._id,  content: "Invite endpoint done. It pushes a notification to the invited user's array." },
    { task: p1tasks[4]._id, author: aaryan._id, content: "Make sure only the project owner can invite. Add that check in the route." },
    { task: p1tasks[4]._id, author: arjun._id,  content: "Already handled — checking project.owner.toString() === req.user.id before allowing invite." },

    // EduTrack LMS
    { task: p2tasks[2]._id, author: rohan._id,  content: "Attendance model done — subject, date, studentId, status: present/absent/late." },
    { task: p2tasks[2]._id, author: vikram._id, content: "Good. Add an aggregate query to calculate attendance percentage per subject." },
    { task: p2tasks[2]._id, author: rohan._id,  content: "Done. Using MongoDB $group and $sum. Returns percentage per student per subject." },
    { task: p2tasks[2]._id, author: karan._id,  content: "Should we show an alert if attendance drops below 75%?" },
    { task: p2tasks[2]._id, author: vikram._id, content: "Yes, add a warning badge on the student dashboard when below threshold." },

    { task: p2tasks[4]._id, author: vikram._id, content: "Grade schema: studentId, subjectId, marks[], maxMarks, grade calculated automatically." },
    { task: p2tasks[4]._id, author: neha._id,   content: "What grading scale are we using? 10-point CGPA or percentage?" },
    { task: p2tasks[4]._id, author: vikram._id, content: "Percentage for now. CGPA conversion can be added later." },
    { task: p2tasks[4]._id, author: aaryan._id, content: "Make the report card downloadable as PDF. Students will love that feature." },

    { task: p2tasks[5]._id, author: aaryan._id, content: "Dashboard layout done. Using CSS grid for the widget cards." },
    { task: p2tasks[5]._id, author: karan._id,  content: "Looks clean. Can we add a quick timetable preview widget on the dashboard too?" },
    { task: p2tasks[5]._id, author: aaryan._id, content: "Good idea. Added today's schedule as a side panel." },

    // ShopNest
    { task: p3tasks[2]._id, author: ananya._id, content: "Cart is persisted in localStorage for guest users and MongoDB for logged-in users." },
    { task: p3tasks[2]._id, author: priya._id,  content: "Smart. Make sure we merge the localStorage cart when a guest logs in." },
    { task: p3tasks[2]._id, author: ananya._id, content: "Yes, on login we check localStorage, push items to DB cart, then clear localStorage." },
    { task: p3tasks[2]._id, author: rahul._id,  content: "Edge case — what if the same item is in both? Take the higher quantity?" },
    { task: p3tasks[2]._id, author: ananya._id, content: "Good catch. We sum the quantities and cap at available stock." },

    { task: p3tasks[4]._id, author: mohit._id,  content: "Razorpay test mode integrated. Payment modal opens, processes test card successfully." },
    { task: p3tasks[4]._id, author: priya._id,  content: "Make sure you verify the payment signature on the backend before marking order as paid." },
    { task: p3tasks[4]._id, author: mohit._id,  content: "Yes, using crypto.createHmac to verify Razorpay signature. Order only confirmed after verification." },
    { task: p3tasks[4]._id, author: divya._id,  content: "Should we store the Razorpay payment ID with the order for refund tracking?" },
    { task: p3tasks[4]._id, author: mohit._id,  content: "Absolutely. Added razorpayPaymentId and razorpayOrderId fields to the Order model." },

    { task: p3tasks[3]._id, author: divya._id,  content: "Order statuses: pending, confirmed, shipped, delivered, cancelled." },
    { task: p3tasks[3]._id, author: ananya._id, content: "Add an estimated delivery date field. Users always want to know when it arrives." },
    { task: p3tasks[3]._id, author: divya._id,  content: "Added. Calculated as order date + 5 business days by default." },

    // DevCircle
    { task: p4tasks[2]._id, author: rohan._id,  content: "Like toggle done. Uses $addToSet and $pull on the likes array to avoid duplicates." },
    { task: p4tasks[2]._id, author: karan._id,  content: "Smart approach. Much cleaner than a separate Likes collection for this scale." },
    { task: p4tasks[2]._id, author: arjun._id,  content: "Agreed. If we scale to millions of posts we'd reconsider, but this works perfectly now." },

    { task: p4tasks[4]._id, author: arjun._id,  content: "DM rooms created as Socket.io rooms with ID = sorted concatenation of both user IDs." },
    { task: p4tasks[4]._id, author: rohan._id,  content: "Good pattern. Sorting ensures the same room ID regardless of who initiates." },
    { task: p4tasks[4]._id, author: sneha._id,  content: "Are messages persisted to DB or just real-time?" },
    { task: p4tasks[4]._id, author: arjun._id,  content: "Both. Socket delivers instantly, and we also save to Message collection for history." },
    { task: p4tasks[4]._id, author: karan._id,  content: "Make sure to add pagination when loading message history. Don't fetch all messages at once." },

    { task: p4tasks[3]._id, author: karan._id,  content: "Real-time notification bell working. Badge count updates without page refresh." },
    { task: p4tasks[3]._id, author: sneha._id,  content: "Looks great in the demo. The red badge is very satisfying to click." },
    { task: p4tasks[3]._id, author: arjun._id,  content: "Make sure notifications are marked read when the dropdown is opened, not just when clicked." },

    // HealthPulse
    { task: p5tasks[2]._id, author: mohit._id,  content: "Booking flow: patient selects doctor → picks date → picks available slot → confirms." },
    { task: p5tasks[2]._id, author: neha._id,   content: "What happens to the slot if the doctor rejects the appointment?" },
    { task: p5tasks[2]._id, author: mohit._id,  content: "Slot is freed back and patient gets a notification with rejection reason." },
    { task: p5tasks[2]._id, author: ananya._id, content: "Should we allow patients to reschedule instead of just cancel/rebook?" },
    { task: p5tasks[2]._id, author: neha._id,   content: "Good point. Added reschedule option — it cancels current and opens booking flow again." },

    { task: p5tasks[4]._id, author: vikram._id, content: "WebRTC signaling server setup using Socket.io. ICE candidates exchanged successfully." },
    { task: p5tasks[4]._id, author: divya._id,  content: "Video quality looks good in testing. Are we adding screen share?" },
    { task: p5tasks[4]._id, author: vikram._id, content: "Not in this phase. Screen share can be a v2 feature. Keeping scope clean." },
    { task: p5tasks[4]._id, author: mohit._id,  content: "Make sure the call ends gracefully if either user closes the tab." },
    { task: p5tasks[4]._id, author: vikram._id, content: "Handled via socket disconnect event — both sides get a callEnded notification." },

    { task: p5tasks[5]._id, author: divya._id,  content: "Prescription PDF generated using pdfkit. Includes doctor name, date, medicines, dosage." },
    { task: p5tasks[5]._id, author: neha._id,   content: "Add the clinic logo and doctor registration number to the PDF header." },
    { task: p5tasks[5]._id, author: divya._id,  content: "Done. Also added a QR code linking to the digital prescription for verification." },
  ]);

  console.log("Created 60 comments across all projects");

  // ── NOTIFICATIONS ─────────────────────────────────────────
  const notifUpdates = [
    { user: rahul._id,  message: "You were assigned a task: Build JWT auth routes",           link: `/board?projectId=${p1._id}` },
    { user: arjun._id,  message: "You were assigned a task: Project and board API routes",    link: `/board?projectId=${p1._id}` },
    { user: priya._id,  message: "You were assigned a task: Task API with column movement",   link: `/board?projectId=${p1._id}` },
    { user: sneha._id,  message: "You were assigned a task: Task modal with comments",        link: `/board?projectId=${p1._id}` },
    { user: rohan._id,  message: "You were assigned a task: Attendance tracking system",      link: `/board?projectId=${p2._id}` },
    { user: aaryan._id, message: "You were assigned a task: Student dashboard UI",            link: `/board?projectId=${p2._id}` },
    { user: ananya._id, message: "You were assigned a task: Shopping cart functionality",     link: `/board?projectId=${p3._id}` },
    { user: mohit._id,  message: "You were assigned a task: Payment gateway integration",     link: `/board?projectId=${p3._id}` },
    { user: karan._id,  message: "You were assigned a task: Real-time notifications",         link: `/board?projectId=${p4._id}` },
    { user: vikram._id, message: "You were assigned a task: Video consultation feature",      link: `/board?projectId=${p5._id}` },
    { user: aaryan._id, message: "aaryan commented on your task: Student dashboard UI",       link: `/board?projectId=${p2._id}` },
    { user: priya._id,  message: "arjun commented on your task: Task API with column movement", link: `/board?projectId=${p1._id}` },
    { user: neha._id,   message: "You were added to project: FlowBoard Dev",                  link: `/board?projectId=${p1._id}` },
    { user: mohit._id,  message: "priya commented on your task: Payment gateway integration", link: `/board?projectId=${p3._id}` },
    { user: rohan._id,  message: "arjun commented on your task: Like and comment on posts",   link: `/board?projectId=${p4._id}` },
  ];

  for (const n of notifUpdates) {
    await User.findByIdAndUpdate(n.user, {
      $push: { notifications: { message: n.message, link: n.link, read: false } }
    });
  }

  console.log("Created 15 notifications");
  console.log("\n✅ Seed complete!\n");
  console.log("Login credentials (all passwords: password123):");
  console.log("─────────────────────────────────────────────");
  console.log("  aaryan@test.com   vikram@test.com");
  console.log("  rahul@test.com    neha@test.com");
  console.log("  priya@test.com    rohan@test.com");
  console.log("  arjun@test.com    ananya@test.com");
  console.log("  sneha@test.com    karan@test.com");
  console.log("                    divya@test.com");
  console.log("                    mohit@test.com");
  console.log("─────────────────────────────────────────────");
  console.log("5 projects | 39 tasks | 60 comments | 15 notifications\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});