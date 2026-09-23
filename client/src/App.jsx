import { useEffect, useState, useCallback, useRef } from "react";
import confetti from "canvas-confetti";
import TaskForm from "./components/TaskForm.jsx";
import TaskList from "./components/TaskList.jsx";
import {
  getTasks,
  createTask,
  toggleTask,
  updateTask,
  deleteTask,
  clearCompletedTasks,
} from "./api.js";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' | 'info' }
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("taskflow_theme") || "light";
  });

  const toastTimerRef = useRef(null);

  // Sync theme with document class and localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("taskflow_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const showToast = useCallback((message, type = "info") => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3200);
  }, []);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"],
      });
    } catch {
      // Ignore if confetti not supported
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await getTasks();
      const taskData = Array.isArray(res.data) ? res.data : [];
      setTasks(taskData);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        "Could not load tasks. Ensure backend server is running.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Global Keyboard shortcuts: N to focus task input, / to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if already inside an input/textarea/select
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") {
        if (e.key === "Escape") {
          document.activeElement?.blur();
        }
        return;
      }

      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        const input = document.getElementById("task-input");
        if (input) {
          input.focus();
        }
      } else if (e.key === "/") {
        e.preventDefault();
        const search = document.getElementById("search-input");
        if (search) {
          search.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleAdd = async (taskPayload) => {
    setSubmitting(true);
    try {
      const res = await createTask(taskPayload);
      setTasks((prev) => [res.data, ...prev]);
      showToast("Task added successfully!", "success");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add task.";
      showToast(msg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    const nextStatus = currentStatus === "pending" ? "completed" : "pending";
    const previousTasks = [...tasks];

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => {
        const taskId = t.id || t._id;
        return taskId === id ? { ...t, status: nextStatus } : t;
      })
    );

    // Trigger celebration if completing the final pending task!
    if (nextStatus === "completed") {
      const remainingPending = tasks.filter(
        (t) => (t.id || t._id) !== id && t.status === "pending"
      ).length;
      if (remainingPending === 0 && tasks.length > 0) {
        triggerConfetti();
      }
    }

    try {
      await toggleTask(id, nextStatus);
      showToast(
        nextStatus === "completed"
          ? "Task marked as completed! 🎉"
          : "Task marked as pending.",
        "success"
      );
    } catch (err) {
      setTasks(previousTasks);
      showToast("Failed to update task status.", "error");
    }
  };

  const handleUpdateTitle = async (id, newTitle, extraFields = {}) => {
    const previousTasks = [...tasks];

    setTasks((prev) =>
      prev.map((t) => {
        const taskId = t.id || t._id;
        return taskId === id
          ? { ...t, title: newTitle, ...extraFields }
          : t;
      })
    );

    try {
      await updateTask(id, { title: newTitle, ...extraFields });
      showToast("Task updated successfully!", "success");
    } catch (err) {
      setTasks(previousTasks);
      showToast("Failed to edit task.", "error");
    }
  };

  const handleDelete = async (id) => {
    const previousTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => (t.id || t._id) !== id));

    try {
      await deleteTask(id);
      showToast("Task deleted successfully.", "info");
    } catch (err) {
      setTasks(previousTasks);
      showToast("Failed to delete task.", "error");
    }
  };

  const handleClearCompleted = async () => {
    const completedTasks = tasks.filter((t) => t.status === "completed");
    if (completedTasks.length === 0) return;

    if (!window.confirm(`Clear all ${completedTasks.length} completed tasks?`)) {
      return;
    }

    const previousTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t.status !== "completed"));

    try {
      // Use atomic server-side clear completed endpoint
      await clearCompletedTasks().catch(() => {
        // Fallback to individual deletes if server lacks endpoint
        return Promise.all(
          completedTasks.map((t) => deleteTask(t.id || t._id))
        );
      });
      showToast(`Cleared ${completedTasks.length} completed tasks.`, "info");
    } catch (err) {
      setTasks(previousTasks);
      showToast("Failed to clear completed tasks.", "error");
    }
  };

  const handleExportTasks = () => {
    try {
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(tasks, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `taskflow-backup-${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast("Tasks exported to JSON file!", "success");
    } catch (err) {
      showToast("Failed to export tasks.", "error");
    }
  };

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const pendingCount = totalCount - completedCount;
  const highPriorityPendingCount = tasks.filter(
    (t) => t.priority === "high" && t.status === "pending"
  ).length;
  const completionRate =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30 text-slate-800 dark:text-slate-100 py-8 px-4 sm:py-12 transition-colors duration-300">
      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-bounce-short">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium backdrop-blur-md transition-all ${
              toast.type === "success"
                ? "bg-emerald-600 dark:bg-emerald-700 text-white border-emerald-500 shadow-emerald-500/20"
                : toast.type === "error"
                ? "bg-rose-600 dark:bg-rose-700 text-white border-rose-500 shadow-rose-500/20"
                : "bg-slate-800 dark:bg-slate-800 text-white border-slate-700 shadow-slate-900/30"
            }`}
          >
            {toast.type === "success" && (
              <svg
                className="w-4 h-4 text-emerald-200 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            {toast.type === "error" && (
              <svg
                className="w-4 h-4 text-rose-200 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
            {toast.type === "info" && (
              <svg
                className="w-4 h-4 text-indigo-300 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 text-white/70 hover:text-white text-xs cursor-pointer"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <main className="max-w-xl mx-auto">
        {/* Header Section */}
        <header className="mb-6">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 text-white">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>TaskFlow Manager</span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Organize, prioritize & execute your daily workflow
                </p>
              </div>
            </div>       
          </div>

          {/* Stats & Progress Bar */}
          <div className="mt-4 bg-white/85 dark:bg-slate-800/85 backdrop-blur-md rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                Daily Progress
              </span>
              <span className="flex items-center gap-1">
                <span className="font-bold text-slate-900 dark:text-white">{completionRate}%</span>
                <span>Completed</span>
              </span>
            </div>

            {/* Progress bar line */}
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700/70 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>

            {/* Counter badges */}
            <div className="grid grid-cols-4 gap-2 text-center pt-2 border-t border-slate-100 dark:border-slate-700/60">
              <div className="p-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Total</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{totalCount}</p>
              </div>
              <div className="p-1.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30">
                <p className="text-[11px] text-amber-600 dark:text-amber-400">Pending</p>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-300">{pendingCount}</p>
              </div>
              <div className="p-1.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30">
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400">Done</p>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{completedCount}</p>
              </div>
              <div className="p-1.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/30">
                <p className="text-[11px] text-rose-600 dark:text-rose-400">Urgent</p>
                <p className="text-sm font-bold text-rose-700 dark:text-rose-300">{highPriorityPendingCount}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Task Form Component */}
        <TaskForm onAdd={handleAdd} isSubmitting={submitting} />

        {/* Task List Component with Loading State */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="animate-pulse bg-white/70 dark:bg-slate-800/70 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
              >
                <div className="flex items-center gap-3 w-3/4">
                  <div className="w-5 h-5 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-2/3"></div>
                </div>
                <div className="w-12 h-4 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
              </div>
            ))}
          </div>
        ) : (
          <TaskList
            tasks={tasks}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onUpdateTitle={handleUpdateTitle}
            onClearCompleted={handleClearCompleted}
            onExportTasks={handleExportTasks}
          />
        )}

        {/* Footer */}
        <footer className="mt-10 pt-6 border-t border-slate-200/80 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-500">
          <p className="flex items-center justify-center gap-2">
            <span>TaskFlow Manager</span>
            <span>•</span>
          </p>
        </footer>
      </main>
    </div>
  );
}
