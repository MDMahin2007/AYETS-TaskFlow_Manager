const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/Task");

const router = express.Router();

// GET /tasks/stats -> task statistics summary
router.get("/stats", async (req, res) => {
  try {
    const total = await Task.countDocuments();
    const completed = await Task.countDocuments({ status: "completed" });
    const pending = total - completed;
    const highPriority = await Task.countDocuments({ priority: "high", status: "pending" });

    res.status(200).json({
      total,
      completed,
      pending,
      highPriority,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch task stats", error: err.message });
  }
});

// GET /tasks -> retrieve all tasks (sorted newest first by default)
router.get("/", async (req, res) => {
  try {
    const { status, category, search, sortBy } = req.query;
    const query = {};

    if (status && ["pending", "completed"].includes(status)) {
      query.status = status;
    }

    if (category && category !== "All") {
      query.category = category;
    }

    if (search && search.trim()) {
      query.title = { $regex: search.trim(), $options: "i" };
    }

    let sort = { createdAt: -1 };
    if (sortBy === "oldest") sort = { createdAt: 1 };
    else if (sortBy === "title") sort = { title: 1 };
    else if (sortBy === "dueDate") sort = { dueDate: 1, createdAt: -1 };

    const tasks = await Task.find(query).sort(sort);
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tasks", error: err.message });
  }
});

// POST /tasks -> add a new task
router.post("/", async (req, res) => {
  try {
    const { title, priority, category, dueDate } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "Task title cannot be empty" });
    }

    const trimmedTitle = title.trim();
    if (trimmedTitle.length > 150) {
      return res
        .status(400)
        .json({ message: "Task title cannot exceed 150 characters" });
    }

    const taskPayload = { title: trimmedTitle };

    if (priority && ["low", "medium", "high"].includes(priority)) {
      taskPayload.priority = priority;
    }

    if (
      category &&
      ["General", "Work", "Personal", "Study", "Urgent"].includes(category)
    ) {
      taskPayload.category = category;
    }

    if (dueDate) {
      taskPayload.dueDate = new Date(dueDate);
    }

    const task = await Task.create(taskPayload);
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: "Failed to create task", error: err.message });
  }
});

// DELETE /tasks/completed -> bulk delete all completed tasks (MUST be before /:id)
router.delete("/completed", async (req, res) => {
  try {
    const result = await Task.deleteMany({ status: "completed" });
    res.status(200).json({
      message: `Cleared ${result.deletedCount} completed tasks`,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to clear completed tasks", error: err.message });
  }
});

// PUT /tasks/:id -> update task (mark completed, toggle, or edit title/priority/category/dueDate)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, status, priority, category, dueDate } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task ID format" });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Update title if provided
    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({ message: "Task title cannot be empty" });
      }
      const trimmedTitle = title.trim();
      if (trimmedTitle.length > 150) {
        return res
          .status(400)
          .json({ message: "Task title cannot exceed 150 characters" });
      }
      task.title = trimmedTitle;
    }

    // Update status if provided or toggle if requested
    if (status !== undefined) {
      if (!["pending", "completed"].includes(status)) {
        return res
          .status(400)
          .json({ message: "Status must be either 'pending' or 'completed'" });
      }
      task.status = status;
    } else if (title === undefined && priority === undefined && category === undefined && dueDate === undefined) {
      // If no field explicitly provided, toggle status
      task.status = task.status === "pending" ? "completed" : "pending";
    }

    // Update priority if provided
    if (priority !== undefined) {
      if (["low", "medium", "high"].includes(priority)) {
        task.priority = priority;
      }
    }

    // Update category if provided
    if (category !== undefined) {
      if (["General", "Work", "Personal", "Study", "Urgent"].includes(category)) {
        task.category = category;
      }
    }

    // Update dueDate if provided
    if (dueDate !== undefined) {
      task.dueDate = dueDate ? new Date(dueDate) : null;
    }

    await task.save();
    res.status(200).json(task);
  } catch (err) {
    res.status(400).json({ message: "Failed to update task", error: err.message });
  }
});

// DELETE /tasks/:id -> delete a specific task
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task ID format" });
    }

    const deleted = await Task.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted successfully", id });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete task", error: err.message });
  }
});

module.exports = router;

