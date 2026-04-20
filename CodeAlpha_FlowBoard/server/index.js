const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/projects", require("./routes/projects"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/comments", require("./routes/comments"));

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "../public/pages/login.html")));
app.get("/register", (req, res) => res.sendFile(path.join(__dirname, "../public/pages/register.html")));
app.get("/dashboard", (req, res) => res.sendFile(path.join(__dirname, "../public/pages/dashboard.html")));
app.get("/board", (req, res) => res.sendFile(path.join(__dirname, "../public/pages/board.html")));

require("./socket/socketHandler")(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`FlowBoard running on port ${PORT}`));