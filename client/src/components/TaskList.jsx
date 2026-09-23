import { useState, useMemo } from "react";
import TaskItem from "./TaskItem.jsx";

export default function TaskList({
  tasks,
  onToggle,
  onDelete,
  onUpdateTitle,
  onClearCompleted,
  onExportTasks,
}) {
  const [filter, setFilter] = useState("all"); // 'all' | 'pending' | 'completed'
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'oldest' | 'priority' | 'title' | 'dueDate'

  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;

  const priorityWeight = { high: 3, medium: 2, low: 1 };

  // Filter and sort computation
  const filteredTasks = useMemo(() => {
    let result = tasks.filter((task) => {
      // Status filter
      if (filter === "pending" && task.status !== "pending") return false;
      if (filter === "completed" && task.status !== "completed") return false;

      // Category filter
      if (categoryFilter !== "All" && (task.category || "General") !== categoryFilter) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesCategory = task.category?.toLowerCase().includes(query);
        return matchesTitle || matchesCategory;
      }

      return true;
    });

    // Sorting
    result = [...result].sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      if (sortBy === "priority") {
        const weightA = priorityWeight[a.priority] || 2;
        const weightB = priorityWeight[b.priority] || 2;
        if (weightB !== weightA) return weightB - weightA;
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "dueDate") {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      // default: newest
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return result;
  }, [tasks, filter, categoryFilter, searchQuery, sortBy]);

  // Overall empty (no tasks in database)
  if (tasks.length === 0) {
    return (
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-10 text-center border border-dashed border-slate-300 dark:border-slate-700 shadow-sm animate-fade-in">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 shadow-inner">
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.75"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">
          No tasks yet
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Start your productive flow! Use the input form above to add your first task.
        </p>
      </div>
    );
  }

  const categories = ["All", "Work", "Personal", "Study", "Urgent"];

  return (
    <div className="space-y-4">
      {/* Controls Bar: Status Filter + Search + Sort */}
      <div className="flex flex-col gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100/90 dark:bg-slate-900/60 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                filter === "all"
                  ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              All <span className="opacity-70 text-[10px]">({tasks.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilter("pending")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                filter === "pending"
                  ? "bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Pending <span className="opacity-70 text-[10px]">({pendingCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilter("completed")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                filter === "completed"
                  ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              Done <span className="opacity-70 text-[10px]">({completedCount})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort Selector */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-700 dark:text-slate-300 outline-none focus:border-indigo-400 cursor-pointer"
                title="Sort tasks"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priority">Priority (High-Low)</option>
                <option value="title">Alphabetical (A-Z)</option>
                <option value="dueDate">Due Date</option>
              </select>
            </div>

            {/* Search Field */}
            <div className="relative flex-1 sm:w-44">
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search (/)..."
                className="w-full text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-7 py-1.5 outline-none focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-900 text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
              />
              <svg
                className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100 dark:border-slate-700/50">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1 shrink-0">
            Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-0.5 text-[11px] font-medium rounded-full transition-all cursor-pointer shrink-0 ${
                categoryFilter === cat
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Task List Items or Contextual Empty State */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white/70 dark:bg-slate-800/70 rounded-2xl p-8 text-center border border-slate-200/80 dark:border-slate-700/80 shadow-sm animate-fade-in">
          <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-slate-700/60 text-slate-400 flex items-center justify-center mb-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {searchQuery.trim()
              ? `No tasks match "${searchQuery}"`
              : categoryFilter !== "All"
              ? `No tasks in "${categoryFilter}" category`
              : filter === "completed"
              ? "No completed tasks yet"
              : filter === "pending"
              ? "All caught up! No pending tasks"
              : "No tasks found"}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Try adjusting your search query, status, or category filters.
          </p>
          {(filter !== "all" || categoryFilter !== "All" || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setFilter("all");
                setCategoryFilter("All");
                setSearchQuery("");
              }}
              className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id || task._id}
              task={task}
              onToggle={onToggle}
              onDelete={onDelete}
              onUpdateTitle={onUpdateTitle}
            />
          ))}
        </ul>
      )}

      {/* Helper Bar: Showing count, Clear completed, Export JSON */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-xs text-slate-400 dark:text-slate-500">
        <span>
          Showing {filteredTasks.length} of {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
        </span>

        <div className="flex items-center gap-3">
          {/* Export JSON Button */}
          {tasks.length > 0 && onExportTasks && (
            <button
              type="button"
              onClick={onExportTasks}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 cursor-pointer font-medium"
              title="Download tasks as JSON backup"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <span>Export JSON</span>
            </button>
          )}

          {/* Bulk Clear Completed Button */}
          {completedCount > 0 && onClearCompleted && (
            <button
              type="button"
              onClick={onClearCompleted}
              className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors font-medium cursor-pointer"
            >
              Clear completed ({completedCount})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
