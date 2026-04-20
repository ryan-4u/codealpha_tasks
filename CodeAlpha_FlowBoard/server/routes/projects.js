const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Project = require("../models/Project");
const Board = require("../models/Board");
const User = require("../models/User");

// @route POST /api/projects
router.post("/", auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Project name is required" });

    const project = new Project({
      name,
      description,
      owner: req.user.id,
      members: [{ user: req.user.id, role: "admin" }]
    });
    await project.save();

    // Auto-create board for this project
    const board = new Board({ project: project._id });
    await board.save();

    res.status(201).json({ project, board });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route GET /api/projects
router.get("/", auth, async (req, res) => {
  try {
    const projects = await Project.find({ "members.user": req.user.id })
      .populate("owner", "username email")
      .populate("members.user", "username email");
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route GET /api/projects/:id
router.get("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "username email")
      .populate("members.user", "username email");

    if (!project) return res.status(404).json({ message: "Project not found" });

    const isMember = project.members.some(m => m.user._id.toString() === req.user.id);
    if (!isMember) return res.status(403).json({ message: "Access denied" });

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route POST /api/projects/:id/invite
router.post("/:id/invite", auth, async (req, res) => {
  try {
    const { username } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.owner.toString() !== req.user.id)
      return res.status(403).json({ message: "Only the owner can invite members" });

    const invitedUser = await User.findOne({ username });
    if (!invitedUser) return res.status(404).json({ message: "User not found" });

    const alreadyMember = project.members.some(
      m => m.user.toString() === invitedUser._id.toString()
    );
    if (alreadyMember)
      return res.status(400).json({ message: "User is already a member" });

    project.members.push({ user: invitedUser._id, role: "member" });
    await project.save();

    // Notify invited user
    invitedUser.notifications.push({
      message: `📁 ${project.name} — ${req.user.username} added you to this project`,
      link: `/board?projectId=${project._id}`
    });
    await invitedUser.save();

    res.json({ message: `${username} added to project` });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route DELETE /api/projects/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.owner.toString() !== req.user.id)
      return res.status(403).json({ message: "Only the owner can delete this project" });

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;