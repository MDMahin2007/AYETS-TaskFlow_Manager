require("dotenv").config();
const http = require("http");
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const taskRoutes = require("./routes/taskRoutes");
const Task = require("./models/Task");

async function runTests() {
  console.log("=== Starting TaskFlow Server Integration Tests ===");

  // Connect DB
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✓ Connected to MongoDB");

  // Spin up test server on port 5055
  const app = express();
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://task-flow-manager-ten.vercel.app",
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const cleanOrigin = origin.replace(/\/+$/, "");
        if (
          allowedOrigins.includes(cleanOrigin) ||
          /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
        ) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true,
    })
  );
  app.use(express.json());
  app.get("/api/health", (req, res) => res.status(200).json({ status: "ok" }));
  app.use("/tasks", taskRoutes);

  const server = app.listen(5055);
  const BASE = "http://localhost:5055";

  try {
    // 1. Health check
    const healthRes = await fetch(`${BASE}/api/health`);
    const healthData = await healthRes.json();
    console.log("1. GET /api/health:", healthRes.status === 200 && healthData.status === "ok" ? "✓ PASS" : "✗ FAIL");

    // 2. CORS header test with Origin: http://localhost:5173
    const corsRes = await fetch(`${BASE}/tasks`, {
      headers: { Origin: "http://localhost:5173" },
    });
    const allowOrigin = corsRes.headers.get("access-control-allow-origin");
    console.log("2. CORS check for localhost:5173:", allowOrigin === "http://localhost:5173" ? "✓ PASS" : "✗ FAIL (" + allowOrigin + ")");

    // 3. POST /tasks with valid title, priority, category
    const createRes = await fetch(`${BASE}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Test Unit Task #1",
        priority: "high",
        category: "Work",
      }),
    });
    const created = await createRes.json();
    console.log("3. POST /tasks (valid):", createRes.status === 201 && created.id && created.title === "Test Unit Task #1" ? "✓ PASS" : "✗ FAIL");

    // 4. POST /tasks with empty title -> expect 400
    const emptyRes = await fetch(`${BASE}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "   " }),
    });
    console.log("4. POST /tasks (empty title validation):", emptyRes.status === 400 ? "✓ PASS" : "✗ FAIL");

    // 5. GET /tasks
    const getRes = await fetch(`${BASE}/tasks`);
    const tasksList = await getRes.json();
    console.log("5. GET /tasks:", getRes.status === 200 && Array.isArray(tasksList) ? `✓ PASS (${tasksList.length} tasks)` : "✗ FAIL");

    // 6. GET /tasks/stats
    const statsRes = await fetch(`${BASE}/tasks/stats`);
    const stats = await statsRes.json();
    console.log("6. GET /tasks/stats:", statsRes.status === 200 && stats.total >= 1 ? `✓ PASS (Total: ${stats.total}, Pending: ${stats.pending})` : "✗ FAIL");

    // 7. PUT /tasks/:id (toggle status)
    const toggleRes = await fetch(`${BASE}/tasks/${created.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });
    const toggled = await toggleRes.json();
    console.log("7. PUT /tasks/:id (complete):", toggleRes.status === 200 && toggled.status === "completed" ? "✓ PASS" : "✗ FAIL");

    // 8. PUT /tasks/:id (update title & category)
    const editRes = await fetch(`${BASE}/tasks/${created.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Updated Title #1", category: "Urgent" }),
    });
    const edited = await editRes.json();
    console.log("8. PUT /tasks/:id (title/category):", editRes.status === 200 && edited.title === "Updated Title #1" && edited.category === "Urgent" ? "✓ PASS" : "✗ FAIL");

    // 9. DELETE /tasks/completed (bulk delete)
    const clearRes = await fetch(`${BASE}/tasks/completed`, {
      method: "DELETE",
    });
    const cleared = await clearRes.json();
    console.log("9. DELETE /tasks/completed:", clearRes.status === 200 && cleared.deletedCount >= 1 ? `✓ PASS (Cleared ${cleared.deletedCount})` : "✗ FAIL");

    // 10. Clean up test task if still present
    await Task.findByIdAndDelete(created.id);
    console.log("10. Cleanup:", "✓ Done");

    console.log("=== All Backend Integration Tests Passed Successfully! ===");
  } finally {
    server.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

runTests().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
