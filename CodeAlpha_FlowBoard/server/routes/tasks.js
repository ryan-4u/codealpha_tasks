const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Task = require("../models/Task");
const Board = require("../models/Board");
const Project = require("../models/Project");
const User = require("../models/User");

// Helper — check if user is member of project that owns this board
async function getBoardAndVerify(boardId, userId) {
  const board = await Board.findById(boardId);
  if (!board) return { error: "Board not found", status: 404 };
  const project = await Project.findById(board.project);
  if (!project) return { error: "Project not found", status: 404 };
  const isMember = project.members.some(m => m.user.toString() === userId);
  if (!isMember) return { error: "Access denied", status: 403 };
  return { board, project };
}

// @route POST /api/tasks
router.post("/", auth, async (req, res) => {
  try {
    const { boardId, title, description, priority, dueDate, column } = req.body;
    if (!boardId || !title)
      return res.status(400).json({ message: "boardId and title are required" });

    const { board, project, error, status } = await getBoardAndVerify(boardId, req.user.id);
    if (error) return res.status(status).json({ message: error });

    const task = new Task({
      board: boardId,
      column: column || "todo",
      title,
      description,
      priority: priority || "medium",
      dueDate: dueDate || null,
      createdBy: req.user.id
    });
    await task.save();
    await task.populate("createdBy", "username");
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route GET /api/tasks/board/:boardId
router.get("/board/:boardId", auth, async (req, res) => {
  try {
    const { board, error, status } = await getBoardAndVerify(req.params.boardId, req.user.id);
    if (error) return res.status(status).json({ message: error });

    const tasks = await Task.find({ board: req.params.boardId })
      .populate("assignedTo", "username email")
      .populate("createdBy", "username")
      .sort({ order: 1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route PATCH /api/tasks/:id
router.patch("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const { error, status } = await getBoardAndVerify(task.board.toString(), req.user.id);
    if (error) return res.status(status).json({ message: error });

    const { title, description, priority, dueDate, column, order, assignedTo } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (column !== undefined) task.column = column;
    if (order !== undefined) task.order = order;

    // Handle assignment + notification
    // Handle assignment + notification (only notify if assignee actually changed)
    if (assignedTo !== undefined) {
      const previousAssignee = task.assignedTo?.toString();
      const newAssignee = assignedTo?.toString();
      task.assignedTo = assignedTo;

      if (
        newAssignee &&
        newAssignee !== previousAssignee &&
        newAssignee !== req.user.id
      ) {
        const assignedUser = await User.findById(assignedTo);
        const board = await Board.findById(task.board);
        if (assignedUser && board) {
          const project = await Project.findById(board.project);
          assignedUser.notifications.push({
            message: `📋 ${project?.name || "A project"} — ${req.user.username} assigned you: ${task.title}`,
            link: `/board?projectId=${board.project}`
          });
          await assignedUser.save();
        }
      }
    }

    await task.save();
    await task.populate("assignedTo", "username email");
    await task.populate("createdBy", "username");
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route DELETE /api/tasks/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const { error, status } = await getBoardAndVerify(task.board.toString(), req.user.id);
    if (error) return res.status(status).json({ message: error });

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// @route GET /api/tasks/board-by-project/:projectId
router.get("/board-by-project/:projectId", auth, async (req, res) => {
  try {
    const board = await Board.findOne({ project: req.params.projectId });
    if (!board) return res.status(404).json({ message: "Board not found" });
    res.json(board);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;