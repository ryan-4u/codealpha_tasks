const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Comment = require("../models/Comment");
const Task = require("../models/Task");
const Board = require("../models/Board");
const Project = require("../models/Project");
const User = require("../models/User");

// @route POST /api/comments
router.post("/", auth, async (req, res) => {
  try {
    const { taskId, content } = req.body;
    if (!taskId || !content)
      return res.status(400).json({ message: "taskId and content are required" });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const board = await Board.findById(task.board);
    const project = await Project.findById(board.project);
    const isMember = project.members.some(m => m.user.toString() === req.user.id);
    if (!isMember) return res.status(403).json({ message: "Access denied" });

    const comment = new Comment({ task: taskId, author: req.user.id, content });
    await comment.save();
    await comment.populate("author", "username");

    // Notify task creator if someone else comments
    if (task.createdBy.toString() !== req.user.id) {
      const taskOwner = await User.findById(task.createdBy);
      if (taskOwner) {
        const board = await Board.findById(task.board);
        taskOwner.notifications.push({
          message: `💬 ${board ? await Project.findById(board.project).then(p => p?.name) : "A project"} — ${req.user.username} commented on: ${task.title}`,
          link: `/board?projectId=${board?.project}`
        });
        await taskOwner.save();
      }
    }

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route GET /api/comments/:taskId
router.get("/:taskId", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const comments = await Comment.find({ task: req.params.taskId })
      .populate("author", "username")
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route DELETE /api/comments/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: "Comment not found" });
    if (comment.author.toString() !== req.user.id)
      return res.status(403).json({ message: "You can only delete your own comments" });

    await Comment.findByIdAndDelete(req.params.id);
    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;